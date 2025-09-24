import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GameScreen } from "./src/screens/GameScreen";

const Stack = createNativeStackNavigator();

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
        <Stack.Navigator
          initialRouteName="Game"
          screenOptions={{
            headerStyle: { backgroundColor: "#111c33" },
            headerTitleStyle: { color: "#f1f5f9" },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ title: "MapMates" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;