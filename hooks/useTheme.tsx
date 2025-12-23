import { useColorScheme } from 'react-native';
import { baseTheme, THEMES, ThemeDefinition } from '../constants/theme';
import { useSettings } from './useSettings';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { settings } = useSettings();
  
  const getColorScheme = () => {
    if (settings.themeMode === 'system') {
      return systemColorScheme;
    }
    return settings.themeMode;
  };
  
  const isDark = getColorScheme() === 'dark';
  
  // Get selected theme or default
  const selectedTheme: ThemeDefinition = THEMES[settings.themeId] || THEMES.default;

  return {
    isDark,
    themeId: settings.themeId,
    themeName: selectedTheme.name,
    themeCategory: selectedTheme.category,
    isGradient: selectedTheme.isGradient || false,
    gradientColors: selectedTheme.gradientColors,
    colors: selectedTheme.colors,
    spacing: baseTheme.spacing,
    borderRadius: baseTheme.borderRadius,
    fontSize: baseTheme.fontSize,
    fontWeight: baseTheme.fontWeight,
    shadows: baseTheme.shadows,
  };
}
