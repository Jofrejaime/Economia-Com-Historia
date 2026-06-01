import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setLocalItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getLocalItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export async function removeLocalItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
