import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  roomTopic: '',
  peersCount: 0,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setRoomTopic: (state, action) => {
      state.roomTopic = action.payload;
    },
    setPeersCount: (state, action) => {
      state.peersCount = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setRoomTopic, setPeersCount, clearMessages } = messageSlice.actions;

export const selectMessages = (state) => state.messages.messages;
export const selectRoomTopic = (state) => state.messages.roomTopic;
export const selectPeersCount = (state) => state.messages.peersCount;

export default messageSlice.reducer;
