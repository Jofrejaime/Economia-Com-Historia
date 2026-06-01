# React Native Integration Guide

Complete guide for integrating the Economia com História API with React Native mobile application.

## Prerequisites

- React Native 0.72+
- Node.js 18+
- Expo (optional but recommended)
- axios or fetch API
- SecureStore for token storage
- AsyncStorage for user data

---

## 1. Environment Setup

### Install Dependencies

```bash
npm install axios expo-secure-store async-storage
# or
yarn add axios expo-secure-store async-storage
```

### Configure Environment Variables

Create `.env` file:

```env
# Development
API_URL=http://localhost:8000/api

# Production (update during build)
# API_URL=https://api.economia-historia.ao/api

STORAGE_KEY_TOKEN=economia_token
STORAGE_KEY_EXPIRY=economia_token_expiry
STORAGE_KEY_USER=economia_user
```

Load environment variables:

```javascript
// config/env.js
import Constants from 'expo-constants';

export const API_URL = 'http://localhost:8000/api';
export const STORAGE_KEY_TOKEN = 'economia_token';
export const STORAGE_KEY_EXPIRY = 'economia_token_expiry';
export const STORAGE_KEY_USER = 'economia_user';
```

---

## 2. Authentication Service

Create `services/authService.js`:

```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEY_TOKEN, STORAGE_KEY_EXPIRY, STORAGE_KEY_USER } from '../config/env';

let tokenRefreshTimeout;

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000
    });

    // Add token to requests
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async register(name, email, password, passwordConfirmation) {
    try {
      const response = await this.api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      await this.handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password
      });
      await this.handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout', {});
      await this.clearAuth();
      return { message: 'Logged out successfully' };
    } catch (error) {
      await this.clearAuth();
      throw this.handleError(error);
    }
  }

  async refreshToken() {
    try {
      const response = await this.api.post('/auth/refresh', {});
      await this.setToken(response.data.token);
      await this.setTokenExpiry(response.data.expires_at);
      this.scheduleTokenRefresh();
      return response.data;
    } catch (error) {
      await this.logout();
      throw this.handleError(error);
    }
  }

  // User Profile
  async getCurrentUser() {
    try {
      const response = await this.api.get('/me');
      await this.setUser(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Password Management
  async forgotPassword(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(email, token, password, passwordConfirmation) {
    try {
      const response = await this.api.post('/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email Verification
  async verifyEmail(token) {
    try {
      const response = await this.api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resendVerificationEmail() {
    try {
      const response = await this.api.post('/auth/resend-verification', {});
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Token Management
  async getToken() {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEY_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY_TOKEN, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async setTokenExpiry(expiryDate) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_EXPIRY, expiryDate);
    } catch (error) {
      console.error('Error storing expiry:', error);
    }
  }

  async isLoggedIn() {
    const token = await this.getToken();
    return !!token;
  }

  async isTokenExpired() {
    try {
      const expiry = await AsyncStorage.getItem(STORAGE_KEY_EXPIRY);
      if (!expiry) return true;
      return new Date() >= new Date(expiry);
    } catch (error) {
      return true;
    }
  }

  scheduleTokenRefresh() {
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
    }

    AsyncStorage.getItem(STORAGE_KEY_EXPIRY).then((expiry) => {
      if (!expiry) return;

      const expiryDate = new Date(expiry).getTime();
      const now = new Date().getTime();
      const refreshTime = expiryDate - now - (24 * 60 * 60 * 1000); // 24 hours before expiry

      if (refreshTime > 0) {
        tokenRefreshTimeout = setTimeout(() => {
          this.refreshToken().catch(() => {
            console.log('Token refresh failed, user needs to login again');
          });
        }, refreshTime);
      }
    });
  }

  async handleAuthResponse(response) {
    await this.setToken(response.token);
    await this.setTokenExpiry(response.expires_at);
    await this.setUser(response.user);
    this.scheduleTokenRefresh();
  }

  async clearAuth() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY_TOKEN);
      await AsyncStorage.multiRemove([STORAGE_KEY_EXPIRY, STORAGE_KEY_USER]);
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  async getUser() {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEY_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async setUser(user) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  handleError(error) {
    if (error.response) {
      const data = error.response.data;
      if (data.errors) {
        const fieldErrors = Object.keys(data.errors)
          .map(field => `${field}: ${data.errors[field].join(', ')}`)
          .join('\n');
        return new Error(fieldErrors);
      }
      return new Error(data.message || `Error: ${error.response.status}`);
    } else if (error.request) {
      return new Error('No response from server. Check your connection.');
    }
    return new Error(error.message || 'An error occurred');
  }
}

export default new AuthService();
```

---

## 3. Access Control Service

Create `services/accessService.js`:

```javascript
import { API_URL } from '../config/env';
import authService from './authService';

class AccessService {
  async getAccessLevels() {
    try {
      const response = await authService.api.get('/access-levels');
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async requestAccess(accessLevelId) {
    try {
      const response = await authService.api.post('/access-requests', {
        access_level_id: accessLevelId
      });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async getAccessRequests(status = null) {
    try {
      let url = '/access-requests';
      if (status) {
        url += `?status=${status}`;
      }
      const response = await authService.api.get(url);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async getAccessGrants() {
    try {
      const response = await authService.api.get('/access-grants');
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async hasAccessLevel(levelId) {
    try {
      const user = await authService.getUser();
      if (!user) return false;
      return user.access_grants?.some(g => g.access_level_id === levelId) || false;
    } catch (error) {
      return false;
    }
  }
}

export default new AccessService();
```

---

## 4. Notification Service

Create `services/notificationService.js`:

```javascript
import { API_URL } from '../config/env';
import authService from './authService';

class NotificationService {
  async getNotifications(unreadOnly = false) {
    try {
      let url = '/notifications';
      if (unreadOnly) {
        url += '?unread_only=true';
      }
      const response = await authService.api.get(url);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await authService.api.patch(
        `/notifications/${notificationId}/read`,
        {}
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async markAllAsRead() {
    try {
      const response = await authService.api.patch('/notifications/read-all', {});
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await authService.api.delete(
        `/notifications/${notificationId}`
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  }
}

export default new NotificationService();
```

---

## 5. Context for State Management

Create `context/AuthContext.js`:

```javascript
import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const loggedIn = await authService.isLoggedIn();
      if (loggedIn) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = {
    user,
    isLoading,
    register: async (name, email, password, passwordConfirmation) => {
      const response = await authService.register(name, email, password, passwordConfirmation);
      setUser(response.user);
      return response;
    },
    login: async (email, password) => {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    },
    logout: async () => {
      await authService.logout();
      setUser(null);
    },
    signUp: async (name, email, password, passwordConfirmation) => {
      const response = await authService.register(name, email, password, passwordConfirmation);
      setUser(response.user);
      return response;
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 6. Navigation Setup

Create `navigation/RootNavigator.js`:

```javascript
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' }
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animationEnabled: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icon name="home" />
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: () => <Icon name="users" />
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: () => <Icon name="bell" />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Icon name="user" />
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
```

---

## 7. Screen Examples

### Login Screen

Create `screens/auth/LoginScreen.js`:

```javascript
import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Economia com História</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15
  }
});

export default LoginScreen;
```

### Notifications Screen

Create `screens/notifications/NotificationsScreen.js`:

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import notificationService from '../../services/notificationService';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const renderNotification = ({ item }) => (
    <View style={[styles.card, !item.read_at && styles.cardUnread]}>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      {!item.read_at && (
        <TouchableOpacity
          style={styles.markButton}
          onPress={() => handleMarkAsRead(item.id)}
        >
          <Text style={styles.markButtonText}>Mark as read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No notifications</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 10
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc'
  },
  cardUnread: {
    borderLeftColor: '#007AFF'
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  time: {
    fontSize: 12,
    color: '#999'
  },
  markButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  markButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  }
});

export default NotificationsScreen;
```

---

## 8. App Setup

Update `App.js`:

```javascript
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
```

---

## Best Practices

✅ **DO:**
- Store tokens in SecureStore (encrypted)
- Store user data in AsyncStorage
- Implement automatic token refresh
- Show loading states during API calls
- Handle errors with user-friendly messages
- Validate input before submission
- Implement proper error boundaries

❌ **DON'T:**
- Store tokens in AsyncStorage (not encrypted)
- Make API calls in component render
- Forget to handle network errors
- Store sensitive data in AsyncStorage
- Block UI during API calls
- Expose error details to users
- Skip error handling

---

**Last Updated:** June 1, 2026
