import React, { useState, useEffect, useCallback } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './src/theme/colors';
import Header from './src/components/Header';
import OverviewScreen from './src/screens/OverviewScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import AuditModal from './src/components/AuditModal';
import SplashScreen from './src/components/SplashScreen';
import {
  fetchFleetOverview,
  fetchPlantDetail,
  fetchQualityLogs,
} from './src/services/solarApi';

export default function App() {
  const [fleetData, setFleetData] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plantDetail, setPlantDetail] = useState(null);
  const [qualityLogs, setQualityLogs] = useState([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState(null);

  // Load Fleet Overview
  const loadFleet = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const { data, isFallback: fallbackActive } = await fetchFleetOverview();
      setFleetData(data);
      setIsFallback(fallbackActive);

      // Also load data quality logs
      const { data: logs } = await fetchQualityLogs();
      setQualityLogs(logs || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to connect to telemetry service.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load Plant Detail
  const loadPlantDetail = useCallback(async (plantId, start = '', end = '') => {
    setDetailLoading(true);
    try {
      const { data, isFallback: fallbackActive } = await fetchPlantDetail(plantId, start, end);
      setPlantDetail(data);
      if (fallbackActive) setIsFallback(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Telemetry Error', `Unable to load telemetry for plant ${plantId}`);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const handleSelectPlant = (plantId) => {
    setSelectedPlantId(plantId);
    setFilterStartDate('');
    setFilterEndDate('');
    loadPlantDetail(plantId, '', '');
  };

  const handleBackToOverview = () => {
    setSelectedPlantId(null);
    setPlantDetail(null);
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleDateFilterChange = (start, end) => {
    setFilterStartDate(start);
    setFilterEndDate(end);
    if (selectedPlantId) {
      loadPlantDetail(selectedPlantId, start, end);
    }
  };

  const handleRefresh = () => {
    if (selectedPlantId) {
      loadPlantDetail(selectedPlantId, filterStartDate, filterEndDate);
    }
    loadFleet(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />

      <View style={styles.appContainer}>
        {/* Mobile Header Bar */}
        <Header
          isDetailView={Boolean(selectedPlantId)}
          plantId={selectedPlantId}
          onBack={handleBackToOverview}
          onOpenAudit={() => setShowAuditModal(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isFallback={isFallback}
        />

        {/* Screen Switcher */}
        {selectedPlantId ? (
          <PlantDetailScreen
            plantData={plantDetail}
            loading={detailLoading}
            onBack={handleBackToOverview}
            onDateFilterChange={handleDateFilterChange}
            filterStartDate={filterStartDate}
            filterEndDate={filterEndDate}
          />
        ) : (
          <OverviewScreen
            fleetData={fleetData}
            loading={loading}
            error={error}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onSelectPlant={handleSelectPlant}
            onOpenAudit={() => setShowAuditModal(true)}
          />
        )}

        {/* Fleet-Wide Data Quality Audit Modal */}
        <AuditModal
          visible={showAuditModal}
          logs={qualityLogs}
          onClose={() => setShowAuditModal(false)}
        />

        {/* Animated Oorjan Splash Screen */}
        {showSplash && (
          <SplashScreen
            isReady={!loading && Boolean(fleetData)}
            onFinish={() => setShowSplash(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
});
