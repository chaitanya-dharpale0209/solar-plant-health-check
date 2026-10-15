from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from enum import Enum


class HealthStatus(str, Enum):
    HEALTHY = "Healthy"
    NEEDS_ATTENTION = "Needs attention"
    UNDERPERFORMING = "Underperforming"
    UNKNOWN = "Unknown"


class IssueSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class Issue(BaseModel):
    date: Optional[str] = Field(None, description="Date of the issue or None if site-level pattern")
    issue_type: str = Field(..., description="Issue type: OUTAGE, SUDDEN_DROP, GRADUAL_DECLINE, SENSOR_FAULT")
    severity: IssueSeverity = Field(IssueSeverity.WARNING, description="Severity: critical, warning, info")
    title: str = Field(..., description="Short summary title")
    reason: str = Field(..., description="Human-readable explanation of why this was flagged")


class DataQualityFlag(BaseModel):
    site_id: Optional[str] = None
    date: str
    field: str
    raw_value: Optional[str] = None
    action_taken: str
    description: str


class DailyReading(BaseModel):
    date: str
    site_id: str
    capacity_kw: float
    generation_kwh: Optional[float] = None
    irradiance: Optional[float] = None
    cloud_cover: Optional[float] = None
    temperature: Optional[float] = None
    ideal_generation_kwh: Optional[float] = None
    pr: Optional[float] = None
    rolling_pr_7d: Optional[float] = None
    is_outage: bool = False
    is_low_irradiance: bool = False
    is_anomaly: bool = False
    status: Optional[str] = None
    flags: List[str] = Field(default_factory=list)


class PlantSummary(BaseModel):
    site_id: str
    name: str
    capacity_kw: float
    current_status: HealthStatus
    current_pr_7d: Optional[float] = None
    lifetime_avg_pr: Optional[float] = None
    total_generation_kwh: float = 0.0
    outage_days_count: int = 0
    total_days: int = 0
    issue_count: int = 0
    active_issues: List[Issue] = Field(default_factory=list)
    first_date: Optional[str] = None
    last_date: Optional[str] = None


class PlantDetailResponse(BaseModel):
    plant: PlantSummary
    daily_readings: List[DailyReading]
    issues: List[Issue]
    data_quality_log: List[DataQualityFlag]
    filter_start_date: Optional[str] = None
    filter_end_date: Optional[str] = None


class FleetOverviewResponse(BaseModel):
    plants: List[PlantSummary]
    total_fleet_capacity_kw: float
    total_fleet_generation_kwh: float
    fleet_health_summary: Dict[str, int]
    total_outage_events: int
    data_quality_issues_count: int
