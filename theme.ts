export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  ring: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarRing: string;
  background?: string;
  foreground?: string;
  // Allow for other optional properties that might exist in specific themes
  [key: string]: string | undefined;
}

export interface Theme {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const baseTheme: Theme = {
  name: "Base (Indigo)",
  light: {
    primary: "239 84% 67%",
    primaryForeground: "0 0% 100%",
    ring: "239 84% 67%",
    sidebarPrimary: "239 84% 67%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "239 84% 67%",
  },
  dark: {
    primary: "239 84% 67%",
    primaryForeground: "0 0% 100%",
    ring: "239 84% 67%",
    sidebarPrimary: "239 84% 67%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "239 84% 67%",
  },
};

export const borisTheme: Theme = {
  name: "Boris",
  light: {
    primary: "211 43% 30%",
    primaryForeground: "0 0% 100%",
    ring: "211 43% 30%",
    sidebarPrimary: "211 43% 30%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "211 43% 30%",
    background: "40 33% 95%",
    foreground: "15 24% 20%",
    card: "0 0% 100%",
    cardForeground: "15 24% 20%",
    muted: "40 20% 90%",
    mutedForeground: "24 26% 44%",
    border: "15 24% 20%",
    input: "0 0% 100%",
  },
  dark: {
    primary: "211 50% 45%",
    primaryForeground: "0 0% 100%",
    ring: "211 50% 45%",
    sidebarPrimary: "211 50% 45%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "211 50% 45%",
    background: "15 24% 12%",
    foreground: "40 33% 95%",
    card: "15 24% 16%",
    cardForeground: "40 33% 95%",
    muted: "15 20% 20%",
    mutedForeground: "24 26% 60%",
    border: "24 26% 30%",
    input: "15 24% 20%",
  },
};

export const modernLabTheme: Theme = {
  name: "Modern Lab",
  light: {
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    ring: "217 91% 60%",
    sidebarPrimary: "217 91% 60%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "217 91% 60%",
    tagBackground: "34 47% 85%",
    tagForeground: "16 20% 29%",
  },
  dark: {
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    ring: "217 91% 60%",
    sidebarPrimary: "217 91% 60%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "217 91% 60%",
    tagBackground: "16 20% 25%",
    tagForeground: "34 47% 85%",
  },
};

export const themes = [baseTheme, borisTheme, modernLabTheme];