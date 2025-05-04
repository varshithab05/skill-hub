import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/notifications');
            console.log("hi");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const getUnreadCount = createAsyncThunk(
    'notifications/getUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/notifications/unread-count');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch notifications';
            })
            // Get unread count
            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count;
            })
            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload.notification._id);
                if (notification) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark all as read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.isRead = true;
                });
                state.unreadCount = 0;
            });
    },
});

export default notificationSlice.reducer;
