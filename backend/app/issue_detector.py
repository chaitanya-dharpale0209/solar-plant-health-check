from datetime import datetime, timedelta
from typing import List, Tuple, Optional, Dict
from app.models import (
    DailyReading,
    PlantSummary,
    Issue,
    IssueSeverity,
    HealthStatus,
    DataQualityFlag,
)
from app.data_cleaner import CleanedRow, SITE_NAMES, SITE_CAPACITIES


def calculate_daily_metrics(
    rows: List[CleanedRow],
) -> Tuple[List[DailyReading], List[Issue], PlantSummary]:
    """
    Computes daily PR, 7-day rolling PR (excluding outages and low-irradiance days),
    detects Outages, Sudden Drops, and Gradual Decline, and assigns overall plant status.
    """
    site_id = rows[0].site_id if rows else "UNKNOWN"
    capacity_kw = rows[0].capacity_kw if rows else SITE_CAPACITIES.get(site_id, 50.0)
    plant_name = SITE_NAMES.get(site_id, f"Plant {site_id}")

    daily_readings: List[DailyReading] = []
    issues: List[Issue] = []

    # 1. Compute raw daily PR and initial flags
    for r in rows:
        flags: List[str] = []
        is_outage = False
        is_low_irradiance = False
        ideal_generation = None
        pr = None
        status = None

        if r.irradiance is not None:
            ideal_generation = round(r.capacity_kw * r.irradiance, 2)
            if r.irradiance < 1.0:
                is_low_irradiance = True
                flags.append("Low Irradiance (<1.0 kWh/m²)")

        # Outage check: 0 kWh on irradiance >= 1.0
        if r.generation_kwh is not None and r.irradiance is not None:
            if r.generation_kwh == 0.0 and r.irradiance >= 1.0:
                is_outage = True
                status = "Outage"
                flags.append("Outage")
                issues.append(
                    Issue(
                        date=r.date,
                        issue_type="OUTAGE",
                        severity=IssueSeverity.CRITICAL,
                        title=f"Plant Outage ({r.date})",
                        reason=(
                            f"Zero generation (0.0 kWh) recorded on {r.date} despite usable sunlight "
                            f"(irradiance: {r.irradiance:.2f} kWh/m²). Likely inverter trip or breaker disconnect."
                        ),
                    )
                )

        # PR calculation: PR = generation_kwh / (capacity_kw * irradiance)
        if (
            not is_outage
            and r.generation_kwh is not None
            and r.irradiance is not None
            and r.irradiance > 0
            and r.capacity_kw > 0
        ):
            raw_pr = r.generation_kwh / (r.capacity_kw * r.irradiance)
            # Physical sanity check on single day PR
            pr = round(raw_pr, 4)

        if r.is_anomaly:
            flags.append("Data Anomaly Sanitized")

        daily_readings.append(
            DailyReading(
                date=r.date,
                site_id=r.site_id,
                capacity_kw=r.capacity_kw,
                generation_kwh=r.generation_kwh,
                irradiance=r.irradiance,
                cloud_cover=r.cloud_cover,
                temperature=r.temperature,
                ideal_generation_kwh=ideal_generation,
                pr=pr,
                rolling_pr_7d=None,
                is_outage=is_outage,
                is_low_irradiance=is_low_irradiance,
                is_anomaly=r.is_anomaly,
                status=status,
                flags=flags,
            )
        )

    # 2. Compute 7-day rolling average PR
    # Rule: Leave outage days out of the average and skip days with irradiance < 1.0 kWh/m²
    # We evaluate for each day t the window of preceding 7 calendar days [t-6 days, t].
    # Build date lookup
    date_to_idx = {dr.date: idx for idx, dr in enumerate(daily_readings)}

    for idx, dr in enumerate(daily_readings):
        current_dt = datetime.strptime(dr.date, "%Y-%m-%d")
        window_prs: List[float] = []

        # Look back 7 calendar days: from (current_dt - 6 days) to current_dt
        for d_offset in range(7):
            past_dt = current_dt - timedelta(days=d_offset)
            past_date_str = past_dt.strftime("%Y-%m-%d")
            if past_date_str in date_to_idx:
                past_reading = daily_readings[date_to_idx[past_date_str]]
                # Exclude outage days, low irradiance (< 1.0), and invalid PR
                if (
                    not past_reading.is_outage
                    and not past_reading.is_low_irradiance
                    and past_reading.pr is not None
                ):
                    window_prs.append(past_reading.pr)

        if window_prs:
            rolling_avg = sum(window_prs) / len(window_prs)
            dr.rolling_pr_7d = round(rolling_avg, 4)
            # Assign daily status based on rolling PR if not an active outage day
            if not dr.is_outage:
                if dr.rolling_pr_7d >= 0.70:
                    dr.status = "Healthy"
                elif dr.rolling_pr_7d >= 0.60:
                    dr.status = "Needs attention"
                else:
                    dr.status = "Underperforming"
        else:
            if not dr.is_outage:
                dr.status = "Insufficient Data"

    # 3. Detect Pattern: Sudden Drop
    # Rule: the 7-day average PR falls by more than 20% compared with the 7 days before it.
    # That is: compare rolling_pr_7d on day t vs rolling_pr_7d on day t-7.
    sudden_drop_detected = False
    sudden_drop_onset_dates: List[str] = []

    for curr_reading in daily_readings:
        curr_dt = datetime.strptime(curr_reading.date, "%Y-%m-%d")
        prev_date_str = (curr_dt - timedelta(days=7)).strftime("%Y-%m-%d")
        if prev_date_str in date_to_idx:
            prev_reading = daily_readings[date_to_idx[prev_date_str]]

            if curr_reading.rolling_pr_7d is not None and prev_reading.rolling_pr_7d is not None:
                if prev_reading.rolling_pr_7d > 0:
                    drop_pct = (prev_reading.rolling_pr_7d - curr_reading.rolling_pr_7d) / prev_reading.rolling_pr_7d
                    if drop_pct > 0.20:
                        sudden_drop_detected = True
                        # Only create an issue for the initial onset or significant distinct drops
                        # Check if an onset was flagged within the last 14 days
                        recent_flags = [
                            d for d in sudden_drop_onset_dates
                            if abs((curr_dt - datetime.strptime(d, "%Y-%m-%d")).days) < 14
                        ]
                        if not recent_flags:
                            sudden_drop_onset_dates.append(curr_reading.date)
                            curr_reading.flags.append("Sudden Drop (>20%)")
                            issues.append(
                                Issue(
                                    date=curr_reading.date,
                                    issue_type="SUDDEN_DROP",
                                    severity=IssueSeverity.CRITICAL,
                                    title=f"Sudden Performance Drop ({curr_reading.date})",
                                    reason=(
                                        f"7-day rolling PR fell by {drop_pct * 100:.1f}% "
                                        f"(from {prev_reading.rolling_pr_7d:.3f} to {curr_reading.rolling_pr_7d:.3f}) "
                                        f"compared with the 7 days prior. Indicates rapid component failure, "
                                        f"sub-array isolation, or severe soiling event."
                                    ),
                                )
                            )

    # 4. Detect Pattern: Gradual Decline
    # Rule: average PR of the last 14 days is more than 10% lower than that of the first 14 days,
    # without a sudden drop.
    if len(daily_readings) >= 28:
        first_14 = daily_readings[:14]
        last_14 = daily_readings[-14:]

        first_14_prs = [
            dr.pr for dr in first_14
            if dr.pr is not None and not dr.is_outage and not dr.is_low_irradiance
        ]
        last_14_prs = [
            dr.pr for dr in last_14
            if dr.pr is not None and not dr.is_outage and not dr.is_low_irradiance
        ]

        if first_14_prs and last_14_prs:
            avg_first_14 = sum(first_14_prs) / len(first_14_prs)
            avg_last_14 = sum(last_14_prs) / len(last_14_prs)

            if avg_first_14 > 0:
                decline_pct = (avg_first_14 - avg_last_14) / avg_first_14
                if decline_pct > 0.10 and not sudden_drop_detected:
                    issues.append(
                        Issue(
                            date=last_14[0].date,
                            issue_type="GRADUAL_DECLINE",
                            severity=IssueSeverity.WARNING,
                            title="Gradual Performance Decline",
                            reason=(
                                f"Plant exhibits progressive degradation: last 14-day average PR ({avg_last_14:.3f}) "
                                f"is {decline_pct * 100:.1f}% lower than the initial 14-day baseline ({avg_first_14:.3f}) "
                                f"with no sudden drop detected. Indicates gradual soiling, module aging, PID, or seasonal shading."
                            ),
                        )
                    )

    # 5. Determine Current Plant Health Status
    # Judge plant's status on the 7-day rolling average of PR (latest available reading)
    latest_reading = daily_readings[-1] if daily_readings else None
    latest_rolling_pr = latest_reading.rolling_pr_7d if latest_reading else None

    # Fallback to the latest valid rolling PR if last day had missing data
    if latest_rolling_pr is None:
        for dr in reversed(daily_readings):
            if dr.rolling_pr_7d is not None:
                latest_rolling_pr = dr.rolling_pr_7d
                break

    if latest_rolling_pr is not None:
        if latest_rolling_pr >= 0.70:
            current_status = HealthStatus.HEALTHY
        elif latest_rolling_pr >= 0.60:
            current_status = HealthStatus.NEEDS_ATTENTION
        else:
            current_status = HealthStatus.UNDERPERFORMING
    else:
        current_status = HealthStatus.UNKNOWN

    # Calculate plant-wide aggregate stats
    total_gen = sum(dr.generation_kwh for dr in daily_readings if dr.generation_kwh is not None)
    outage_count = sum(1 for dr in daily_readings if dr.is_outage)
    valid_lifetime_prs = [
        dr.pr for dr in daily_readings
        if dr.pr is not None and not dr.is_outage and not dr.is_low_irradiance
    ]
    lifetime_avg_pr = round(sum(valid_lifetime_prs) / len(valid_lifetime_prs), 4) if valid_lifetime_prs else None

    summary = PlantSummary(
        site_id=site_id,
        name=plant_name,
        capacity_kw=capacity_kw,
        current_status=current_status,
        current_pr_7d=latest_rolling_pr,
        lifetime_avg_pr=lifetime_avg_pr,
        total_generation_kwh=round(total_gen, 1),
        outage_days_count=outage_count,
        total_days=len(daily_readings),
        issue_count=len(issues),
        active_issues=issues,
        first_date=daily_readings[0].date if daily_readings else None,
        last_date=daily_readings[-1].date if daily_readings else None,
    )

    return daily_readings, issues, summary
