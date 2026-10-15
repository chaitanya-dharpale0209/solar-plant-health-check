import React, { useState, useEffect } from 'react';
import {
  Sun,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import Overview from './components/Overview';
import PlantDetail from './components/PlantDetail';
import AuditModal from './components/AuditModal';

// Base URL for API requests: defaults to relative path (proxied in Vite or served by FastAPI)
// or can be overridden via VITE_API_URL for separate frontend/backend deployments
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DOCS_URL = API_BASE ? `${API_BASE}/docs` : '/docs';

export default function App() {
  const [fleetData, setFleetData] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plantDetail, setPlantDetail] = useState(null);
  const [allQualityLogs, setAllQualityLogs] = useState([]);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Fleet Overview
  const fetchFleet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/plants`);
      if (!res.ok) {
        throw new Error(`Failed to load fleet overview (HTTP ${res.status})`);
      }
      const data = await res.json();
      setFleetData(data);

      // Also fetch data quality audit logs
      const auditRes = await fetch(`${API_BASE}/data-quality-logs`);
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAllQualityLogs(auditData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to connect to backend API server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Single Plant Detail with Date Filters
  const fetchPlantDetail = async (plantId, start = '', end = '') => {
    setDetailLoading(true);
    try {
      let url = `${API_BASE}/plants/${plantId}`;
      const params = new URLSearchParams();
      if (start) params.append('start_date', start);
      if (end) params.append('end_date', end);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load plant telemetry for ${plantId}`);
      }
      const data = await res.json();
      setPlantDetail(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
    // Restore deep link (e.g. #/plant/S3) on first load
    const hash = window.location.hash;
    const match = hash.match(/^#\/plant\/([^/]+)$/);
    if (match) {
      setSelectedPlantId(match[1].toUpperCase());
      fetchPlantDetail(match[1].toUpperCase(), '', '');
    }
  }, []);

  const handleSelectPlant = (plantId) => {
    setSelectedPlantId(plantId);
    window.location.hash = `#/plant/${plantId}`;
    setFilterStartDate('');
    setFilterEndDate('');
    fetchPlantDetail(plantId, '', '');
  };

  const handleBackToOverview = () => {
    setSelectedPlantId(null);
    setPlantDetail(null);
    setFilterStartDate('');
    setFilterEndDate('');
    window.location.hash = '';
  };

  const handleDateFilterChange = (start, end) => {
    setFilterStartDate(start);
    setFilterEndDate(end);
    if (selectedPlantId) {
      fetchPlantDetail(selectedPlantId, start, end);
    }
  };

  // Browser back/forward navigation between Overview and Plant Detail
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/plant\/([^/]+)$/);
      if (match) {
        const plantId = match[1].toUpperCase();
        if (plantId !== selectedPlantId) handleSelectPlant(plantId);
      } else {
        setSelectedPlantId(null);
        setPlantDetail(null);
        setFilterStartDate('');
        setFilterEndDate('');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="brand" onClick={handleBackToOverview}>
          <div className="brand-icon">
            <Sun size={24} />
          </div>
          <div>
            <div className="brand-title">HelioPulse</div>
            <div className="brand-subtitle">Solar Plant Health &amp; Diagnostics</div>
          </div>
        </div>

        <div className="nav-actions">
          {selectedPlantId && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBackToOverview}
            >
              <span>← All Plants</span>
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAuditModal(true)}
            title="Inspect Sanitization Logs"
          >
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Audit Log</span>
          </button>

          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            title="Open Interactive Swagger API Documentation"
          >
            <span>Swagger API</span>
            <ExternalLink size={12} />
          </a>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (selectedPlantId) {
                fetchPlantDetail(selectedPlantId, filterStartDate, filterEndDate);
              }
              fetchFleet();
            }}
            title="Refresh Real-time Data"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading solar fleet telemetry &amp; calculating performance ratios...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div style={{ color: '#ef4444', marginBottom: '12px' }}>
              <ShieldCheck size={40} />
            </div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>Telemetry Service Offline</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchFleet}>
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : selectedPlantId && plantDetail ? (
          detailLoading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Filtering telemetry data for plant {selectedPlantId}...</p>
            </div>
          ) : (
            <PlantDetail
              plantData={plantDetail}
              onBack={handleBackToOverview}
              onDateFilterChange={handleDateFilterChange}
              filterStartDate={filterStartDate}
              filterEndDate={filterEndDate}
            />
          )
        ) : (
          <Overview
            fleetData={fleetData}
            onSelectPlant={handleSelectPlant}
            onViewAudit={() => setShowAuditModal(true)}
          />
        )}
      </main>

      {/* Audit Modal */}
      {showAuditModal && (
        <AuditModal
          logs={allQualityLogs}
          onClose={() => setShowAuditModal(false)}
        />
      )}
    </div>
  );
}
