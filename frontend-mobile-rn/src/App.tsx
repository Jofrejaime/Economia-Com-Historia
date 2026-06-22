// App.tsx (raiz do projeto)
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import { CommunityProvider } from "./context/CommunityContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RootNavigator } from "./navigation/RootNavigator";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CommunityProvider>
          <ErrorBoundary>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ErrorBoundary>
        </CommunityProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}