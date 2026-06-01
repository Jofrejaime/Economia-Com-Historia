import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList, MainTabParamList } from "../types/navigation";
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { HomeScreen } from "../screens/main/HomeScreen";
import { ContentScreen } from "../screens/main/ContentScreen";
import { CommunityScreen } from "../screens/main/CommunityScreen";
import { QuizListScreen } from "../screens/main/QuizListScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { appTheme } from "../constants/theme";

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.textMuted,
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: "Início" }} />
      <Tabs.Screen name="Content" component={ContentScreen} options={{ title: "Conteúdo" }} />
      <Tabs.Screen name="Community" component={CommunityScreen} options={{ title: "Comunidade" }} />
      <Tabs.Screen name="QuizList" component={QuizListScreen} options={{ title: "Quiz" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tabs.Navigator>
  );
}

export function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="Dashboard" component={DashboardScreen} />
      <MainStack.Screen name="MainTabs" component={MainTabs} />
    </MainStack.Navigator>
  );
}
