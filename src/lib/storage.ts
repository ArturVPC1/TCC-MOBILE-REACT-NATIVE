import AsyncStorage from '@react-native-async-storage/async-storage';

export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function save<T>(key: string, value: T) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function remove(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}
