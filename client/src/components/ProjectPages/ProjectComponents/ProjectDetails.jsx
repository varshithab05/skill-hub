import React from "react";
import { motion } from "framer-motion";

const ProjectDetails = ({ project }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          >
            {project.title}
          </motion.h3>
          <p className="text-gray-300 text-lg leading-relaxed">{project.description}</p>
          
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Required Skills</h4>
            <div className="flex flex-wrap gap-3">
              {project.skillsRequired?.map((skill, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Categories</h4>
            <div className="flex flex-wrap gap-3">
              {project.categories?.map((category, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {category}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-xl"
          >
            <h4 className="text-xl font-semibold text-white mb-6">Project Details</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 hover:bg-gray-700/30 rounded-lg transition-all duration-200">
                <span className="text-gray-300">Budget</span>
                <span className="text-green-400 font-semibold">${project.budget?.min} - ${project.budget?.max}</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-gray-700/30 rounded-lg transition-all duration-200">
                <span className="text-gray-300">Status</span>
                <span
                  className={`px-4 py-2 rounded-full font-medium ${
                    project.status === "in-progress"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : project.status === "completed"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-gray-700/30 rounded-lg transition-all duration-200">
                <span className="text-gray-300">Created</span>
                <span className="text-blue-400">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-gray-700/30 rounded-lg transition-all duration-200">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-purple-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-gray-700/30 rounded-lg transition-all duration-200">
                <span className="text-gray-300">Bid Accepted</span>
                <span className={`font-medium ${project.bidAccepted ? "text-green-400" : "text-red-400"}`}>
                  {project.bidAccepted ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetails;