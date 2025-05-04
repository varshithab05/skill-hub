import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import JobsList from "./JobsComponents/JobsList";
import JobDetails from "./JobsComponents/JobDetails";
import Sidebar from "../dashboard/dashboardcomponents/Sidebar";
import { selectIsSidebarMinimized } from "../../redux/Features/dashboard/sidebarSlice";

const Jobs = () => {
  const isSidebarMinimized = useSelector(selectIsSidebarMinimized);
  return (
    <div className={`p-6 flex ${isSidebarMinimized ? "left-16" : "left-56"}`}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<JobsList />} />
        <Route path="/user/:jobId" element={<JobDetails />} />
      </Routes>
    </div>
  );
};

export default Jobs;
