import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Card,
  Text,
  Checkbox,
  TextInput,
  Button,
  ProgressBar,
  Chip,
  Divider,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import {useDailyPractice} from '../context/DailyPracticeContext';
import {useScripture} from '../context/ScriptureContext';
import {scriptures} from '../data/scriptures';

export default function DailyPracticeScreen() {
  const navigation = useNavigation();
  const {
    todayPractice,
    updatePractice,
    getStreakDays,
    getTotalDays,
    getMonthStats,
  } = useDailyPractice();
  const {updateReadingHistory} = useScripture();

  const [scriptureRead, setScriptureRead] = useState(todayPractice?.scriptureRead || false);
  const [selectedScripture, setSelectedScripture] = useState<string | undefined>(
    todayPractice?.scriptureId,
  );
  const [chanting, setChanting] = useState(todayPractice?.chanting || false);
  const [chantingCount, setChantingCount] = useState<string>(
    todayPractice?.chantingCount?.toString() || '',
  );
  const [meditation, setMeditation] = useState(todayPractice?.meditation || false);
  const [meditationMinutes, setMeditationMinutes] = useState<string>(
    todayPractice?.meditationMinutes?.toString() || '',
  );
  const [notes, setNotes] = useState(todayPractice?.notes || '');

  const streakDays = getStreakDays();
  const totalDays = getTotalDays();
  const today = dayjs();
  const monthStats = getMonthStats(today.year(), today.month() + 1);

  const completionRate =
    (Number(scriptureRead) + Number(chanting) + Number(meditation)) / 3;

  const handleSave = async () => {
    await updatePractice({
      scriptureRead,
      scriptureId: selectedScripture,
      chanting,
      chantingCount: chantingCount ? parseInt(chantingCount, 10) : undefined,
      meditation,
      meditationMinutes: meditationMinutes ? parseInt(meditationMinutes, 10) : undefined,
      notes: notes.trim() || undefined,
    });

    // 如果读经，更新阅读历史
    if (scriptureRead && selectedScripture) {
      updateReadingHistory(selectedScripture);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 统计卡片 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsHeader}>
            <Text variant="titleLarge" style={styles.statsTitle}>
              今日功课
            </Text>
            <IconButton
              icon="history"
              size={24}
              onPress={() => navigation.navigate('PracticeHistory' as never)}
            />
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text variant="bodyMedium">完成进度</Text>
              <Text variant="bodyMedium" style={styles.progressText}>
                {Math.round(completionRate * 100)}%
              </Text>
            </View>
            <ProgressBar progress={completionRate} color="#4caf50" style={styles.progressBar} />
          </View>
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
            <View style={styles.statItem}>
              <Icon name="chart-line" size={24} color="#9c27b0" />
              <Text variant="headlineSmall" style={styles.statValue}>
                {Math.round(monthStats.completionRate)}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                本月完成率
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 读经 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={scriptureRead ? 'checked' : 'unchecked'}
              onPress={() => setScriptureRead(!scriptureRead)}
            />
            <View style={styles.checkboxContent}>
              <Text variant="titleMedium">读经</Text>
              <Text variant="bodySmall" style={styles.hint}>
                阅读佛经，增长智慧
              </Text>
            </View>
          </View>
          {scriptureRead && (
            <View style={styles.optionsContainer}>
              <Text variant="bodySmall" style={styles.label}>
                选择经文
              </Text>
              <View style={styles.scriptureList}>
                {scriptures.map(scripture => (
                  <Chip
                    key={scripture.id}
                    selected={selectedScripture === scripture.id}
                    onPress={() => setSelectedScripture(scripture.id)}
                    style={styles.scriptureChip}>
                    {scripture.title}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* 念佛 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={chanting ? 'checked' : 'unchecked'}
              onPress={() => setChanting(!chanting)}
            />
            <View style={styles.checkboxContent}>
              <Text variant="titleMedium">念佛</Text>
              <Text variant="bodySmall" style={styles.hint}>
                持念佛号，净化心灵
              </Text>
            </View>
          </View>
          {chanting && (
            <View style={styles.optionsContainer}>
              <TextInput
                label="念佛次数"
                value={chantingCount}
                onChangeText={setChantingCount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                placeholder="例如：108"
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* 打坐 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={meditation ? 'checked' : 'unchecked'}
              onPress={() => setMeditation(!meditation)}
            />
            <View style={styles.checkboxContent}>
              <Text variant="titleMedium">打坐</Text>
              <Text variant="bodySmall" style={styles.hint}>
                静坐冥想，修心养性
              </Text>
            </View>
          </View>
          {meditation && (
            <View style={styles.optionsContainer}>
              <TextInput
                label="打坐时长（分钟）"
                value={meditationMinutes}
                onChangeText={setMeditationMinutes}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                placeholder="例如：30"
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* 备注 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            备注
          </Text>
          <TextInput
            label="记录今日感悟或心得"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.textArea}
            placeholder="写下今日的感悟..."
          />
        </Card.Content>
      </Card>

      {/* 保存按钮 */}
      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        icon="check">
        保存今日功课
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
  progressContainer: {
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
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
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContent: {
    flex: 1,
    marginLeft: 8,
  },
  hint: {
    color: '#666',
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 16,
    marginLeft: 40,
  },
  label: {
    marginBottom: 8,
    color: '#666',
  },
  scriptureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scriptureChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textArea: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

