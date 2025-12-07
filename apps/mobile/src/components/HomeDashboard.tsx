import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Card, Text, ProgressBar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import {useDailyPractice} from '../context/DailyPracticeContext';
import DailyScripture from './DailyScripture';

export default function HomeDashboard() {
  const navigation = useNavigation();
  const {todayPractice, getStreakDays, getTotalDays, getMonthStats} = useDailyPractice();

  const streakDays = getStreakDays();
  const totalDays = getTotalDays();
  const today = dayjs();
  const monthStats = getMonthStats(today.year(), today.month() + 1);
  const completionRate = todayPractice
    ? (Number(todayPractice.scriptureRead) +
        Number(todayPractice.chanting) +
        Number(todayPractice.meditation)) /
      3
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 欢迎卡片 */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                今日修行
              </Text>
              <Text variant="bodyMedium" style={styles.welcomeDate}>
                {dayjs().format('YYYY年MM月DD日 dddd')}
              </Text>
            </View>
            <Icon name="lotus" size={48} color="#4caf50" />
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text variant="bodyMedium">今日完成进度</Text>
              <Text variant="bodyMedium" style={styles.progressText}>
                {Math.round(completionRate * 100)}%
              </Text>
            </View>
            <ProgressBar progress={completionRate} color="#4caf50" style={styles.progressBar} />
          </View>
        </Card.Content>
      </Card>

      {/* 每日经文 */}
      <DailyScripture />

      {/* 统计卡片 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            修行统计
          </Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('DailyPractice' as never)}>
              <Icon name="fire" size={32} color="#ff9800" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {streakDays}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                连续打卡
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('PracticeHistory' as never)}>
              <Icon name="calendar-check" size={32} color="#2196f3" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalDays}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                总打卡天数
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Icon name="chart-line" size={32} color="#9c27b0" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {Math.round(monthStats.completionRate)}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                本月完成率
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* 快捷操作 */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.actionsTitle}>
            快捷操作
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('DailyPractice' as never)}>
              <Icon name="meditation" size={32} color="#4caf50" />
              <Text variant="bodyMedium" style={styles.actionLabel}>
                每日功课
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Scripture' as never)}>
              <Icon name="book-open-variant" size={32} color="#2196f3" />
              <Text variant="bodyMedium" style={styles.actionLabel}>
                佛经阅读
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('PracticeHistory' as never)}>
              <Icon name="history" size={32} color="#ff9800" />
              <Text variant="bodyMedium" style={styles.actionLabel}>
                功课历史
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Settings' as never)}>
              <Icon name="cog" size={32} color="#666" />
              <Text variant="bodyMedium" style={styles.actionLabel}>
                设置
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f8f9fa',
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  welcomeDate: {
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 100,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#4caf50',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsCard: {
    elevation: 2,
  },
  actionsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  actionLabel: {
    marginTop: 8,
    color: '#333',
  },
});

