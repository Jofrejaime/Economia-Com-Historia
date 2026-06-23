# Guia de Integração React Native (Frontend Mobile)

Este documento fornece as diretrizes, padrões e exemplos de código para integrar o aplicativo móvel desenvolvido em React Native com a API do portal **Economia Com História**.

---

## 1. Persistência de Sessão com AsyncStorage

Para manter o utilizador autenticado entre aberturas do aplicativo, utilizamos o `@react-native-async-storage/async-storage` para persistir o token JWT de sessão.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@EconomiaComHistoria:token';
const USER_KEY = '@EconomiaComHistoria:user';

export const SessionManager = {
  async saveSession(token: string, user: any): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }
};
```

---

## 2. Cliente HTTP Axios com Interceptor

Configuração de uma instância global do Axios com cabeçalhos automáticos e tratamento centralizado de respostas não autorizadas (401).

```typescript
import axios from 'axios';
import { SessionManager } from './SessionManager';

const api = axios.create({
  baseURL: 'http://<sua-api-url>/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor de Requisição para injetar o Token Bearer
api.interceptors.request.use(
  async (config) => {
    const token = await SessionManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta para capturar erros 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await SessionManager.clearSession();
      // Lógica de navegação para ecra de login (ex: via RootNavigation)
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Refresh de Dados (Pull-to-Refresh)

Exemplo de ecrã móvel em React Native utilizando `FlatList` e o componente `RefreshControl` para recarregar o feed de documentos do backend.

```typescript
import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Text, View, StyleSheet, RefreshControl } from 'react-native';
import api from './api';

export default function DocumentListScreen() {
  const [documents, setDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: 'bold' },
  author: { fontSize: 14, color: '#666', marginTop: 4 }
});
```

---

## 4. Integração de Notificações Locais

No dispositivo móvel, as notificações enviadas pelo backend Laravel via `POST /api/notifications` podem ser exibidas através da biblioteca Expo Notifications ou similar.

Exemplo de registo de token no dispositivo React Native:
```typescript
import * as Notifications from 'expo-notifications';

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Permissão de notificações rejeitada!');
    return;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push Token do Dispositivo:', token);
  
  // Enviar token ao backend se houver rota configurada (opcional para notificações push)
}
```
