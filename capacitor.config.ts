import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "foodhub.app",
  appName: "FOODHUB",
  webDir: ".output/public",
  bundledWebRuntime: false,
  server: {
    url: "https://foodhub.delivery",
    cleartext: false,
    allowNavigation: ["foodhub.delivery", "*.foodhub.delivery", "*.supabase.co"],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#020617",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#FFC72C",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK" as any,
      backgroundColor: "#020617",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body" as any,
      style: "DARK" as any,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
