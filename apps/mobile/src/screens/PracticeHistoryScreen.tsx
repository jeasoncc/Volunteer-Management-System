import React, {useState, useMemo} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {Card, Text, Chip, SegmentedButtons, ProgressBar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';

import {useDailyPractice} from '../context/DailyPracticeContext';
import {scriptures} from '../data/scriptures';

type ViewType = 'list' | 'calendar' | 'stats';

export default function PracticeHistoryScreen() {
  const {practices, getMonthStats} = useDailyPractice();
  const [viewType, setViewType] = useState<ViewType>('list');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const selectedDate = dayjs(selectedMonth);
  const monthStats = getMonthStats(selectedDate.year(), selectedDate.month() + 1);

  // 按日期排序（最新的在前）
  const sortedPractices = useMemo(() => {
    return [...practices]
      .filter(p => p.date.startsWith(selectedMonth))
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [practices, selectedMonth]);

  // 生成日历数据
  const calendarData = useMemo(() => {
    const days: Array<{date: string; practice: any; day: number}> = [];
    const startDate = selectedDate.startOf('month');
    const endDate = selectedDate.endOf('month');
    const daysInMonth = endDate.date();

    // 添加月初空白
    const firstDayOfWeek = startDate.day();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({date: '', practice: null, day: 0});
    }

    // 添加日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startDate.date(day).format('YYYY-MM-DD');
      const practice = practices.find(p => p.date === date);
      days.push({date, practice, day});
    }

    return days;
  }, [practices, selectedMonth]);

  const getScriptureTitle = (scriptureId?: string) => {
    if (!scriptureId) return '';
    const scripture = scriptures.find(s => s.id === scriptureId);
    return scripture?.title || '';
  };

  const renderListItem = ({item}: {item: any}) => {
    const practice = item;
    const date = dayjs(practice.date);

    return (
      <Card style={styles.listCard}>
        <Card.Content>
          <View style={styles.listHeader}>
            <View style={styles.dateInfo}>
              <Text variant="titleMedium" style={styles.dateText}>
                {date.format('MM月DD日')}
              </Text>
              <Text variant="bodySmall" style={styles.weekdayText}>
                {date.format('dddd')}
              </Text>
            </View>
            {practice.completed && (
              <Chip icon="check-circle" style={styles.completedChip}>
                已完成
              </Chip>
            )}
          </View>

          <View style={styles.practiceItems}>
            {practice.scriptureRead && (
              <View style={styles.practiceItem}>
                <Icon name="book-open-variant" size={20} color="#4caf50" />
                <Text variant="bodyMedium" style={styles.practiceText}>
                  读经: {getScriptureTitle(practice.scriptureId) || '已读经'}
                </Text>
              </View>
            )}
            {practice.chanting && (
              <View style={styles.practiceItem}>
                <Icon name="meditation" size={20} color="#2196f3" />
                <Text variant="bodyMedium" style={styles.practiceText}>
                  念佛: {practice.chantingCount || 0} 次
                </Text>
              </View>
            )}
            {practice.meditation && (
              <View style={styles.practiceItem}>
                <Icon name="yoga" size={20} color="#9c27b0" />
                <Text variant="bodyMedium" style={styles.practiceText}>
                  打坐: {practice.meditationMinutes || 0} 分钟
                </Text>
              </View>
            )}
          </View>

          {practice.notes && (
            <View style={styles.notesContainer}>
              <Text variant="bodySmall" style={styles.notesLabel}>
                备注:
              </Text>
              <Text variant="bodySmall" style={styles.notesText}>
                {practice.notes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderCalendarDay = ({item}: {item: any}) => {
    if (!item.date) {
      return <View style={styles.calendarDayEmpty} />;
    }

    const isToday = item.date === dayjs().format('YYYY-MM-DD');
    const hasPractice = !!item.practice;
    const isCompleted = item.practice?.completed;

    return (
      <View
        style={[
          styles.calendarDay,
          isToday && styles.calendarDayToday,
          hasPractice && styles.calendarDayHasPractice,
          isCompleted && styles.calendarDayCompleted,
        ]}>
        <Text
          style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isCompleted && styles.calendarDayTextCompleted,
          ]}>
          {item.day}
        </Text>
        {isCompleted && (
          <Icon name="check" size={12} color="#fff" style={styles.calendarCheck} />
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 统计卡片 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsHeader}>
            <Text variant="titleLarge" style={styles.statsTitle}>
              {selectedDate.format('YYYY年MM月')} 统计
            </Text>
            <View style={styles.monthSelector}>
              <IconButton
                icon="chevron-left"
                size={20}
                onPress={() =>
                  setSelectedMonth(dayjs(selectedMonth).subtract(1, 'month').format('YYYY-MM'))
                }
              />
              <IconButton
                icon="chevron-right"
                size={20}
                onPress={() =>
                  setSelectedMonth(dayjs(selectedMonth).add(1, 'month').format('YYYY-MM'))
                }
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {monthStats.completedDays}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                完成天数
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {monthStats.totalDays}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                总天数
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {Math.round(monthStats.completionRate)}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                完成率
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={monthStats.completionRate / 100}
            color="#4caf50"
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* 视图切换 */}
      <View style={styles.viewSelector}>
        <SegmentedButtons
          value={viewType}
          onValueChange={setViewType}
          buttons={[
            {value: 'list', label: '列表'},
            {value: 'calendar', label: '日历'},
            {value: 'stats', label: '统计'},
          ]}
        />
      </View>

      {/* 列表视图 */}
      {viewType === 'list' && (
        <FlatList
          data={sortedPractices}
          renderItem={renderListItem}
          keyExtractor={item => item.date}
          scrollEnabled={false}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyContainer}>
                  <Icon name="calendar-blank" size={48} color="#ccc" />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    本月暂无功课记录
                  </Text>
                </View>
              </Card.Content>
            </Card>
          }
        />
      )}

      {/* 日历视图 */}
      {viewType === 'calendar' && (
        <Card style={styles.calendarCard}>
          <Card.Content>
            <View style={styles.calendarHeader}>
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <View key={day} style={styles.calendarHeaderDay}>
                  <Text variant="bodySmall" style={styles.calendarHeaderText}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            <FlatList
              data={calendarData}
              renderItem={renderCalendarDay}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              numColumns={7}
              scrollEnabled={false}
            />
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.calendarDayCompleted]} />
                <Text variant="bodySmall">已完成</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.calendarDayHasPractice]} />
                <Text variant="bodySmall">有记录</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.calendarDayToday]} />
                <Text variant="bodySmall">今天</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 统计视图 */}
      {viewType === 'stats' && (
        <Card style={styles.statsDetailCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              详细统计
            </Text>
            <View style={styles.statsDetail}>
              <View style={styles.statsDetailItem}>
                <Icon name="book-open-variant" size={24} color="#4caf50" />
                <Text variant="headlineSmall" style={styles.statsDetailValue}>
                  {sortedPractices.filter(p => p.scriptureRead).length}
                </Text>
                <Text variant="bodySmall" style={styles.statsDetailLabel}>
                  读经天数
                </Text>
              </View>
              <View style={styles.statsDetailItem}>
                <Icon name="meditation" size={24} color="#2196f3" />
                <Text variant="headlineSmall" style={styles.statsDetailValue}>
                  {sortedPractices.filter(p => p.chanting).length}
                </Text>
                <Text variant="bodySmall" style={styles.statsDetailLabel}>
                  念佛天数
                </Text>
              </View>
              <View style={styles.statsDetailItem}>
                <Icon name="yoga" size={24} color="#9c27b0" />
                <Text variant="headlineSmall" style={styles.statsDetailValue}>
                  {sortedPractices.filter(p => p.meditation).length}
                </Text>
                <Text variant="bodySmall" style={styles.statsDetailLabel}>
                  打坐天数
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
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
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  viewSelector: {
    marginBottom: 16,
  },
  listCard: {
    marginBottom: 12,
    elevation: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontWeight: 'bold',
  },
  weekdayText: {
    color: '#666',
    marginTop: 2,
  },
  completedChip: {
    backgroundColor: '#4caf50',
  },
  practiceItems: {
    marginTop: 8,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceText: {
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    color: '#666',
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
  },
  calendarCard: {
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarHeaderDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarHeaderText: {
    fontWeight: 'bold',
    color: '#666',
  },
  calendarDay: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  calendarDayEmpty: {
    aspectRatio: 1,
    margin: 2,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  calendarDayHasPractice: {
    backgroundColor: '#e3f2fd',
  },
  calendarDayCompleted: {
    backgroundColor: '#4caf50',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  calendarDayTextToday: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  calendarDayTextCompleted: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  statsDetailCard: {
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsDetail: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsDetailItem: {
    alignItems: 'center',
  },
  statsDetailValue: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#4caf50',
  },
  statsDetailLabel: {
    color: '#666',
    marginTop: 4,
  },
});

