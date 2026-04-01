import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { loadConversations, saveConversations, loadSettings, saveSettings, getDefaultSettings } from '../utils/storage';

const ChatContext = createContext();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateTitle(message) {
  const text = message.substring(0, 40);
  return text.length < message.length ? text + '...' : text;
}

const initialState = {
  conversations: [],
  currentConversationId: null,
  settings: getDefaultSettings(),
  isLoading: false,
  initialized: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      return {
        ...state,
        conversations: action.conversations,
        settings: action.settings,
        initialized: true,
      };
    }
    case 'NEW_CONVERSATION': {
      const newConv = {
        id: generateId(),
        title: 'Новый чат',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        conversations: [newConv, ...state.conversations],
        currentConversationId: newConv.id,
      };
    }
    case 'SELECT_CONVERSATION': {
      return { ...state, currentConversationId: action.id };
    }
    case 'ADD_MESSAGE': {
      const conversations = state.conversations.map(conv => {
        if (conv.id !== action.conversationId) return conv;
        const messages = [...conv.messages, action.message];
        const title = conv.messages.length === 0 && action.message.role === 'user'
          ? generateTitle(action.message.content)
          : conv.title;
        return { ...conv, messages, title, updatedAt: Date.now() };
      });
      return { ...state, conversations };
    }
    case 'SET_LOADING': {
      return { ...state, isLoading: action.value };
    }
    case 'DELETE_CONVERSATION': {
      const conversations = state.conversations.filter(c => c.id !== action.id);
      const currentConversationId = state.currentConversationId === action.id
        ? null
        : state.currentConversationId;
      return { ...state, conversations, currentConversationId };
    }
    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }
    case 'CLEAR_ALL': {
      return { ...state, conversations: [], currentConversationId: null };
    }
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const [conversations, settings] = await Promise.all([loadConversations(), loadSettings()]);
      dispatch({ type: 'INIT', conversations, settings });
    })();
  }, []);

  useEffect(() => {
    if (state.initialized) {
      saveConversations(state.conversations);
    }
  }, [state.conversations, state.initialized]);

  useEffect(() => {
    if (state.initialized) {
      saveSettings(state.settings);
    }
  }, [state.settings, state.initialized]);

  const currentConversation = state.conversations.find(c => c.id === state.currentConversationId) || null;

  const newConversation = useCallback(() => {
    dispatch({ type: 'NEW_CONVERSATION' });
  }, []);

  const selectConversation = useCallback((id) => {
    dispatch({ type: 'SELECT_CONVERSATION', id });
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    dispatch({
      type: 'ADD_MESSAGE',
      conversationId,
      message: { id: generateId(), ...message, timestamp: Date.now() },
    });
  }, []);

  const setLoading = useCallback((value) => {
    dispatch({ type: 'SET_LOADING', value });
  }, []);

  const deleteConversation = useCallback((id) => {
    dispatch({ type: 'DELETE_CONVERSATION', id });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <ChatContext.Provider value={{
      ...state,
      currentConversation,
      newConversation,
      selectConversation,
      addMessage,
      setLoading,
      deleteConversation,
      updateSettings,
      clearAll,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
