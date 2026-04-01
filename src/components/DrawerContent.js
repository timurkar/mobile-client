import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useChat } from '../context/ChatContext';
import { theme } from '../utils/theme';

const colors = theme.dark;

export default function DrawerContent({ navigation }) {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    newConversation,
    deleteConversation,
  } = useChat();

  const handleSelect = (id) => {
    selectConversation(id);
    navigation.closeDrawer();
  };

  const handleNew = () => {
    newConversation();
    navigation.closeDrawer();
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Удалить чат?',
      `"${title}" будет удалён.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteConversation(id),
        },
      ]
    );
  };

  const handleSettings = () => {
    navigation.closeDrawer();
    navigation.navigate('Settings');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // Group conversations by date
  const grouped = [];
  let lastGroup = '';
  conversations.forEach((conv) => {
    const group = formatDate(conv.updatedAt);
    if (group !== lastGroup) {
      grouped.push({ type: 'header', title: group, key: 'header_' + group + conv.id });
      lastGroup = group;
    }
    grouped.push({ type: 'item', ...conv, key: conv.id });
  });

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <Text style={styles.dateHeader}>{item.title}</Text>
      );
    }

    const isActive = item.id === currentConversationId;
    return (
      <TouchableOpacity
        style={[styles.conversationItem, isActive && styles.activeItem]}
        onPress={() => handleSelect(item.id)}
        onLongPress={() => handleDelete(item.id, item.title)}
        activeOpacity={0.7}
      >
        <Text style={[styles.conversationTitle, isActive && styles.activeTitle]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.messageCount}>
          {item.messages?.length || 0} сообщ.
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.newChatButton} onPress={handleNew} activeOpacity={0.7}>
          <Text style={styles.newChatIcon}>+</Text>
          <Text style={styles.newChatText}>Новый чат</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>Нет бесед</Text>
            <Text style={styles.emptySubtext}>Начните новый чат!</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings} activeOpacity={0.7}>
          <Text style={styles.settingsIcon}>⚙</Text>
          <Text style={styles.settingsText}>Настройки</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.drawerBackground,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newChatIcon: {
    color: colors.text,
    fontSize: 20,
    marginRight: 10,
    fontWeight: '300',
  },
  newChatText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
  },
  dateHeader: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  conversationItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  activeItem: {
    backgroundColor: colors.surface,
  },
  conversationTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '400',
  },
  activeTitle: {
    fontWeight: '600',
  },
  messageCount: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  settingsIcon: {
    color: colors.textSecondary,
    fontSize: 20,
    marginRight: 10,
  },
  settingsText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
