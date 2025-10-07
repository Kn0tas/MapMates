import 'dotenv/config';
import { ConfigContext, ExpoConfig } from "@expo/config";

const DEFAULT_MULTIPLAYER_URL = "https://mapmates-production.up.railway.app";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MapMates",
  slug: "mapmates",
  version: "1.0.1",
  orientation: "portrait",
  userInterfaceStyle: "light",
  jsEngine: "hermes",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    package: "com.mapmates.game",
    versionCode: 2,
    adaptiveIcon: {
      backgroundColor: "#10172A",
      foregroundImage: "./assets/icon.png",
    },
  },
  web: {
    bundler: "metro",
  },
  extra: {
    eas: {
      projectId: "2dbc574c-a6bf-4bee-a72a-5ff8dc8dca42",
    },
    multiplayerUrl:
      process.env.EXPO_PUBLIC_MULTIPLAYER_URL ?? DEFAULT_MULTIPLAYER_URL,
  },
  icon: "./assets/icon.png",
});

