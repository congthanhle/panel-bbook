import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#6366f1', // Indigo 500
    colorSuccess: '#10b981', // Emerald 500
    colorInfo: '#3b82f6',    // Blue 500
    colorWarning: '#f59e0b', // Amber 500
    colorError: '#ef4444',   // Red 500
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f9fafb',
    colorBorder: '#e5e7eb',
  },
  components: {
    Button: {
      colorPrimary: '#6366f1',
      colorPrimaryHover: '#4f46e5',
      colorPrimaryActive: '#4338ca',
      borderRadius: 6,
    },
    Card: {
      borderRadius: 12,
    },
  },
};
