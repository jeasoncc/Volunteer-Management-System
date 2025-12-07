import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Scripture} from '../types';

interface Bookmark {
  scriptureId: string;
  position: number; // 滚动位置
  timestamp: number;
}

interface ReadingHistory {
  scriptureId: string;
  lastRead: number;
  readCount: number;
}

interface ScriptureContextType {
  favorites: string[]; // 收藏的经文 ID 列表
  bookmarks: Bookmark[]; // 书签列表
  readingHistory: ReadingHistory[]; // 阅读历史
  addFavorite: (scriptureId: string) => Promise<void>;
  removeFavorite: (scriptureId: string) => Promise<void>;
  isFavorite: (scriptureId: string) => boolean;
  addBookmark: (scriptureId: string, position: number) => Promise<void>;
  removeBookmark: (scriptureId: string) => Promise<void>;
  getBookmark: (scriptureId: string) => Bookmark | undefined;
  updateReadingHistory: (scriptureId: string) => Promise<void>;
  getReadingHistory: (scriptureId: string) => ReadingHistory | undefined;
  clearAll: () => Promise<void>;
}

const ScriptureContext = createContext<ScriptureContextType | undefined>(undefined);

const STORAGE_KEYS = {
  favorites: 'scripture_favorites',
  bookmarks: 'scripture_bookmarks',
  readingHistory: 'scripture_reading_history',
};

export function ScriptureProvider({children}: {children: ReactNode}) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 加载收藏
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.favorites);
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }

      // 加载书签
      const bookmarksData = await AsyncStorage.getItem(STORAGE_KEYS.bookmarks);
      if (bookmarksData) {
        setBookmarks(JSON.parse(bookmarksData));
      }

      // 加载阅读历史
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.readingHistory);
      if (historyData) {
        setReadingHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('加载读经数据失败:', error);
    }
  };

  const addFavorite = async (scriptureId: string) => {
    try {
      const newFavorites = [...favorites, scriptureId];
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('添加收藏失败:', error);
    }
  };

  const removeFavorite = async (scriptureId: string) => {
    try {
      const newFavorites = favorites.filter(id => id !== scriptureId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('移除收藏失败:', error);
    }
  };

  const isFavorite = (scriptureId: string) => {
    return favorites.includes(scriptureId);
  };

  const addBookmark = async (scriptureId: string, position: number) => {
    try {
      const newBookmark: Bookmark = {
        scriptureId,
        position,
        timestamp: Date.now(),
      };
      const newBookmarks = bookmarks.filter(b => b.scriptureId !== scriptureId);
      newBookmarks.push(newBookmark);
      setBookmarks(newBookmarks);
      await AsyncStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('添加书签失败:', error);
    }
  };

  const removeBookmark = async (scriptureId: string) => {
    try {
      const newBookmarks = bookmarks.filter(b => b.scriptureId !== scriptureId);
      setBookmarks(newBookmarks);
      await AsyncStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('移除书签失败:', error);
    }
  };

  const getBookmark = (scriptureId: string): Bookmark | undefined => {
    return bookmarks.find(b => b.scriptureId === scriptureId);
  };

  const updateReadingHistory = async (scriptureId: string) => {
    try {
      const existing = readingHistory.find(h => h.scriptureId === scriptureId);
      const newHistory = existing
        ? readingHistory.map(h =>
            h.scriptureId === scriptureId
              ? {...h, lastRead: Date.now(), readCount: h.readCount + 1}
              : h,
          )
        : [...readingHistory, {scriptureId, lastRead: Date.now(), readCount: 1}];
      setReadingHistory(newHistory);
      await AsyncStorage.setItem(STORAGE_KEYS.readingHistory, JSON.stringify(newHistory));
    } catch (error) {
      console.error('更新阅读历史失败:', error);
    }
  };

  const getReadingHistory = (scriptureId: string): ReadingHistory | undefined => {
    return readingHistory.find(h => h.scriptureId === scriptureId);
  };

  const clearAll = async () => {
    try {
      setFavorites([]);
      setBookmarks([]);
      setReadingHistory([]);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.favorites,
        STORAGE_KEYS.bookmarks,
        STORAGE_KEYS.readingHistory,
      ]);
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  };

  return (
    <ScriptureContext.Provider
      value={{
        favorites,
        bookmarks,
        readingHistory,
        addFavorite,
        removeFavorite,
        isFavorite,
        addBookmark,
        removeBookmark,
        getBookmark,
        updateReadingHistory,
        getReadingHistory,
        clearAll,
      }}>
      {children}
    </ScriptureContext.Provider>
  );
}

export function useScripture() {
  const context = useContext(ScriptureContext);
  if (context === undefined) {
    throw new Error('useScripture must be used within a ScriptureProvider');
  }
  return context;
}

