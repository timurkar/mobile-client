import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

const colors = theme.dark;

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        <Text style={styles.avatarText}>{isUser ? 'Вы' : isError ? '!' : 'AI'}</Text>
      </View>
      <View style={[styles.bubble, isUser && styles.userBubble, isError && styles.errorBubble]}>
        <Text style={[styles.messageText, isError && styles.errorText]}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  userContainer: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  userAvatar: {
    backgroundColor: colors.accent,
    marginLeft: 8,
  },
  assistantAvatar: {
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  avatarText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '78%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.accent,
  },
  errorBubble: {
    backgroundColor: '#3a1c1c',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: {
    color: '#fca5a5',
  },
});
