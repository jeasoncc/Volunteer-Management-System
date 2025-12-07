import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Switch, Alert} from 'react-native';
import {
  Card,
  Text,
  List,
  Divider,
  Button,
  RadioButton,
  SegmentedButtons,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth} from '../context/AuthContext';
import {useScripture} from '../context/ScriptureContext';
import {useDailyPractice} from '../context/DailyPracticeContext';
import {exportPracticeData} from '../utils/export';

interface SettingsState {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoSave: boolean;
  showDailyScripture: boolean;
}

const STORAGE_KEY = 'app_settings';

export default function SettingsScreen() {
  const {logout} = useAuth();
  const {clearAll: clearScriptureData, favorites, bookmarks, readingHistory} = useScripture();
  const {practices} = useDailyPractice();

  const [settings, setSettings] = useState<SettingsState>({
    fontSize: 'medium',
    theme: 'auto',
    notifications: true,
    autoSave: true,
    showDailyScripture: true,
  });

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setSettings(JSON.parse(data));
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '清空数据',
      '确定要清空所有本地数据吗？此操作不可逆。',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearScriptureData();
              await AsyncStorage.clear();
              Alert.alert('成功', '所有数据已清空');
            } catch (error) {
              Alert.alert('错误', '清空数据失败');
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      {text: '取消', style: 'cancel'},
      {
        text: '确定',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 显示设置 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            显示设置
          </Text>
          <List.Item
            title="字体大小"
            description="调整应用字体大小"
            left={props => <List.Icon {...props} icon="format-size" />}
            right={() => (
              <SegmentedButtons
                value={settings.fontSize}
                onValueChange={value =>
                  saveSettings({...settings, fontSize: value as any})
                }
                buttons={[
                  {value: 'small', label: '小'},
                  {value: 'medium', label: '中'},
                  {value: 'large', label: '大'},
                ]}
                style={styles.segmentedButtons}
              />
            )}
          />
          <Divider />
          <List.Item
            title="主题模式"
            description="选择应用主题"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <RadioButton.Group
                onValueChange={value =>
                  saveSettings({...settings, theme: value as any})
                }
                value={settings.theme}>
                <View style={styles.radioGroup}>
                  <View style={styles.radioItem}>
                    <RadioButton value="light" />
                    <Text>浅色</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="dark" />
                    <Text>深色</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="auto" />
                    <Text>自动</Text>
                  </View>
                </View>
              </RadioButton.Group>
            )}
          />
        </Card.Content>
      </Card>

      {/* 功能设置 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            功能设置
          </Text>
          <List.Item
            title="通知提醒"
            description="接收每日功课提醒"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={value =>
                  saveSettings({...settings, notifications: value})
                }
              />
            )}
          />
          <Divider />
          <List.Item
            title="自动保存"
            description="自动保存阅读进度和设置"
            left={props => <List.Icon {...props} icon="content-save" />}
            right={() => (
              <Switch
                value={settings.autoSave}
                onValueChange={value =>
                  saveSettings({...settings, autoSave: value})
                }
              />
            )}
          />
          <Divider />
          <List.Item
            title="显示每日经文"
            description="在首页显示每日推荐经文"
            left={props => <List.Icon {...props} icon="book-open-variant" />}
            right={() => (
              <Switch
                value={settings.showDailyScripture}
                onValueChange={value =>
                  saveSettings({...settings, showDailyScripture: value})
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* 数据管理 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            数据管理
          </Text>
          <List.Item
            title="清空所有数据"
            description="删除所有本地存储的数据"
            left={props => <List.Icon {...props} icon="delete-sweep" color="#f44336" />}
            onPress={handleClearData}
          />
          <Divider />
          <List.Item
            title="导出数据"
            description="导出功课记录和设置"
            left={props => <List.Icon {...props} icon="download" />}
            onPress={async () => {
              try {
                await exportPracticeData(practices, favorites, bookmarks, readingHistory);
              } catch (error) {
                Alert.alert('错误', '导出数据失败');
              }
            }}
          />
        </Card.Content>
      </Card>

      {/* 关于 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            关于
          </Text>
          <List.Item
            title="版本"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="帮助与反馈"
            description="获取帮助或提交反馈"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => Alert.alert('提示', '帮助功能开发中')}
          />
        </Card.Content>
      </Card>

      {/* 退出登录 */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#f44336"
        icon="logout">
        退出登录
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentedButtons: {
    width: 150,
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

