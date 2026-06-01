import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import { RootNavigator } from "./navigation/RootNavigator";
import { navigationTheme } from "./constants/theme";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
