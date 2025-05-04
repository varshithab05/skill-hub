import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import axiosInstance from "../../../api/axiosInstance";
import {
  selectRecentJobs,
  setRecentJobs,
} from "../../../redux/Features/dashboard/jobsSlice";

const RecentJobsSummary = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(selectRecentJobs);
  const [jobsToDisplay, setJobsToDisplay] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/jobs/jobs/filtered");
        dispatch(setRecentJobs(response.data));
        setJobsToDisplay(
          response.data.jobs.length > 5
            ? response.data.jobs.slice(0, 5)
            : response.data.jobs
        );
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to fetch recent jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentJobs();
  }, [dispatch]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Jobs</h2>
        <div className="flex items-center justify-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-t-2 border-indigo-500 rounded-full"
          />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Jobs</h2>
        <p className="text-red-400">{error}</p>
      </motion.div>
    );
  }

  if (jobsToDisplay.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Jobs</h2>
        <div className="text-gray-300 text-center py-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl mb-4 block">💼</span>
            <p>No jobs available at the moment.</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Recent Jobs</h2>

      {/* Header */}
      <motion.div 
        className="grid grid-cols-4 text-left bg-gray-900/70 text-gray-200 font-medium rounded-lg mb-4 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="p-4">Job Title</div>
        <div className="p-4">Description</div>
        <div className="p-4">Budget</div>
        <div className="p-4">Status</div>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {jobsToDisplay.map((job) => (
          <motion.div
            key={job._id}
            variants={item}
            whileHover={{ scale: 1.01 }}
            className="grid grid-cols-4 text-left bg-gray-900/50 text-white rounded-lg border border-gray-600 hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg"
          >
            <Link 
              className="p-4 truncate" 
              to={`/jobs/${job._id}`}
            >
              <span className="text-indigo-300 hover:text-indigo-200 font-medium">
                {job.title}
              </span>
            </Link>
            <div className="p-4 truncate text-gray-200">{job.description}</div>
            <div className="p-4 text-gray-200">
              ${job.budget.min} - ${job.budget.max}
            </div>
            <div className="p-4">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === "open"
                    ? "bg-yellow-500/30 text-yellow-200 border border-yellow-500/40"
                    : job.status === "in-progress"
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/40"
                    : job.status === "completed"
                    ? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/40"
                    : "bg-red-500/30 text-red-200 border border-red-500/40"
                }`}
              >
                {job.status}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <Link
          to="/marketplace"
          className="inline-block text-indigo-300 hover:text-indigo-200 font-medium transition-colors duration-200"
        >
          View All Jobs →
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default RecentJobsSummary;
