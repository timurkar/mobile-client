import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { theme } from '../utils/theme';

const colors = theme.dark;

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Сообщение"
          placeholderTextColor={colors.placeholder}
          multiline
          maxLength={10000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          <View style={styles.sendArrow}>
            <Text style={[styles.arrowText, canSend && styles.arrowTextActive]}>↑</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Needed for the Text component used inside
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.inputBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 10,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.sendButtonDisabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
    marginLeft: 6,
  },
  sendButtonActive: {
    backgroundColor: colors.sendButton,
  },
  sendArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  arrowTextActive: {
    color: '#ffffff',
  },
});
