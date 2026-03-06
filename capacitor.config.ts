import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.laserartlb.app',
  appName: 'LaserArtLB',
  webDir: 'dist',
  server: {
    url: 'https://laserartlb.com',
    cleartext: true
  }
};

export default config;
