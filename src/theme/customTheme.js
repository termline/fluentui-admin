import { webLightTheme } from '@fluentui/react-components';

// Extend base theme with admin console specifics.
// Create a cohesive design system with consistent spacing, colors, and typography
export const adminTheme = {
  ...webLightTheme,
  
  // Background colors - create hierarchy
  colorNeutralBackground1: '#ffffff',        // Primary background (cards, panels)
  colorNeutralBackground1Hover: '#f8f9fa',   // Subtle hover state
  colorNeutralBackground2: '#f5f6f7',        // Secondary background (page background)
  colorNeutralBackground3: '#eaeaea',        // Tertiary background
  colorNeutralBackground3Hover: '#f2f2f2',   // Active item background
  
  // Stroke colors - refined borders
  colorNeutralStroke1: '#d1d1d1',            // Strong borders
  colorNeutralStroke2: '#e5e5e5',            // Default borders (softer)
  
  // Text colors - improved hierarchy
  colorNeutralForeground1: '#242424',        // Primary text
  colorNeutralForeground2: '#616161',        // Secondary text 
  colorNeutralForeground3: '#757575',        // Tertiary text (disabled, subtle)
  
  // Brand colors
  colorBrandBackground: '#0078d4',
  colorBrandForeground1: '#0078d4',
  
  // Semantic colors
  colorPaletteRedBackground3: '#fdf2f2',
  colorPaletteGreenBackground3: '#f0f9f0',
  colorPaletteYellowBackground3: '#fefbf0',
  
  // Component-specific tokens
  borderRadiusMedium: '6px',
  borderRadiusLarge: '8px',
  
  // Shadows for elevation
  shadow4: '0 2px 8px rgba(0,0,0,0.1)',
  shadow8: '0 4px 16px rgba(0,0,0,0.12)',
  shadow16: '0 8px 32px rgba(0,0,0,0.14)'
};
