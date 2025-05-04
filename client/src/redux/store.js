import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./Features/dashboard/jobsSlice";
import notificationReducer from "./Features/notificationSlice";
import authReducer from "./Features/user/authSlice";
import profileReducer from "./Features/user/ProfileSlice";
import bidingReducer from "./reducers/dashboard/bidingSlice";
import earningsReducer from "./reducers/dashboard/earningsSlice";
import projectsReducer from "./reducers/dashboard/projectsSlice";
import sidebarReducer from "./reducers/dashboard/sidebarSlice";
import adminJobsReducer from "./slices/adminJobsSlice";
import adminReportsReducer from "./slices/adminReportsSlice";
import adminReducer from "./slices/adminSlice";
import adminUsersReducer from "./slices/adminUsersSlice";
import chatReducer from "./Features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    admin: adminReducer,
    adminUsers: adminUsersReducer,
    adminJobs: adminJobsReducer,
    adminReports: adminReportsReducer,
    sidebar: sidebarReducer,
    bids: bidingReducer,
    earnings: earningsReducer,
    jobs: jobsReducer,
    notifications: notificationReducer,
    projects: projectsReducer,
    chat: chatReducer,
  },
});

export default store;
