import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from "../../../api/axiosInstance";
import { setBids, selectBidsForUser } from "../../../redux/reducers/dashboard/bidingSlice";

const BiddingSummary = () => {
  const dispatch = useDispatch();
  const bids = useSelector(selectBidsForUser);
  const [status, setStatus] = useState("loading");
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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Prepare data for the graph
  const prepareGraphData = () => {
    if (!bids) return [];
    return bids
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(bid => ({
        date: new Date(bid.createdAt).toLocaleDateString(),
        amount: bid.amount
      }));
  };

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axiosInstance.get("/bids/recent/bid");
        if (response.data.recentBids) {
          dispatch(setBids(response.data.recentBids));
          setStatus("succeeded");
        } else {
          dispatch(setBids([]));
          setStatus("empty");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          dispatch(setBids([]));
          setStatus("empty");
        } else {
          console.error("Error fetching bids:", error);
          setError(error.response?.data?.message || "Failed to fetch bids");
          setStatus("failed");
        }
      }
    };

    fetchBids();
  }, [dispatch]);

  const LoadingState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
    >
      <h2 className="text-xl font-bold text-white mb-4">Latest Bids</h2>
      <div className="flex items-center justify-center h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-t-2 border-blue-500 rounded-full"
        />
      </div>
    </motion.div>
  );

  if (status === "loading") return <LoadingState />;

  if (status === "failed") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
      >
        <h2 className="text-xl font-bold text-white mb-4">Latest Bids</h2>
        <div className="text-red-500">Error: {error}</div>
      </motion.div>
    );
  }

  if (status === "empty" || !bids || bids.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
      >
        <h2 className="text-xl font-bold text-white mb-4">Latest Bids</h2>
        <div className="text-gray-400 text-center py-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl mb-4 block">📊</span>
            <p>No bids found. Start bidding on jobs to see them here!</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const graphData = prepareGraphData();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
    >
      <h2 className="text-xl font-bold text-white mb-6">Latest Bids</h2>
      
      {/* Bid Amount Trend Graph */}
      <div className="mb-8 bg-gray-900/50 p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Bid Amount Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="bidAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#E5E7EB' }}
                itemStyle={{ color: '#4F46E5' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#bidAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bid Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {bids.map((bid) => (
          <motion.div
            key={bid._id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 p-5 rounded-xl shadow-lg border border-gray-700/50"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-white truncate pr-2">
                {bid.job?.title || "Job Title Unavailable"}
              </h3>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bid.status === "accepted"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : bid.status === "rejected"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {bid.status}
              </motion.span>
            </div>
            <p className="text-gray-300 mb-3 font-medium">
              Bid Amount: <span className="text-indigo-400">${bid.amount}</span>
            </p>
            <div className="text-sm text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {bid.createdAt && (
                <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default BiddingSummary;
