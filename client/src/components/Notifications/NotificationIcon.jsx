import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoNotifications } from 'react-icons/io5';
import { getUnreadCount } from '../../redux/Features/notificationSlice';

const NotificationIcon = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { unreadCount } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(getUnreadCount());
        // Poll for new notifications every minute
        const interval = setInterval(() => {
            dispatch(getUnreadCount());
        }, 60000);

        return () => clearInterval(interval);
    }, [dispatch]);

    return (
        <div className="relative cursor-pointer" onClick={() => navigate('/notifications')}>
            <IoNotifications className="text-2xl text-white" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon;
