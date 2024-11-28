import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  roomTopic: null,
  peersCount: 0,
  lastRoom: null,
  currentRoom: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        ...action.payload,
        reactions: action.payload.reactions || [],
      });
    },
    addReaction: (state, action) => {
      const { messageTimestamp, reaction, memberId } = action.payload;
      const message = state.messages.find(msg => msg.timestamp === messageTimestamp);
      if (message) {
        if (!message.reactions) {
          message.reactions = [];
        }
        message.reactions = message.reactions.filter(r => r.memberId !== memberId);
        message.reactions.push({ reaction, memberId, timestamp: new Date().toISOString() });
      }
    },
    setRoomTopic: (state, action) => {
      state.roomTopic = action.payload;
      if (action.payload) {
        state.lastRoom = action.payload;
      }
    },
    setPeersCount: (state, action) => {
      state.peersCount = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    reconnectToRoom: (state) => {
      if (state.lastRoom) {
        state.roomTopic = state.lastRoom;
      }
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
  },
});

export const {
  addMessage,
  setRoomTopic,
  setPeersCount,
  setConnectionStatus,
  setLoading,
  setError,
  clearError,
  reconnectToRoom,
  setCurrentRoom,
} = messageSlice.actions;

export const selectMessages = (state) => state.messages.messages;
export const selectRoomTopic = (state) => state.messages.roomTopic;
export const selectPeersCount = (state) => state.messages.peersCount;
export const selectIsConnected = (state) => state.messages.isConnected;
export const selectLastRoom = (state) => state.messages.lastRoom;
export const selectCurrentRoom = (state) => state.messages.currentRoom;
export const selectIsLoading = (state) => state.messages.isLoading;
export const selectError = (state) => state.messages.error;

export default messageSlice.reducer;
