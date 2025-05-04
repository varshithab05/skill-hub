import React from "react";
import { useSelector } from "react-redux";
import Sidebar from "./dashboardcomponents/Sidebar";
import EarningsSummary from "./dashboardcomponents/earningsSummary";
import BiddingSummary from "./dashboardcomponents/bidingSummary";
import ProjectsSummary from "./dashboardcomponents/projectsSummary";
import RecentJobsSummary from "./dashboardcomponents/recentJobsSummary";
import { selectIsSidebarMinimized } from "../../redux/reducers/dashboard/sidebarSlice";
import { selectUsername, selectRole } from "../../redux/Features/user/authSlice";

const UnifiedDashboard = () => {
  const isSidebarMinimized = useSelector(selectIsSidebarMinimized);
  const userName = useSelector(selectUsername);
  const userRole = useSelector(selectRole);

  const renderDashboardComponents = () => {
    switch (userRole) {
      case "freelancer":
        return (
          <div className="space-y-6">
            <BiddingSummary />
            <RecentJobsSummary />
            <ProjectsSummary />
            <EarningsSummary />
          </div>
        );
      case "enterprise":
        return (
          <div className="space-y-6">
            <BiddingSummary />
            <ProjectsSummary />
            <EarningsSummary />
          </div>
        );
      case "hybrid":
        return (
          <div className="space-y-6">
            <BiddingSummary />
            <RecentJobsSummary />
            <ProjectsSummary />
            <EarningsSummary />
          </div>
        );
      default:
        return (
          <div className="text-center text-gray-400">
            Loading dashboard components...
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarMinimized ? "ml-16" : ""
        }`}
      >
        <div className="flex flex-col p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="flex justify-between items-center bg-gray-800/70 p-8 mb-8 rounded-2xl shadow-2xl border border-gray-600/30 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                Welcome back, {userName}!
              </h1>
              <span className="text-md text-gray-300 capitalize flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {userRole} Dashboard
              </span>
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none"></div>
            {renderDashboardComponents()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
