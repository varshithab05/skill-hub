import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import {
  selectRecentJobs,
  setRecentJobs,
} from "../../../redux/Features/dashboard/jobsSlice";

const JobsList = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(selectRecentJobs);
  const [jobsToDisplay, setJobsToDisplay] = useState([]);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response = await axiosInstance.get("/jobs/jobs/filtered");
        console.log(response.data.jobs);
        dispatch(setRecentJobs(response.data.jobs));
        setJobsToDisplay(
          response.data.jobs.length > 5
            ? response.data.jobs.slice(0, 5)
            : response.data.jobs
        );
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchRecentJobs();
  }, [dispatch]);

  if (jobsToDisplay.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300 text-base font-medium bg-gray-800/70 rounded-lg p-4 shadow-lg border border-gray-600/30 backdrop-blur-sm">
          No jobs available at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-6 bg-gray-800/70 rounded-2xl shadow-2xl border border-gray-600/30 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 border-b border-gray-600/30 pb-3">
        Available Jobs
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {jobsToDisplay.map((job) => (
          <div
            key={job._id}
            className="bg-gray-800/70 rounded-xl p-6 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl border border-gray-600/30 backdrop-blur-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-300 mb-3 line-clamp-2 text-base">
                  {job.description}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full ${
                  job.status === "open"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500"
                    : job.status === "in-progress"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500"
                    : job.status === "completed"
                    ? "bg-green-500/20 text-green-300 border-green-500"
                    : "bg-rose-500/20 text-rose-300 border-rose-500"
                } border text-xs font-bold uppercase tracking-wider`}
              >
                {job.status}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-600/30">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Budget:</span>
                <div className="text-blue-400 font-bold text-base">
                  ${job.budget.min} - ${job.budget.max}
                </div>
              </div>
              <Link
                to={`/jobs/${job._id}`}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 font-medium text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsList;
