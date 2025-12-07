import React, {useMemo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import {scriptures} from '../data/scriptures';
import type {Scripture} from '../types';

interface DailyScriptureProps {
  onPress?: () => void;
}

export default function DailyScripture({onPress}: DailyScriptureProps) {
  const navigation = useNavigation();

  // 根据日期选择经文（确保每天相同）
  const dailyScripture = useMemo(() => {
    const dayOfYear = dayjs().dayOfYear();
    const index = dayOfYear % scriptures.length;
    return scriptures[index];
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ScriptureReader' as never, {scripture: dailyScripture} as never);
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="book-open-variant" size={24} color="#4caf50" />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.title}>
                每日经文
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {dayjs().format('YYYY年MM月DD日')}
              </Text>
            </View>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={handlePress}
            style={styles.chevron}
          />
        </View>
        <View style={styles.content}>
          <Text variant="titleLarge" style={styles.scriptureTitle}>
            {dailyScripture.title}
          </Text>
          {dailyScripture.category && (
            <Text variant="bodySmall" style={styles.category}>
              {dailyScripture.category}
            </Text>
          )}
          <Text variant="bodyMedium" style={styles.excerpt} numberOfLines={3}>
            {dailyScripture.content.substring(0, 100)}...
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  date: {
    color: '#666',
    marginTop: 2,
  },
  chevron: {
    margin: 0,
  },
  content: {
    marginTop: 8,
  },
  scriptureTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  category: {
    color: '#666',
    marginBottom: 8,
  },
  excerpt: {
    color: '#666',
    lineHeight: 20,
  },
});

