import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Card, Text, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import type {RouteProp} from '@react-navigation/native';

import type {CheckinRecord} from '../types';

type CheckinDetailScreenRouteProp = RouteProp<{params: {record: CheckinRecord}}, 'params'>;

interface Props {
  route: CheckinDetailScreenRouteProp;
}

export default function CheckinDetailScreen({route}: Props) {
  const {record} = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              基本信息
            </Text>
            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.label}>
                  日期
                </Text>
                <Text variant="bodyLarge">
                  {dayjs(record.date).format('YYYY年MM月DD日 dddd')}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.label}>
                  打卡时间
                </Text>
                <Text variant="bodyLarge">{record.checkIn || '未打卡'}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Icon name="account" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.label}>
                  姓名
                </Text>
                <Text variant="bodyLarge">{record.name}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Icon name="tag" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.label}>
                  状态
                </Text>
                <Text variant="bodyLarge">
                  {record.status === 'present'
                    ? '正常'
                    : record.status === 'late'
                    ? '迟到'
                    : record.status === 'early_leave'
                    ? '早退'
                    : record.status === 'absent'
                    ? '缺勤'
                    : record.status === 'on_leave'
                    ? '请假'
                    : '未知'}
                </Text>
              </View>
            </View>
          </View>

          {(record.location || record.bodyTemperature || record.deviceSn) && (
            <>
              <Divider style={styles.sectionDivider} />
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  详细信息
                </Text>

                {record.location && (
                  <>
                    <View style={styles.infoRow}>
                      <Icon name="map-marker" size={20} color="#666" />
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.label}>
                          地点
                        </Text>
                        <Text variant="bodyLarge">{record.location}</Text>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </>
                )}

                {record.bodyTemperature && (
                  <>
                    <View style={styles.infoRow}>
                      <Icon name="thermometer" size={20} color="#666" />
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.label}>
                          体温
                        </Text>
                        <Text variant="bodyLarge">{record.bodyTemperature}°C</Text>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </>
                )}

                {record.deviceSn && (
                  <>
                    <View style={styles.infoRow}>
                      <Icon name="devices" size={20} color="#666" />
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.label}>
                          设备编号
                        </Text>
                        <Text variant="bodyLarge">{record.deviceSn}</Text>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </>
                )}

                {record.recordType && (
                  <>
                    <View style={styles.infoRow}>
                      <Icon name="fingerprint" size={20} color="#666" />
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.label}>
                          识别方式
                        </Text>
                        <Text variant="bodyLarge">
                          {record.recordType === 'face'
                            ? '人脸识别'
                            : record.recordType === 'card'
                            ? '刷卡'
                            : record.recordType}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </>
          )}
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
  card: {
    margin: 16,
    elevation: 2,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  sectionDivider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
});

