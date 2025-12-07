import React, {useState} from 'react';
import {View, StyleSheet, FlatList, RefreshControl} from 'react-native';
import {Card, Text, Chip, ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useCheckinRecords} from '../hooks/useCheckinRecords';
import ErrorView from '../components/ErrorView';
import type {CheckinRecord} from '../types';

export default function CheckinScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange] = useState({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useCheckinRecords(dateRange);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present':
        return '#4caf50';
      case 'late':
        return '#ff9800';
      case 'early_leave':
        return '#ff5722';
      case 'absent':
        return '#f44336';
      case 'on_leave':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'present':
        return '正常';
      case 'late':
        return '迟到';
      case 'early_leave':
        return '早退';
      case 'absent':
        return '缺勤';
      case 'on_leave':
        return '请假';
      default:
        return '未知';
    }
  };

  const renderItem = ({item}: {item: CheckinRecord}) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('CheckinDetail' as never, {record: item} as never)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text variant="titleMedium" style={styles.dateText}>
              {dayjs(item.date).format('YYYY年MM月DD日')}
            </Text>
            <Text variant="bodyMedium" style={styles.timeText}>
              {item.checkIn || '未打卡'}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, {backgroundColor: getStatusColor(item.status)}]}
            textStyle={styles.statusText}>
            {getStatusText(item.status)}
          </Chip>
        </View>

        {item.location && (
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={16} color="#666" />
            <Text variant="bodySmall" style={styles.infoText}>
              {item.location}
            </Text>
          </View>
        )}

        {item.bodyTemperature && (
          <View style={styles.infoRow}>
            <Icon name="thermometer" size={16} color="#666" />
            <Text variant="bodySmall" style={styles.infoText}>
              体温: {item.bodyTemperature}°C
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (data && !data.success) {
    return (
      <ErrorView
        message={data.message || '加载打卡记录失败'}
        onRetry={() => refetch()}
      />
    );
  }

  const records = data?.data?.records || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="clock-outline" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              暂无打卡记录
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  dateText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeText: {
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
  },
});

