import React, {useState, useMemo} from 'react';
import {View, StyleSheet, FlatList, TextInput} from 'react-native';
import {Card, Text, Chip, IconButton, Searchbar, Menu, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import {scriptures} from '../data/scriptures';
import {useScripture} from '../context/ScriptureContext';
import DailyScripture from '../components/DailyScripture';
import type {Scripture} from '../types';

type FilterType = 'all' | 'favorite' | 'category';

export default function ScriptureScreen() {
  const navigation = useNavigation();
  const {isFavorite, getReadingHistory} = useScripture();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = new Set<string>();
    scriptures.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats).sort();
  }, []);

  // 过滤和搜索经文
  const filteredScriptures = useMemo(() => {
    let result = scriptures;

    // 按类型过滤
    if (filterType === 'favorite') {
      result = result.filter(s => isFavorite(s.id));
    } else if (filterType === 'category' && selectedCategory) {
      result = result.filter(s => s.category === selectedCategory);
    }

    // 搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(query) ||
          s.content.toLowerCase().includes(query) ||
          s.category?.toLowerCase().includes(query) ||
          s.author?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [scriptures, filterType, selectedCategory, searchQuery, isFavorite]);

  const renderItem = ({item}: {item: Scripture}) => {
    const favorite = isFavorite(item.id);
    const history = getReadingHistory(item.id);

    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate('ScriptureReader' as never, {scripture: item} as never)
        }>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Icon
              name={favorite ? 'book-heart' : 'book-open-variant'}
              size={24}
              color={favorite ? '#e91e63' : '#666'}
            />
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.title}>
                  {item.title}
                </Text>
                {favorite && (
                  <Icon name="heart" size={16} color="#e91e63" style={styles.favoriteIcon} />
                )}
              </View>
              <View style={styles.metaRow}>
                {item.category && (
                  <Chip mode="flat" compact style={styles.chip}>
                    {item.category}
                  </Chip>
                )}
                {history && (
                  <Text variant="bodySmall" style={styles.readInfo}>
                    已读 {history.readCount} 次
                  </Text>
                )}
              </View>
              {item.author && (
                <Text variant="bodySmall" style={styles.author}>
                  作者: {item.author}
                </Text>
              )}
              {history && (
                <Text variant="bodySmall" style={styles.lastRead}>
                  最后阅读: {dayjs(history.lastRead).format('YYYY-MM-DD HH:mm')}
                </Text>
              )}
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* 每日经文卡片 */}
      <DailyScripture />

      <View style={styles.header}>
        <Searchbar
          placeholder="搜索经文..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="magnify"
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter"
              size={24}
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            />
          }>
          <Menu.Item
            onPress={() => {
              setFilterType('all');
              setSelectedCategory(null);
              setMenuVisible(false);
            }}
            title="全部"
            leadingIcon={filterType === 'all' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setFilterType('favorite');
              setSelectedCategory(null);
              setMenuVisible(false);
            }}
            title="收藏"
            leadingIcon={filterType === 'favorite' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setFilterType('category');
              setMenuVisible(false);
            }}
            title="按分类"
            leadingIcon={filterType === 'category' ? 'check' : undefined}
          />
        </Menu>
      </View>

      {filterType === 'category' && (
        <View style={styles.categoryFilter}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <Chip
                selected={selectedCategory === item}
                onPress={() =>
                  setSelectedCategory(selectedCategory === item ? null : item)
                }
                style={styles.categoryChip}>
                {item}
              </Chip>
            )}
            contentContainerStyle={styles.categoryList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <FlatList
        data={filteredScriptures}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book-open-page-variant-outline" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              {searchQuery ? '未找到相关经文' : '暂无经文'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 4,
  },
  filterButton: {
    margin: 0,
  },
  categoryFilter: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
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
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  chip: {
    marginRight: 8,
  },
  readInfo: {
    color: '#666',
    marginLeft: 8,
  },
  category: {
    color: '#666',
    marginTop: 4,
  },
  author: {
    color: '#999',
    marginTop: 2,
  },
  lastRead: {
    color: '#999',
    marginTop: 2,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
  },
});

