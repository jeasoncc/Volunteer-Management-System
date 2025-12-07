import {Platform, Share, Alert} from 'react-native';

export async function exportPracticeData(
  practices: any[],
  favorites: string[],
  bookmarks: any[],
  readingHistory: any[],
) {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      practices,
      scriptures: {
        favorites,
        bookmarks,
        readingHistory,
      },
    };

    const jsonString = JSON.stringify(data, null, 2);

    // 使用 Share API 分享数据（跨平台）
    const result = await Share.share({
      message: jsonString,
      title: '导出功课数据',
    });

    if (result.action === Share.sharedAction) {
      Alert.alert('成功', '数据已导出');
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    Alert.alert('错误', '导出数据失败');
  }
}

