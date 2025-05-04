import { combineReducers } from 'redux';
import authReducer from './user/authSlice';
import sidebarReducer from './dashboard/sidebarSlice';
import profileReducer from './user/ProfileSlice';
import bidingReducer from '../reducers/dashboard/bidingSlice';
import jobsReducer from './dashboard/jobsSlice';
import adminReducer from '../slices/adminSlice';
import notificationReducer from './notificationSlice';


const rootReducer = combineReducers({
    auth: authReducer,
    sidebar: sidebarReducer,
    profile: profileReducer,
    bids : bidingReducer,
    jobs: jobsReducer,
    admin: adminReducer,
    notifications: notificationReducer
});

export default rootReducer;
