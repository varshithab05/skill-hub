import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// Async thunk for fetching user chats
export const fetchUserChats = createAsyncThunk(
  "chat/fetchUserChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/chat");
      return response.data.chats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching chats"
      );
    }
  }
);

// Async thunk for fetching a specific chat
export const fetchChatById = createAsyncThunk(
  "chat/fetchChatById",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/chat/${chatId}`);
      return response.data.chat;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching chat"
      );
    }
  }
);

// Async thunk for creating a new chat
export const createChat = createAsyncThunk(
  "chat/createChat",
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/chat", { recipientId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error creating chat"
      );
    }
  }
);

// Async thunk for sending a message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId, content }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/chat/${chatId}/messages`, {
        content,
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error sending message"
      );
    }
  }
);

// Async thunk for marking messages as read
export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async (chatId, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/chat/${chatId}/read`);
      return chatId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error marking messages as read"
      );
    }
  }
);

// Async thunk for searching users
export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/chat/search/users?query=${query}`
      );
      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error searching users"
      );
    }
  }
);

const initialState = {
  chats: [],
  currentChat: null,
  searchResults: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;

      // Ensure message has the correct structure
      if (!message || !chatId) {
        console.error(
          "Invalid message or chatId in addMessage:",
          action.payload
        );
        return;
      }

      // Handle case where sender might be a string ID instead of an object
      if (typeof message.sender === "string") {
        console.warn(
          "Message sender is a string ID instead of an object:",
          message.sender
        );
      }

      // Update the current chat if it's the active one
      if (state.currentChat && state.currentChat._id === chatId) {
        // Check if the message already exists to prevent duplicates
        const messageExists = state.currentChat.messages.some(
          (msg) => msg._id === message._id
        );

        if (!messageExists) {
          // Use immutable pattern for better performance
          state.currentChat = {
            ...state.currentChat,
            messages: [...state.currentChat.messages, message],
          };
        } else {
          console.log("Duplicate message detected, not adding:", message);
        }
      }

      // Update the chat in the list
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        // Update last message only if it's newer
        const currentLastMessage = state.chats[chatIndex].lastMessage;
        const newMessageTime = new Date(message.createdAt).getTime();
        const currentLastMessageTime = currentLastMessage
          ? new Date(currentLastMessage.createdAt).getTime()
          : 0;

        if (!currentLastMessage || newMessageTime > currentLastMessageTime) {
          // Create a new chat object to ensure proper re-rendering
          const updatedChat = {
            ...state.chats[chatIndex],
            lastMessage: message,
          };

          // Handle unread count
          // Handle case where sender might be a string ID or an object
          const senderId =
            typeof message.sender === "object"
              ? message.sender._id
              : message.sender;

          const otherUserId = state.currentChat?.otherUser?._id;

          if (!message.read && senderId !== otherUserId) {
            updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
            state.unreadCount += 1;
          }

          // Update the chats array immutably
          state.chats = [
            updatedChat,
            ...state.chats.slice(0, chatIndex),
            ...state.chats.slice(chatIndex + 1),
          ];
        }
      }
    },
    markChatAsRead: (state, action) => {
      const chatId = action.payload;

      // Update the current chat if it's the active one
      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat.messages.forEach((message) => {
          if (!message.read) {
            message.read = true;
          }
        });
      }

      // Update the chat in the list
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        const previousUnreadCount = state.chats[chatIndex].unreadCount;
        state.chats[chatIndex].unreadCount = 0;
        state.unreadCount -= previousUnreadCount;
      }
    },
    updateTotalUnreadCount: (state) => {
      state.unreadCount = state.chats.reduce(
        (total, chat) => total + chat.unreadCount,
        0
      );
    },
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchUserChats
      .addCase(fetchUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        state.unreadCount = action.payload.reduce(
          (total, chat) => total + chat.unreadCount,
          0
        );
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchChatById
      .addCase(fetchChatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;

        // Mark this chat as read in the list
        const chatIndex = state.chats.findIndex(
          (chat) => chat._id === action.payload._id
        );
        if (chatIndex !== -1) {
          const previousUnreadCount = state.chats[chatIndex].unreadCount;
          state.chats[chatIndex].unreadCount = 0;
          state.unreadCount -= previousUnreadCount;
        }
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createChat
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state) => {
        state.loading = false;
        // We'll fetch the chat details separately
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;

        // Add the message to the current chat immediately
        // This ensures the message appears right away without waiting for socket
        if (state.currentChat && action.payload) {
          const message = action.payload;
          const chatId = state.currentChat._id;

          // Check if the message already exists to prevent duplicates
          const messageExists = state.currentChat.messages.some(
            (msg) => msg._id === message._id
          );

          if (!messageExists) {
            // Handle case where sender might be a string ID instead of an object
            if (typeof message.sender === "string") {
              console.warn(
                "Message sender is a string ID instead of an object:",
                message.sender
              );
            }

            // Add to current chat
            state.currentChat.messages.push(message);

            // Update the chat in the list
            const chatIndex = state.chats.findIndex(
              (chat) => chat._id === chatId
            );
            if (chatIndex !== -1) {
              // Update last message
              state.chats[chatIndex].lastMessage = message;

              // Move this chat to the top of the list
              const updatedChat = state.chats[chatIndex];
              state.chats.splice(chatIndex, 1);
              state.chats.unshift(updatedChat);
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // markMessagesAsRead
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const chatId = action.payload;

        // Update the current chat if it's the active one
        if (state.currentChat && state.currentChat._id === chatId) {
          state.currentChat.messages.forEach((message) => {
            message.read = true;
          });
        }

        // Update the chat in the list
        const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
        if (chatIndex !== -1) {
          const previousUnreadCount = state.chats[chatIndex].unreadCount;
          state.chats[chatIndex].unreadCount = 0;
          state.unreadCount -= previousUnreadCount;
        }
      })

      // searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export const {
  setCurrentChat,
  clearCurrentChat,
  addMessage,
  markChatAsRead,
  updateTotalUnreadCount,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
