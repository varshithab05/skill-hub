import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRecentProjects,
  selectRecentProjects,
  setMyJobPosts,
  selectMyJobPosts,
} from "../../redux/reducers/dashboard/projectsSlice";
import { selectRole } from "../../redux/Features/user/authSlice";
import { selectUserProfile } from "../../redux/Features/user/ProfileSlice";
import Sidebar from "../dashboard/dashboardcomponents/Sidebar";
import { selectIsSidebarMinimized } from "../../redux/reducers/dashboard/sidebarSlice";
import axiosInstance from "../../api/axiosInstance";
import ProjectDetails from "./ProjectComponents/ProjectDetails";

const Projects = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectRecentProjects);
  const myJobPosts = useSelector(selectMyJobPosts);
  const userRole = useSelector(selectRole);
  const userProfile = useSelector(selectUserProfile);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedJobBids, setSelectedJobBids] = useState(null);
  const isSidebarMinimized = useSelector(selectIsSidebarMinimized);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    jobId: null,
    status: null,
  });
  const [projectSearch, setProjectSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");

  const isEmployer = userRole === "enterprise" || userRole === "hybrid";
  const isFreelancer = userRole === "freelancer" || userRole === "hybrid";

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Only fetch projects for freelancers and hybrid users
        if (isFreelancer) {
          const response = await axiosInstance.get("/project/recent-projects");
          dispatch(setRecentProjects(response.data.recentProjects));
        }

        // Fetch job posts for employers and hybrid users
        if (isEmployer && userProfile?._id) {
          const jobsResponse = await axiosInstance.get(
            `/jobs/user/${userProfile._id}`
          );
          dispatch(setMyJobPosts(jobsResponse.data.data));
        }

        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch projects");
      }
      setLoading(false);
    };

    fetchProjects();
  }, [dispatch, isEmployer, isFreelancer, userProfile?._id]);

  const fetchBidsForJob = async (jobId) => {
    try {
      const response = await axiosInstance.get(`/bids/${jobId}`);
      setSelectedJobBids(response.data);
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError("Failed to fetch bids for this job");
    }
  };

  const handleRowClick = async (item, type) => {
    if (type === "project") {
      if (selectedProject && selectedProject._id === item._id) {
        setSelectedProject(null);
      } else {
        setSelectedProject(item);
        setSelectedJobBids(null);
      }
    } else if (type === "job") {
      if (selectedProject && selectedProject._id === item._id) {
        setSelectedProject(null);
        setSelectedJobBids(null);
      } else {
        setSelectedProject(item);
        await fetchBidsForJob(item._id);
      }
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await axiosInstance.put(`/jobs/${jobId}`, { status: newStatus });
      // Update the job status in the local state
      const updatedJobs = myJobPosts.map((job) =>
        job._id === jobId ? { ...job, status: newStatus } : job
      );
      dispatch(setMyJobPosts(updatedJobs));
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to update job status to ${newStatus}`
      );
    }
  };

  const handleStatusUpdateClick = (e, jobId, status) => {
    e.stopPropagation();
    setConfirmAction({ jobId, status });
    setShowConfirmModal(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (confirmAction.jobId && confirmAction.status) {
      await handleStatusUpdate(confirmAction.jobId, confirmAction.status);
      setShowConfirmModal(false);
      setConfirmAction({ jobId: null, status: null });
    }
  };

  const handleCancelStatusUpdate = () => {
    setShowConfirmModal(false);
    setConfirmAction({ jobId: null, status: null });
  };

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.description.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Filter jobs based on search
  const filteredJobs = myJobPosts.filter(job =>
    job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    job.description.toLowerCase().includes(jobSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-grow p-5 top-16 ml-10 transition-all duration-300">
        <Sidebar />
        <div className="w-10/12 mr-6">
          <div className="text-gray-400">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-grow p-6 top-16 ml-10 transition-all duration-300">
        <Sidebar />
        <div className={`w-10/12 mr-6 ${isSidebarMinimized ? "ml-16" : ""}`}>
          {error && (
            <div className="text-red-500 mb-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Projects Section - Only show for freelancers and hybrid users */}
          {isFreelancer && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-white">
                    Recent Projects
                  </h2>
                  <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm border border-gray-600/30">
                    {filteredProjects.length} projects
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-64 bg-gray-700/50 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-600/30 transition-all duration-300 hover:bg-gray-700/70"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl">
                {filteredProjects.map((project) => (
                  <div key={project._id} className="group">
                    <div
                      className="cursor-pointer hover:bg-gray-700/50 transition-all duration-300"
                      onClick={() => handleRowClick(project, "project")}
                    >
                      <div className="p-6 border-b border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {project.title}
                          </h3>
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                              project.status === "in-progress"
                                ? "bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                                : "bg-indigo-900/50 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-400 mt-3 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          {project.description}
                        </p>
                      </div>
                    </div>
                    {selectedProject && selectedProject._id === project._id && (
                      <div className="p-6 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50">
                        <ProjectDetails project={project} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Posts Section - Only show for enterprise and hybrid users */}
          {isEmployer && (
            <div className={`${isFreelancer ? "mt-8" : ""} max-w-6xl mx-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  My Job Posts 
                  <span className="ml-3 text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                    {filteredJobs.length} posts
                  </span>
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all duration-300 hover:bg-gray-600"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
                {filteredJobs.map((job) => (
                  <div key={job._id} className="group">
                    <div
                      className="cursor-pointer hover:bg-gray-700 transition-all duration-300"
                      onClick={() => handleRowClick(job, "job")}
                    >
                      <div className="p-6 border-b border-gray-700">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              job.status === "open"
                                ? "bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                                : job.status === "in-progress"
                                ? "bg-indigo-900/50 text-indigo-300 border border-indigo-500/30"
                                : "bg-gray-700/50 text-gray-300 border border-gray-500/30"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <p className="text-gray-400 mt-3 leading-relaxed">{job.description}</p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-gray-300">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              ${job.budget?.min} - ${job.budget?.max}
                            </span>
                          </div>
                          <div className="flex space-x-3">
                            <Link
                              to={`/jobs/${job._id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Details
                            </Link>
                            {job.status === "open" && (
                              <button
                                onClick={(e) => handleStatusUpdateClick(e, job._id, "closed")}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Close Job
                              </button>
                            )}
                            {job.status === "in-progress" && (
                              <button
                                onClick={(e) => handleStatusUpdateClick(e, job._id, "completed")}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedProject && selectedProject._id === job._id && (
                      <div className="p-6 bg-gray-900/50 backdrop-blur-sm">
                        <ProjectDetails project={job} />
                        {/* Bids Section */}
                        {selectedJobBids && (
                          <div className="mt-6">
                            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Bids
                            </h4>
                            <div className="space-y-4">
                              {selectedJobBids.map((bid) => (
                                <div
                                  key={bid._id}
                                  className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                      <Link
                                        to={`/user/${bid.freelancer.username}`}
                                        className="text-white hover:text-blue-400 transition-colors font-medium"
                                      >
                                        {bid.freelancer.username}
                                      </Link>
                                      <span className="text-gray-400 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        ${bid.amount}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        bid.status === "pending"
                                          ? "bg-yellow-900/50 text-yellow-300 border border-yellow-500/30"
                                          : bid.status === "accepted"
                                          ? "bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                                          : "bg-red-900/50 text-red-300 border border-red-500/30"
                                      }`}
                                    >
                                      {bid.status}
                                    </span>
                                  </div>
                                  {bid.proposalText && (
                                    <p className="text-gray-400 mt-3 leading-relaxed">
                                      {bid.proposalText}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-700 transform transition-all duration-300 ease-in-out scale-100">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-4">
              Confirm Action
            </h3>
            <div className="my-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  confirmAction.status === "completed" 
                    ? "bg-emerald-900/30" 
                    : "bg-red-900/30"
                }`}>
                  {confirmAction.status === "completed" ? (
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-gray-300 text-center text-lg">
                Are you sure you want to mark this job as{" "}
                <span className="font-semibold text-white">{confirmAction.status}</span>?
              </p>
              <p className="text-gray-400 text-center text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelStatusUpdate}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
                  confirmAction.status === "completed"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
