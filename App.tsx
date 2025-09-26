import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GameScreen } from "./src/screens/GameScreen";
import { MenuScreen } from "./src/screens/MenuScreen";
import { MapSettingsScreen } from "./src/screens/MapSettingsScreen";
import { RootStackParamList } from "./src/navigation/types";

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
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <Stack.Navigator initialRouteName="Game">
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Menu"
            component={MenuScreen}
            options={{ title: "Menu" }}
          />
          <Stack.Screen
            name="MapSettings"
            component={MapSettingsScreen}
            options={{ title: "Map settings" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;