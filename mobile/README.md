# 📱 Oorjan Mobile — React Native Solar Plant Health & Diagnostics

> **Full Mobile Application Version (React Native + Expo)**  
> 100% Feature-parity with the Oorjan Web Application: real-time telemetry monitoring, dual-axis interactive generation charts, rule-based Performance Ratio (PR) analytics, threshold bands, fault pattern recognition, and offline resilience across 5 solar power installations over 90 days.

---

## 🌟 Key Features

1. **Fleet Executive Summary**:
   - 4 Live KPI Cards (Fleet Rated Capacity: 315 kW, 90-Day Energy: 105.0 MWh, Health Breakdown: 3 Good / 1 Attn / 1 Under, Outage Incidents: 6).
   - Color-coded status pills: `Healthy` (Emerald), `Needs attention` (Amber), `Underperforming` (Ruby).
2. **Interactive Solar Plant Cards**:
   - Plant identity badges, rated capacity, 90-day generation totals, and outage days.
   - Dynamic 7-day rolling Performance Ratio progress bar with 70% reference threshold indicator.
   - Active issue alert chips (e.g. *Sudden Drop >20%*, *Repeated Outages*, *Gradual Decline*).
3. **Interactive Dual-Axis Telemetry Chart**:
   - Daily Energy Generation (kWh) area/line curve overlaid with incident Solar Irradiance (kWh/m²) dashed curve.
   - Outage days highlighted with red markers and `"OUTAGE"` flags.
   - Touch/drag crosshair to inspect exact metrics for any day.
4. **Performance Ratio (PR) Health Trend Chart**:
   - 7-day rolling PR bold curve with daily PR scatter points.
   - 0.70 Healthy and 0.60 Attention threshold lines with color-graded status background bands.
   - Sudden performance drop markers indicating failure onset dates.
5. **Operational Faults & Rule-Based Diagnostics**:
   - Outage detection ($0\text{ kWh}$ on irradiance $\ge 1.0\text{ kWh/m}^2$).
   - Sudden drop detection (rolling PR falls by $>20\%$ vs. 7 days prior).
   - Gradual degradation detection (last 14 days $>10\%$ lower than first 14 days without sudden drop).
   - Readable root-cause explanations (inverter disconnects, sub-array failure, panel soiling).
6. **Daily Telemetry Data Table**:
   - Horizontal and vertical scrolling timeseries with pagination.
   - Highlights outage rows in crimson.
7. **Date Range Filtering**:
   - Horizontal scrolling presets: *All 90 Days*, *Jan*, *Feb*, *Mar*, *First 14d*, *Last 14d*.
   - Custom `YYYY-MM-DD` start and end date inputs with quick reset.
8. **Fleet Data Quality Audit Modal**:
   - Audit trail of dropped duplicates, rejected sensor spikes (such as S2's 48,210 kWh spike), rejected negative readings, and clamped cloud percentages.
9. **Zero-Configuration Offline Resilience**:
   - If the backend is running, the app connects live (`/plants`, `/plants/{id}`).
   - If offline, the app seamlessly activates the built-in 90-day telemetry dataset (`fallbackData.js`), ensuring the app **always works reliably** without network dependency.

---

## 🚀 Quickstart & How to Run

### Prerequisites
- Node.js (v18+)
- Smartphone with **Expo Go** app installed ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) / [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)), OR a web browser / emulator.

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the App
```bash
npm start
```
*(or `npx expo start`)*

### 3. Open on your Device
- **On Physical Phone (iPhone / Android)**:
  - Open camera (iOS) or the **Expo Go** app (Android) and scan the QR code in your terminal.
- **In Web Browser**:
  - Press `w` in your terminal to immediately launch the mobile app in your browser!
- **On Android Emulator**:
  - Press `a` in your terminal.
- **On iOS Simulator** (macOS):
  - Press `i` in your terminal.

---

## 🌐 Connecting to Backend API

The app configuration lives in [`src/config/api.js`](src/config/api.js):
- **Local Dev Server**:
  - Automatically routes to `http://localhost:8000` on iOS/Web or `http://10.0.2.2:8000` on Android emulator.
- **Cloud Backend (Render / Remote)**:
  - Update `PRODUCTION_API` in `src/config/api.js` to your deployed backend URL:
    ```javascript
    export const PRODUCTION_API = 'https://solar-plant-health-check.onrender.com';
    ```
- **Offline Fallback**:
  - If your backend is sleeping or unreachable, the mobile app automatically falls back to full local telemetry data with zero interruptions.

---

## 📂 Project Architecture

```
mobile/
├── App.js                     # Root component with state management & navigation
├── index.js                   # Expo root entry point
├── app.json                   # Expo app configuration
├── package.json               # Dependencies (React Native, Expo, react-native-svg)
├── metro.config.js            # Monorepo asset and fallback data watcher
├── babel.config.js            # Babel preset configuration
└── src/
    ├── config/
    │   └── api.js             # API base URL & offline fallback settings
    ├── data/
    │   ├── fallbackData.js    # Telemetry data provider
    │   └── fallbackData.json  # Complete 90-day fleet telemetry archive
    ├── theme/
    │   └── colors.js          # Solar-tech dark design system
    ├── services/
    │   └── solarApi.js        # API service layer with local fallback
    ├── components/
    │   ├── Header.jsx         # App navigation bar with status indicator
    │   ├── KpiCard.jsx        # Fleet KPI summary card
    │   ├── PlantCard.jsx      # Solar plant card with PR progress meter
    │   ├── StatusBadge.jsx    # Health status pill (Healthy / Attn / Under)
    │   ├── GenerationChart.jsx # Dual-axis energy vs irradiance SVG chart
    │   ├── PerformanceRatioChart.jsx # PR curve with 0.70 & 0.60 threshold bands
    │   ├── IssueCard.jsx      # Diagnostic fault report card
    │   ├── DateFilterToolbar.jsx # Quick presets & custom date range picker
    │   ├── TelemetryTable.jsx # Scrollable daily reading archive
    │   └── AuditModal.jsx     # Fleet-wide data sanitization log modal
    └── screens/
        ├── OverviewScreen.jsx # Fleet overview with KPIs & 5 plant cards
        └── PlantDetailScreen.jsx # Full plant analytics, charts, & telemetry
```
