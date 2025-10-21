import React from "react";
import {
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GameScreen } from "./src/screens/GameScreen";
import { MenuScreen } from "./src/screens/MenuScreen";
import { CampaignScreen } from "./src/screens/CampaignScreen";
import { MapSettingsScreen } from "./src/screens/MapSettingsScreen";
import { RootStackParamList } from "./src/navigation/types";
import { MultiplayerHomeScreen } from "./src/screens/multiplayer/MultiplayerHomeScreen";
import { MultiplayerCreateScreen } from "./src/screens/multiplayer/MultiplayerCreateScreen";
import { MultiplayerJoinScreen } from "./src/screens/multiplayer/MultiplayerJoinScreen";
import { MultiplayerLobbyScreen } from "./src/screens/multiplayer/MultiplayerLobbyScreen";
import { MultiplayerGameScreen } from "./src/screens/multiplayer/MultiplayerGameScreen";
import { MultiplayerResultsScreen } from "./src/screens/multiplayer/MultiplayerResultsScreen";
import { StatesGameScreen } from "./src/screens/StatesGameScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0b1120",
    card: "#111c33",
    text: "#e2e8f0",
    primary: "#2563eb",
    border: "#1e293b",
  },
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            initialRouteName="Game"
            screenOptions={{
            headerStyle: { backgroundColor: "#0b1120" },
            headerTintColor: "#f8fafc",
            headerTitleStyle: { fontWeight: "700", fontSize: 18 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: "#0b1120" },
            statusBarStyle: "light",
          }}
        >
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StatesGame"
            component={StatesGameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Menu"
            component={MenuScreen}
            options={{ title: "Menu" }}
          />
          <Stack.Screen
            name="Campaign"
            component={CampaignScreen}
            options={{ title: "Campaign" }}
          />
          <Stack.Screen
            name="MapSettings"
            component={MapSettingsScreen}
            options={{ title: "Map settings" }}
          />

          <Stack.Screen
            name="MultiplayerHome"
            component={MultiplayerHomeScreen}
            options={{ title: "Multiplayer" }}
          />
          <Stack.Screen
            name="MultiplayerCreate"
            component={MultiplayerCreateScreen}
            options={{ title: "Create game" }}
          />
          <Stack.Screen
            name="MultiplayerJoin"
            component={MultiplayerJoinScreen}
            options={{ title: "Join game" }}
          />
          <Stack.Screen
            name="MultiplayerLobby"
            component={MultiplayerLobbyScreen}
            options={{ title: "Lobby" }}
          />
          <Stack.Screen
            name="MultiplayerGame"
            component={MultiplayerGameScreen}
            options={{ title: "Multiplayer match" }}
          />
          <Stack.Screen
            name="MultiplayerResults"
            component={MultiplayerResultsScreen}
            options={{ title: "Results" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </GestureHandlerRootView>
  );
};

export default App;

