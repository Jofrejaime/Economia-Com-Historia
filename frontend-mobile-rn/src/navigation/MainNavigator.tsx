// src/navigation/MainNavigator.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { MainStackParamList, MainTabParamList } from "../types/navigation";
import { appTheme } from "../constants/theme";

// Screens
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { HomeScreen as AuthHomeScreen } from "../screens/auth/HomeScreen";
import { ContentScreen } from "../screens/main/ContentScreen";
import { CommunityScreen } from "../screens/main/CommunityScreen";
import { QuizListScreen } from "../screens/main/QuizListScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { PodcastScreen } from "../screens/main/PodcastScreen";
import { ArticleScreen } from "../screens/main/ArticleScreen";
import { QuizScreen } from "../screens/main/QuizScreen";
import { QuizFeedbackScreen } from "../screens/main/QuizFeedbackScreen";
import { QuizResultScreen } from "../screens/main/QuizResultScreen";
import { CreateTopicScreen } from "../screens/main/CreateTopicScreen";
import { TopicDiscussionScreen } from "../screens/main/TopicDiscussionScreen";
import { PersonalInfoScreen } from "../screens/main/PersonalInfoScreen";
import { NotificationsScreen } from "../screens/main/NotificationsScreen";
import { NotificationPreferencesScreen } from "../screens/main/NotificationPreferencesScreen";
import { PrivacyScreen } from "../screens/main/PrivacyScreen";
import { SupportScreen } from "../screens/main/SupportScreen";
import { JindungoPermissionScreen } from "../screens/main/JindungoPermissionScreen";
import { LoginPromptScreen } from "../screens/main/LoginPromptScreen";
import { ManageMembersScreen } from "../screens/main/ManageMembersScreen";
import { MediaDetailScreen } from "../screens/main/MediaDetailScreen";

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function HomeTabScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  if (user) {
    return <DashboardScreen />;
  }

  return (
    <AuthHomeScreen
      onLogin={() => navigation.navigate("Login")}
      onRegister={() => navigation.navigate("Register")}
      onViewJindungo={() => navigation.navigate("JindungoPermission")}
      onViewArticle={() => navigation.navigate("Article", { type: "micro" })}
      onViewPodcast={() => navigation.navigate("Podcast")}
      onViewCommunity={() => navigation.navigate("Community")}
      onViewContent={() => navigation.navigate("Content")}
      onViewQuiz={() => navigation.navigate("QuizList")}
      onViewVideo={() => navigation.navigate("Content", { document_type: "video" })}
      onViewAudio={() => navigation.navigate("Content", { document_type: "audio" })}
    />
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Map route name to vector icons
        let iconName: any = "home";
        if (route.name === "Home") iconName = "home";
        else if (route.name === "Content") iconName = "trending-up";
        else if (route.name === "Community") iconName = "message-circle";
        else if (route.name === "QuizList") iconName = "award";
        else if (route.name === "Profile") iconName = "user";

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <Feather
              name={iconName}
              size={24}
              color={isFocused ? appTheme.colors.primary : appTheme.colors.textMuted}
              style={isFocused ? styles.activeIcon : undefined}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? appTheme.colors.primary : appTheme.colors.textMuted,
                  fontWeight: isFocused ? "700" : "400",
                },
              ]}
            >
              {label as string}
            </Text>
            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="Home" component={HomeTabScreen} options={{ title: "Início" }} />
      <Tabs.Screen name="Content" component={ContentScreen} options={{ title: "Conteúdos" }} />
      <Tabs.Screen name="Community" component={CommunityScreen} options={{ title: "Comunidade" }} />
      <Tabs.Screen name="QuizList" component={QuizListScreen} options={{ title: "Quiz" }} />
      {user ? (
        <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
      ) : null}
    </Tabs.Navigator>
  );
}

export function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="Dashboard" component={DashboardScreen} />
      <MainStack.Screen name="Login" component={LoginScreen} />
      <MainStack.Screen name="Register" component={RegisterScreen} />
      <MainStack.Screen name="Podcast" component={PodcastScreen} />
      <MainStack.Screen name="Article" component={ArticleScreen} />
      <MainStack.Screen name="MediaDetail" component={MediaDetailScreen} />
      <MainStack.Screen name="Quiz" component={QuizScreen} />
      <MainStack.Screen name="QuizFeedback" component={QuizFeedbackScreen} />
      <MainStack.Screen name="QuizResult" component={QuizResultScreen} />
      <MainStack.Screen name="CreateTopic" component={CreateTopicScreen} />
      <MainStack.Screen name="TopicDiscussion" component={TopicDiscussionScreen} />
      <MainStack.Screen name="ManageMembers" component={ManageMembersScreen} />
      <MainStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <MainStack.Screen name="Privacy" component={PrivacyScreen} />
      <MainStack.Screen name="Support" component={SupportScreen} />
      <MainStack.Screen name="JindungoPermission" component={JindungoPermissionScreen} />
      <MainStack.Screen name="LoginPrompt" component={LoginPromptScreen} />
    </MainStack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 76,
    backgroundColor: appTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    paddingHorizontal: 16,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
    paddingTop: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: appTheme.colors.primary,
    marginTop: 2,
  },
});