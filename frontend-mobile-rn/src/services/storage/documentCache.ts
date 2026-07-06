import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Document } from "../../types/api";

const CACHE_PREFIX = "@doc_cache:";
const CACHE_INDEX_KEY = "@doc_cache_index";
const MAX_CACHED = 50;

export const documentCache = {
  async save(doc: Document): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${doc.id}`,
        JSON.stringify({ doc, cachedAt: Date.now() })
      );
      const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const updated = [doc.id, ...ids.filter((id) => id !== doc.id)].slice(0, MAX_CACHED);
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(updated));
    } catch { /* non-fatal */ }
  },

  async get(id: string): Promise<Document | null> {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${id}`);
      if (!raw) return null;
      return (JSON.parse(raw) as { doc: Document }).doc;
    } catch {
      return null;
    }
  },

  async getAll(): Promise<Document[]> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (!raw) return [];
      const ids: string[] = JSON.parse(raw);
      const docs = await Promise.all(ids.map((id) => this.get(id)));
      return docs.filter((d): d is Document => d !== null);
    } catch {
      return [];
    }
  },
};
