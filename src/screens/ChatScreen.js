import React, { useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useChat } from '../context/ChatContext';
import { sendChatRequest } from '../utils/api';
import { theme } from '../utils/theme';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';

const colors = theme.dark;

export default function ChatScreen({ navigation }) {
  const {
    currentConversation,
    currentConversationId,
    isLoading,
    settings,
    newConversation,
    addMessage,
    setLoading,
  } = useChat();

  const flatListRef = useRef(null);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(async (text) => {
    let convId = currentConversationId;

    if (!convId) {
      newConversation();
      // Будет создана новая беседа, но нам нужен её ID
      // Используем setTimeout чтобы дождаться обновления стейта
    }

    // Если нет текущей беседы, создаём новую
    if (!convId) {
      newConversation();
      return; // Пользователь нажмёт ещё раз после создания
    }

    const userMessage = { role: 'user', content: text };
    addMessage(convId, userMessage);
    setLoading(true);

    try {
      const updatedMessages = [...messages, userMessage];
      const response = await sendChatRequest(updatedMessages, settings);
      addMessage(convId, { role: 'assistant', content: response });
    } catch (error) {
      addMessage(convId, { role: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  }, [currentConversationId, messages, settings, addMessage, setLoading, newConversation]);

  const handleSendWithAutoCreate = useCallback(async (text) => {
    if (!currentConversationId) {
      newConversation();
      // Мы вызовем отправку повторно через эффект ниже
      // Пока сохраним текст
      pendingMessageRef.current = text;
      return;
    }
    handleSend(text);
  }, [currentConversationId, handleSend, newConversation]);

  const pendingMessageRef = useRef(null);

  useEffect(() => {
    if (currentConversationId && pendingMessageRef.current) {
      const text = pendingMessageRef.current;
      pendingMessageRef.current = null;
      handleSend(text);
    }
  }, [currentConversationId, handleSend]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>ChatGPT</Text>
      <Text style={styles.emptySubtitle}>Чем могу помочь?</Text>

      <View style={styles.suggestionsContainer}>
        {['Напиши стихотворение', 'Объясни квантовую физику', 'Помоги с кодом'].map((text, i) => (
          <TouchableOpacity
            key={i}
            style={styles.suggestion}
            onPress={() => handleSendWithAutoCreate(text)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentConversation?.title || 'ChatGPT'}
        </Text>
        <TouchableOpacity onPress={() => { newConversation(); }} style={styles.newChatButton}>
          <Text style={styles.newChatIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      {messages.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />
      )}

      <ChatInput onSend={handleSendWithAutoCreate} disabled={isLoading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: colors.headerBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: colors.text,
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  newChatButton: {
    padding: 8,
  },
  newChatIcon: {
    color: colors.text,
    fontSize: 20,
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 10,
  },
  suggestion: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    color: colors.text,
    fontSize: 15,
  },
});
