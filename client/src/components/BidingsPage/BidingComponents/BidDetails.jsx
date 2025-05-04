import React from "react";

const BidDetails = ({ bid }) => {
  if (!bid || !bid.job) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 mt-4 rounded-xl border border-gray-700 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Job Details Card */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="bg-blue-500 w-2 h-8 rounded-full mr-3"></span>
            Job Information
          </h3>
          <div className="space-y-4">
            <div className="transform hover:scale-102 transition-transform">
              <label className="text-gray-400 text-sm font-medium">Title</label>
              <p className="text-white text-lg font-semibold mt-1">{bid.job.title}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium">Description</label>
              <p className="text-gray-200 mt-1 leading-relaxed">{bid.job.description}</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <label className="text-gray-400 text-sm font-medium">Budget Range</label>
              <p className="text-green-400 text-xl font-bold mt-1">
                ${bid.job.budget.min} - ${bid.job.budget.max}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium">Status</label>
              <p className="text-white mt-1 inline-block px-4 ml-2 py-1 rounded-full bg-gray-700">
                {bid.job.status}
              </p>
            </div>
          </div>
        </div>

        {/* Bid Details Card */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="bg-purple-500 w-2 h-8 rounded-full mr-3"></span>
            Bid Information
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <label className="text-gray-400 text-sm font-medium">Your Bid Amount</label>
              <p className="text-purple-400 text-2xl font-bold mt-1">${bid.amount}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium">Bid Status</label>
              <p className={`inline-block px-4 py-2 ml-2 rounded-full text-sm font-medium ${
                bid.status === "accepted"
                  ? "bg-green-500/20 text-green-400 border border-green-500"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500"
              }`}>
                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-gray-400 text-sm font-medium">Submitted On</label>
              <p className="text-white bg-gray-700 px-3 py-1 rounded-lg">
                {new Date(bid.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidDetails;
