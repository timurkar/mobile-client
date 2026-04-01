import AsyncStorage from '@react-native-async-storage/async-storage';

const CONVERSATIONS_KEY = 'chatgpt_conversations';
const SETTINGS_KEY = 'chatgpt_settings';

export async function loadConversations() {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveConversations(conversations) {
  try {
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch {
    // ignore
  }
}

export async function loadSettings() {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getDefaultSettings() {
  return {
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.7,
    maxTokens: 4096,
  };
}
