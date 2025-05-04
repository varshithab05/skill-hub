import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  setRecentProjects, 
  selectRecentProjects,
  setMyJobPosts,
  selectMyJobPosts 
} from "../../../redux/reducers/dashboard/projectsSlice";
import { selectRole } from "../../../redux/Features/user/authSlice";
import { selectUserProfile } from "../../../redux/Features/user/ProfileSlice";
import axiosInstance from "../../../api/axiosInstance";

const ProjectsSummary = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectRecentProjects);
  const myJobPosts = useSelector(selectMyJobPosts);
  const userRole = useSelector(selectRole);
  const userProfile = useSelector(selectUserProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEmployer = userRole === "enterprise" || userRole === "hybrid";
  const isFreelancer = userRole === "freelancer" || userRole === "hybrid";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const errors = [];

      try {
        if (isFreelancer) {
          try {
            const projectsResponse = await axiosInstance.get("/project/recent-projects");
            if (projectsResponse.data.recentProjects) {
              dispatch(setRecentProjects(projectsResponse.data.recentProjects));
            } else {
              dispatch(setRecentProjects([]));
            }
          } catch (err) {
            if (err.response?.status === 404) {
              dispatch(setRecentProjects([]));
            } else {
              errors.push("Failed to fetch recent projects");
            }
          }
        }

        if (isEmployer && userProfile?._id) {
          try {
            const jobsResponse = await axiosInstance.get(`/jobs/user/${userProfile._id}`);
            if (jobsResponse.data.data) {
              dispatch(setMyJobPosts(jobsResponse.data.data));
            } else {
              dispatch(setMyJobPosts([]));
            }
          } catch (err) {
            if (err.response?.status === 404) {
              dispatch(setMyJobPosts([]));
            } else {
              errors.push("Failed to fetch job posts");
            }
          }
        }

        if (errors.length > 0) {
          setError(errors.join(", "));
        }
      } catch (err) {
        setError("Failed to fetch data");
      }
      setLoading(false);
    };

    fetchData();
  }, [dispatch, isEmployer, isFreelancer, userProfile?._id]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">📊</span> Dashboard Summary
        </h2>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">⚠️</span> Dashboard Summary
        </h2>
        <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  const hasNoData = (!isFreelancer || !projects || projects.length === 0) && 
                    (!isEmployer || !myJobPosts || myJobPosts.length === 0);

  if (hasNoData) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">📋</span> Dashboard Summary
        </h2>
        <div className="text-gray-400 bg-gray-800/50 p-6 rounded-lg border border-gray-600 text-center">
          <div className="text-5xl mb-4">🎯</div>
          {isFreelancer && isEmployer 
            ? "No projects or job posts found. Start bidding on jobs or post new jobs to see them here!"
            : isFreelancer 
            ? "No projects found. Start bidding on jobs to see them here!"
            : "No job posts found. Start posting jobs to see them here!"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isFreelancer && projects && projects.length > 0 && (
        <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2"></span> Recent Projects
          </h3>
          <div className="grid gap-6">
            {projects.slice(0, 3).map((project) => (
              <div key={project._id} 
                className="p-6 bg-gray-800/40 rounded-xl hover:bg-gray-700/40 transition-all duration-300 transform hover:-translate-y-1 border border-gray-600 hover:border-gray-500">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                    {project.title}
                  </h4>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    project.status === "completed"
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-full">
                    💰 ${project.budget?.min} - ${project.budget?.max}
                  </span>
                  <span className="text-purple-400 bg-purple-900/20 px-3 py-1.5 rounded-full">
                    ⏰ Due: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEmployer && myJobPosts && myJobPosts.length > 0 && (
        <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">💼</span> My Job Posts
          </h3>
          <div className="grid gap-6">
            {myJobPosts.slice(0, 3).map((job) => (
              <div key={job._id} 
                className="p-6 bg-gray-800/40 rounded-xl hover:bg-gray-700/40 transition-all duration-300 transform hover:-translate-y-1 border border-gray-600 hover:border-gray-500">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                    {job.title}
                  </h4>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    job.status === "completed"
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : job.status === "in-progress"
                      ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                      : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-full">
                    💰 ${job.budget?.min} - ${job.budget?.max}
                  </span>
                  <span className="text-purple-400 bg-purple-900/20 px-3 py-1.5 rounded-full">
                    📅 Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSummary;
