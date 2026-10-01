import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native shell config for iOS + Android.
 * The entire game ships inside the binary, so core gameplay works offline.
 */
const config: CapacitorConfig = {
  appId: 'com.whatcouldgowrong.lifesim',
  appName: 'What Could Go Wrong?',
  webDir: 'dist',
  // The whole game is bundled into the binary: no server, no network needed.
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0d0b14',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#0d0b14',
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#ff5c8a',
    },
  },
};

export default config;
