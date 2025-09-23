// PWA Theme Color Updater Utility

export const updatePWAThemeColor = (character) => {
  const themeColors = {
    atomic: '#06b6d4',
    jahnvi: '#0ea5e9', 
    chandni: '#14b8a6',
    bhaiya: '#10b981',
    osho: '#f97316'
  };
  
  const themeColor = themeColors[character] || '#06b6d4';
  
  // Update meta theme-color (affects status bar in mobile browsers and PWA)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColor);
  }
  
  // Update CSS custom property for dynamic styling
  document.documentElement.style.setProperty('--pwa-theme-color', themeColor);
  
  // For installed PWA, log the change (manifest can't be updated dynamically)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA theme color updated to:', themeColor, 'for character:', character);
  }
  
  return themeColor;
};

export const getCharacterAccentColor = (character) => {
  const accentColors = {
    atomic: '#06b6d4',
    jahnvi: '#0ea5e9',
    chandni: '#14b8a6', 
    bhaiya: '#10b981',
    osho: '#f97316'
  };
  return accentColors[character] || '#06b6d4';
};
