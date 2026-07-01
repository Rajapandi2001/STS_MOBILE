import React, { createContext, useContext, useState, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Color tokens
// ─────────────────────────────────────────────────────────────────────────────
export const lightColors = {
  // Backgrounds
  bg:           '#F1F5F9',
  bgScreen:     '#F8FAFC',
  card:         '#FFFFFF',
  cardAlt:      '#F8FAFC',
  input:        '#F8FAFC',
  // Borders
  border:       '#E2E8F0',
  borderLight:  '#F1F5F9',
  borderHeader: '#EEF2F7',
  // Text
  textPrimary:  '#0F172A',
  textSecond:   '#64748B',
  textMuted:    '#94A3B8',
  textEmpty:    '#CBD5E1',
  // Brand
  brand:        '#0A52D6',
  brandBg:      '#EFF6FF',
  brandBorder:  '#DBEAFE',
  brandDark:    '#1E3A8A',
  // Status
  success:      '#22C55E',
  successBg:    '#F0FDF4',
  successBorder:'#BBF7D0',
  successText:  '#16A34A',
  danger:       '#EF4444',
  dangerBg:     '#FEF2F2',
  amber:        '#F59E0B',
  // Header
  header:       '#FFFFFF',
  statusBar:    'dark-content' as 'dark-content' | 'light-content',
  // Tab bar
  tabBar:       '#FFFFFF',
  tabActive:    '#0A52D6',
  tabInactive:  '#64748B',
  // Modal
  modalBackdrop:'rgba(15,23,42,0.55)',
  // Icon containers
  iconBg:       '#EFF6FF',
  // Dropdown
  dropdownMenu: '#FFFFFF',
};

export const darkColors: typeof lightColors = {
  bg:           '#0F172A',
  bgScreen:     '#0F172A',
  card:         '#1E293B',
  cardAlt:      '#1E293B',
  input:        '#334155',
  border:       '#334155',
  borderLight:  '#1E293B',
  borderHeader: '#334155',
  textPrimary:  '#F1F5F9',
  textSecond:   '#94A3B8',
  textMuted:    '#64748B',
  textEmpty:    '#475569',
  brand:        '#3B82F6',
  brandBg:      '#1E3A5F',
  brandBorder:  '#1E40AF',
  brandDark:    '#93C5FD',
  success:      '#4ADE80',
  successBg:    '#052E16',
  successBorder:'#14532D',
  successText:  '#4ADE80',
  danger:       '#F87171',
  dangerBg:     '#450A0A',
  amber:        '#FCD34D',
  header:       '#1E293B',
  statusBar:    'light-content' as 'dark-content' | 'light-content',
  tabBar:       '#1E293B',
  tabActive:    '#3B82F6',
  tabInactive:  '#64748B',
  modalBackdrop:'rgba(0,0,0,0.75)',
  iconBg:       '#1E3A5F',
  dropdownMenu: '#1E293B',
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(prev => !prev);
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeContext);
}
