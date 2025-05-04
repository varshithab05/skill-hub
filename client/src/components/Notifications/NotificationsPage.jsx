import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/Features/notificationSlice';
import { IoCheckmarkDone } from 'react-icons/io5';

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const { notifications, loading } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleMarkAsRead = (notificationId) => {
        dispatch(markAsRead(notificationId));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-blue border-t-transparent shadow-lg"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 text-white max-w-4xl">
            <div className="flex justify-between items-center mb-8 bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-blue to-blue-400 bg-clip-text text-transparent">
                    Notifications
                </h1>
                {notifications?.length > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 rounded-full bg-cyan-blue/20 text-cyan-blue hover:bg-cyan-blue/30 flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                    >
                        <IoCheckmarkDone className="text-lg" />
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications?.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg backdrop-blur-sm">
                    <p className="text-gray-400 text-lg">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications?.map(notification => (
                        <div
                            key={notification._id}
                            className={`p-6 rounded-xl border ${
                                notification.isRead 
                                    ? 'border-gray-700 bg-gray-800/30' 
                                    : 'border-cyan-blue/30 bg-gray-800/50'
                            } backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-blue/10`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h2 className="font-semibold text-xl text-white mb-2">{notification.title}</h2>
                                    <p className="text-gray-300 leading-relaxed">{notification.message}</p>
                                    <small className="text-gray-500 block mt-3 font-medium">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </small>
                                </div>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification._id)}
                                        className="p-2 rounded-full bg-cyan-blue/20 text-cyan-blue hover:bg-cyan-blue/30 transition-all duration-300 transform hover:scale-110"
                                    >
                                        <IoCheckmarkDone className="text-xl" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
