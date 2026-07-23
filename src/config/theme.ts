export const themeConfig = {
  defaultTheme: "system" as const,
  storageKey: "eduearn-theme",
  cookieKey: "eduearn-theme-mode",
  
  // Custom transitions used in motion/framer animations
  transitions: {
    spring: { type: "spring", stiffness: 300, damping: 30 } as const,
    smooth: { type: "tween", ease: "easeInOut", duration: 0.3 } as const,
    fast: { type: "tween", ease: "easeOut", duration: 0.15 } as const,
  },
  
  // Responsive Breakpoints (matches task definition dimensions)
  breakpoints: {
    mobile: 360,
    phablet: 480,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
    wide: 1440,
    ultra: 1920,
  },
};
