import type { CapacitorConfig } from "@capacitor/cli";
import { getMobileApp } from "./scripts/mobile-apps";

const app = getMobileApp(process.env.FOODHUB_APP);

const config: CapacitorConfig = {
  appId: app.id,
  appName: app.name,
  webDir: "dist/mobile",
  server: {
    url: app.url,
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
