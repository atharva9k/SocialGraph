import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'galaxy' | 'cyber' | 'light' | 'synthwave';
export type SpaceDisplayMode = 'orbital' | 'cards';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  spaceMode: SpaceDisplayMode;
  setSpaceMode: (mode: SpaceDisplayMode) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  warpActive: boolean;
  triggerWarp: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('sg_theme') as AppTheme) || 'light';
  });

  const [spaceMode, setSpaceModeState] = useState<SpaceDisplayMode>(() => {
    return (localStorage.getItem('sg_space_mode') as SpaceDisplayMode) || 'orbital';
  });

  const [particlesEnabled, setParticlesEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem('sg_particles');
    return val !== null ? val === 'true' : true;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem('sg_sound');
    return val !== null ? val === 'true' : true;
  });

  const [warpActive, setWarpActive] = useState(false);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('sg_theme', newTheme);
  };

  const setSpaceMode = (mode: SpaceDisplayMode) => {
    setSpaceModeState(mode);
    localStorage.setItem('sg_space_mode', mode);
  };

  const setParticlesEnabled = (enabled: boolean) => {
    setParticlesEnabledState(enabled);
    localStorage.setItem('sg_particles', String(enabled));
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('sg_sound', String(enabled));
  };

  const triggerWarp = () => {
    setWarpActive(true);
    setTimeout(() => setWarpActive(false), 900);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-galaxy', 'theme-cyber', 'theme-light', 'theme-synthwave');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        spaceMode,
        setSpaceMode,
        particlesEnabled,
        setParticlesEnabled,
        soundEnabled,
        setSoundEnabled,
        warpActive,
        triggerWarp
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
