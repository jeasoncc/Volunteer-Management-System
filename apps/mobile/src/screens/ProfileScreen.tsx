import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Card, Text, Avatar, Divider, List} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {useDailyPractice} from '../context/DailyPracticeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const {getStreakDays, getTotalDays} = useDailyPractice();

  const streakDays = getStreakDays();
  const totalDays = getTotalDays();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.name || '未登录'}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            {user?.lotusRole === 'admin' ? '管理员' : '义工'}
          </Text>
        </Card.Content>
      </Card>

      {/* 统计卡片 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="fire" size={24} color="#ff9800" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {streakDays}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                连续打卡
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar-check" size={24} color="#2196f3" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalDays}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                总打卡天数
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Icon name="identifier" size={24} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.label}>
                莲花斋ID
              </Text>
              <Text variant="bodyLarge">{user?.lotusId || '-'}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Icon name="phone" size={24} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.label}>
                手机号
              </Text>
              <Text variant="bodyLarge">{user?.phone || '-'}</Text>
            </View>
          </View>

          {user?.email && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Icon name="email" size={24} color="#666" />
                <View style={styles.infoContent}>
                  <Text variant="bodySmall" style={styles.label}>
                    邮箱
                  </Text>
                  <Text variant="bodyLarge">{user.email}</Text>
                </View>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* 功能菜单 */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <List.Item
            title="每日功课"
            description="记录和查看每日修行功课"
            left={props => <List.Icon {...props} icon="meditation" color="#4caf50" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('DailyPractice' as never)}
          />
          <Divider />
          <List.Item
            title="设置"
            description="应用设置和偏好"
            left={props => <List.Icon {...props} icon="cog" color="#666" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings' as never)}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    color: '#666',
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
});

