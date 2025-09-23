import { webLightTheme } from '@fluentui/react-components';

// Extend base theme with admin console specifics.
// Only override the tokens we actually need now.
export const adminTheme = {
  ...webLightTheme,
  colorNeutralBackground1: '#ffffff',
  colorNeutralBackground1Hover: '#ffffff',
  // Active item gray (used in component makeStyles instead of hardcoding hex)
  // We'll map this to colorNeutralBackground3Hover slot so generic hover styles could still work if needed.
  colorNeutralBackground3Hover: '#f2f2f2',
  // Slightly softer divider line
  colorNeutralStroke2: '#e5e5e5',
};
