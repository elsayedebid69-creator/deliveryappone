import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";

export interface PushTokenInfo {
  token: string;
  platform: "android" | "ios" | "web";
  createdAt: string;
}

/**
 * Initialize Push Notifications for FoodHub (Web & Mobile Native)
 */
export async function initPushNotifications(): Promise<string | null> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== "granted") {
        console.warn("Push notification permission was not granted on native device.");
        return null;
      }

      // Register with Apple APNS / Google FCM
      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener("registration", (token) => {
          console.log("Device Push Token received:", token.value);
          localStorage.setItem("foodhub_push_token", token.value);
          resolve(token.value);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("Push registration error:", err.error);
          resolve(null);
        });

        // Foreground notification received
        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          sounds.playNewOrder();
          toast(notification.title || "🔔 إشعار جديد من فود هب", {
            description: notification.body,
            duration: 6000,
          });
        });

        // User tapped notification
        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
          console.log("User tapped push notification:", notification.actionId);
        });
      });
    } catch (e) {
      console.warn("Could not register native push notifications:", e);
      return null;
    }
  }

  // Web Browser / PWA fallback
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        const webToken = "web_token_" + Math.random().toString(36).substring(7);
        localStorage.setItem("foodhub_push_token", webToken);
        return webToken;
      }
    } catch (err) {
      console.warn("Web notification request error:", err);
    }
  }

  return null;
}

/**
 * Trigger local in-app alert with audible chime
 */
export function sendLocalNotification(title: string, body: string, type: "kitchen" | "courier" | "order" = "order") {
  if (type === "kitchen") {
    sounds.playNewOrder();
  } else if (type === "courier") {
    sounds.playNotification();
  } else {
    sounds.playSuccess();
  }

  toast(title, {
    description: body,
    duration: 5000,
  });

  // Browser notification if permitted
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
      });
    } catch {
      // Ignored in browsers with service worker restrictions
    }
  }
}
