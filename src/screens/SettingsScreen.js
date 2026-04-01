import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useChat } from '../context/ChatContext';
import { checkBackendHealth } from '../utils/api';
import { theme } from '../utils/theme';

const colors = theme.dark;

const MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, clearAll } = useChat();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendStatus);
  }, []);

  const update = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    Alert.alert('Сохранено', 'Настройки успешно сохранены.');
    navigation.goBack();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Удалить все чаты?',
      'Это действие необратимо. Все беседы будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Готово', 'Все чаты удалены.');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Статус сервера</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: backendStatus?.apiKeyConfigured ? '#22c55e' : backendStatus ? colors.danger : colors.textMuted }
            ]} />
            <Text style={styles.statusText}>
              {backendStatus === null
                ? 'Проверка...'
                : backendStatus.apiKeyConfigured
                  ? 'API ключ настроен ✓'
                  : 'API ключ не настроен'}
            </Text>
          </View>
          {backendStatus?.model && (
            <Text style={styles.statusSubtext}>Модель по умолчанию: {backendStatus.model}</Text>
          )}
          {backendStatus && !backendStatus.apiKeyConfigured && (
            <Text style={styles.statusHint}>
              Добавьте переменную OPENAI_API_KEY в настройках Vercel проекта
              (Settings → Environment Variables)
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Модель</Text>

        <View style={styles.modelsContainer}>
          {MODELS.map((model) => (
            <TouchableOpacity
              key={model}
              style={[
                styles.modelChip,
                localSettings.model === model && styles.modelChipActive,
              ]}
              onPress={() => update('model', model)}
            >
              <Text style={[
                styles.modelChipText,
                localSettings.model === model && styles.modelChipTextActive,
              ]}>
                {model}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Или введите название модели</Text>
        <TextInput
          style={styles.input}
          value={localSettings.model}
          onChangeText={(v) => update('model', v)}
          placeholder="gpt-4o"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.sectionTitle}>Параметры</Text>

        <Text style={styles.label}>Системный промпт</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={localSettings.systemPrompt}
          onChangeText={(v) => update('systemPrompt', v)}
          placeholder="You are a helpful assistant."
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Temperature: {localSettings.temperature}</Text>
        <TextInput
          style={styles.input}
          value={String(localSettings.temperature)}
          onChangeText={(v) => {
            const num = parseFloat(v);
            if (!isNaN(num) && num >= 0 && num <= 2) update('temperature', num);
            else if (v === '' || v === '0.' || v === '1.' || v === '2') update('temperature', v);
          }}
          placeholder="0.7"
          placeholderTextColor={colors.placeholder}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Max Tokens</Text>
        <TextInput
          style={styles.input}
          value={String(localSettings.maxTokens)}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            if (!isNaN(num) && num > 0) update('maxTokens', num);
            else if (v === '') update('maxTokens', '');
          }}
          placeholder="4096"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Сохранить настройки</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Данные</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleClearAll} activeOpacity={0.8}>
          <Text style={styles.dangerButtonText}>Удалить все чаты</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: colors.headerBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: colors.accent,
    fontSize: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  statusSubtext: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 20,
  },
  statusHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  modelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modelChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modelChipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  modelChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
