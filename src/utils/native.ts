// Capacitor Native Features
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Check if running in native mobile app
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get platform (ios, android, web)
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Get current location (GPS)
 * Falls back to browser geolocation on web
 */
export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    if (isNativePlatform()) {
      // Request permission first
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location === 'denied') {
        const request = await Geolocation.requestPermissions();
        if (request.location === 'denied') {
          console.log('Location permission denied');
          return null;
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } else {
      // Web fallback (existing code)
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    }
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Take photo with camera
 * @returns Base64 image string
 */
export const takePicture = async (): Promise<string | null> => {
  try {
    if (!isNativePlatform()) {
      console.log('Camera only available in native app');
      return null;
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    return image.base64String || null;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

/**
 * Pick image from gallery
 * @returns Base64 image string
 */
export const pickImage = async (): Promise<string | null> => {
  try {
    if (!isNativePlatform()) {
      console.log('Gallery only available in native app');
      return null;
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });

    return image.base64String || null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

/**
 * Initialize push notifications
 */
export const initPushNotifications = async (): Promise<void> => {
  if (!isNativePlatform()) {
    console.log('Push notifications only available in native app');
    return;
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Listen for registration success
    await PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      // TODO: Send token to your backend
    });

    // Listen for registration errors
    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Listen for push notifications received
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    // Listen for push notification tapped
    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
    });
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

/**
 * Trigger haptic feedback (vibration)
 */
export const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }[style];

    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('Error triggering haptic:', error);
  }
};

/**
 * Share content (native share dialog)
 */
export const shareContent = async (options: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<void> => {
  try {
    if (isNativePlatform()) {
      await Share.share(options);
    } else {
      // Web fallback
      if (navigator.share) {
        await navigator.share(options);
      } else {
        console.log('Share not supported on this browser');
      }
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

/**
 * Set status bar style
 */
export const setStatusBarStyle = async (dark: boolean): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
  } catch (error) {
    console.error('Error setting status bar style:', error);
  }
};

/**
 * Hide status bar
 */
export const hideStatusBar = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Error hiding status bar:', error);
  }
};

/**
 * Show status bar
 */
export const showStatusBar = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Error showing status bar:', error);
  }
};
