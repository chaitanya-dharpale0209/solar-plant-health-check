export const COLORS = {
  // Backgrounds
  bgPrimary: '#0b0f19',
  bgSecondary: '#111827',
  bgCard: '#151d30',
  bgCardHover: '#1c2640',
  bgSurface: '#1f293d',
  bgElevated: '#25324d',
  
  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  borderFocus: '#f59e0b',
  
  // Solar & Energy Accents
  solarAmber: '#f59e0b',
  solarAmberLight: '#fbbf24',
  solarAmberDark: '#d97706',
  solarAmberGlow: 'rgba(245, 158, 11, 0.18)',
  
  // Irradiance & Sky Accents
  solarSky: '#38bdf8',
  solarSkyDark: '#0284c7',
  solarSkyGlow: 'rgba(56, 189, 248, 0.18)',
  
  // Performance Statuses
  healthy: '#10b981',
  healthyBg: 'rgba(16, 185, 129, 0.12)',
  healthyBorder: 'rgba(16, 185, 129, 0.3)',
  
  attention: '#f59e0b',
  attentionBg: 'rgba(245, 158, 11, 0.12)',
  attentionBorder: 'rgba(245, 158, 11, 0.3)',
  
  underperforming: '#ef4444',
  underperformingBg: 'rgba(239, 68, 68, 0.14)',
  underperformingBorder: 'rgba(239, 68, 68, 0.3)',
  
  outage: '#ef4444',
  outageBg: 'rgba(239, 68, 68, 0.22)',
  
  prTrend: '#a855f7',
  prTrendLight: '#c084fc',
  prTrendBg: 'rgba(168, 85, 247, 0.12)',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  
  // Metrics
  radiusSm: 6,
  radiusMd: 10,
  radiusLg: 14,
  radiusXl: 20,
};

export const getStatusColor = (status) => {
  if (status === 'Healthy') return COLORS.healthy;
  if (status === 'Needs attention') return COLORS.attention;
  if (status === 'Underperforming') return COLORS.underperforming;
  return COLORS.textMuted;
};

export const getStatusBg = (status) => {
  if (status === 'Healthy') return COLORS.healthyBg;
  if (status === 'Needs attention') return COLORS.attentionBg;
  if (status === 'Underperforming') return COLORS.underperformingBg;
  return 'rgba(255, 255, 255, 0.05)';
};

export const getStatusBorder = (status) => {
  if (status === 'Healthy') return COLORS.healthyBorder;
  if (status === 'Needs attention') return COLORS.attentionBorder;
  if (status === 'Underperforming') return COLORS.underperformingBorder;
  return COLORS.borderSubtle;
};
