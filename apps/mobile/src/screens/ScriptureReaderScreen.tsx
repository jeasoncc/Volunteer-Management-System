import React, {useState, useRef, useEffect} from 'react';
import {View, StyleSheet, ScrollView, ScrollViewProps} from 'react-native';
import {
  Text,
  Card,
  SegmentedButtons,
  useTheme,
  IconButton,
  Menu,
  Divider,
  Button,
} from 'react-native-paper';
import type {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useScripture} from '../context/ScriptureContext';
import type {Scripture} from '../types';

type ScriptureReaderScreenRouteProp = RouteProp<{params: {scripture: Scripture}}, 'params'>;

interface Props {
  route: ScriptureReaderScreenRouteProp;
}

export default function ScriptureReaderScreen({route}: Props) {
  const {scripture} = route.params;
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const {isFavorite, addFavorite, removeFavorite, getBookmark, addBookmark, removeBookmark, updateReadingHistory} = useScripture();

  const [fontSize, setFontSize] = useState('medium');
  const [lineHeight, setLineHeight] = useState('normal');
  const [menuVisible, setMenuVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasBookmark, setHasBookmark] = useState(false);

  const fontSizeMap = {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 20,
  };

  const lineHeightMap = {
    compact: 1.5,
    normal: 2.0,
    spacious: 2.5,
  };

  const favorite = isFavorite(scripture.id);
  const bookmark = getBookmark(scripture.id);

  useEffect(() => {
    // 更新阅读历史
    updateReadingHistory(scripture.id);

    // 检查是否有书签
    setHasBookmark(!!bookmark);

    // 如果有书签，跳转到书签位置
    if (bookmark && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({y: bookmark.position, animated: true});
      }, 500);
    }
  }, [scripture.id]);

  const handleScroll: ScrollViewProps['onScroll'] = event => {
    const position = event.nativeEvent.contentOffset.y;
    setScrollPosition(position);
  };

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFavorite(scripture.id);
    } else {
      addFavorite(scripture.id);
    }
  };

  const handleAddBookmark = () => {
    addBookmark(scripture.id, scrollPosition);
    setHasBookmark(true);
  };

  const handleRemoveBookmark = () => {
    removeBookmark(scripture.id);
    setHasBookmark(false);
  };

  const handleJumpToBookmark = () => {
    if (bookmark && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: bookmark.position, animated: true});
    }
  };

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.headerContent}>
              <Text variant="headlineSmall" style={styles.title}>
                {scripture.title}
              </Text>
              {scripture.category && (
                <Text variant="bodyMedium" style={styles.category}>
                  {scripture.category}
                </Text>
              )}
              {scripture.author && (
                <Text variant="bodySmall" style={styles.author}>
                  作者: {scripture.author}
                </Text>
              )}
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon={favorite ? 'heart' : 'heart-outline'}
                iconColor={favorite ? '#e91e63' : theme.colors.onSurface}
                size={24}
                onPress={handleToggleFavorite}
              />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => setMenuVisible(true)}
                  />
                }>
                {hasBookmark ? (
                  <>
                    <Menu.Item
                      onPress={() => {
                        handleJumpToBookmark();
                        setMenuVisible(false);
                      }}
                      title="跳转到书签"
                      leadingIcon="bookmark"
                    />
                    <Menu.Item
                      onPress={() => {
                        handleRemoveBookmark();
                        setMenuVisible(false);
                      }}
                      title="删除书签"
                      leadingIcon="bookmark-remove"
                    />
                  </>
                ) : (
                  <Menu.Item
                    onPress={() => {
                      handleAddBookmark();
                      setMenuVisible(false);
                    }}
                    title="添加书签"
                    leadingIcon="bookmark-plus"
                  />
                )}
                <Divider />
                <Menu.Item
                  onPress={() => {
                    handleScrollToTop();
                    setMenuVisible(false);
                  }}
                  title="回到顶部"
                  leadingIcon="arrow-up"
                />
              </Menu>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Text variant="labelSmall" style={styles.controlLabel}>
            字体大小
          </Text>
          <SegmentedButtons
            value={fontSize}
            onValueChange={setFontSize}
            buttons={[
              {value: 'small', label: '小'},
              {value: 'medium', label: '中'},
              {value: 'large', label: '大'},
              {value: 'xlarge', label: '特大'},
            ]}
            style={styles.segmentedButtons}
          />
        </View>
        <View style={styles.controlGroup}>
          <Text variant="labelSmall" style={styles.controlLabel}>
            行间距
          </Text>
          <SegmentedButtons
            value={lineHeight}
            onValueChange={setLineHeight}
            buttons={[
              {value: 'compact', label: '紧凑'},
              {value: 'normal', label: '正常'},
              {value: 'spacious', label: '宽松'},
            ]}
            style={styles.segmentedButtons}
          />
        </View>
      </View>

      {hasBookmark && (
        <View style={styles.bookmarkBanner}>
          <Icon name="bookmark" size={16} color="#ff9800" />
          <Text variant="bodySmall" style={styles.bookmarkText}>
            已添加书签，点击菜单可跳转
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <Text
          style={[
            styles.text,
            {
              fontSize: fontSizeMap[fontSize as keyof typeof fontSizeMap],
              lineHeight:
                fontSizeMap[fontSize as keyof typeof fontSizeMap] *
                lineHeightMap[lineHeight as keyof typeof lineHeightMap],
              color: theme.colors.onSurface,
            },
          ]}>
          {scripture.content}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    color: '#666',
    marginBottom: 4,
  },
  author: {
    color: '#999',
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlGroup: {
    marginBottom: 12,
  },
  controlLabel: {
    marginBottom: 8,
    color: '#666',
  },
  segmentedButtons: {
    marginTop: 4,
  },
  bookmarkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookmarkText: {
    marginLeft: 8,
    color: '#856404',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  text: {
    textAlign: 'justify',
  },
});

