import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../api/axiosInstance";
import {
  setJobById,
  selectJobById,
  setBidSuccess,
  resetBidSuccess,
} from "../../../redux/Features/dashboard/jobsSlice";
import { useParams } from "react-router-dom";

const JobDetails = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const job = useSelector(selectJobById);
  const bidSuccess = useSelector((state) => state.jobs.bidSuccess);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/jobs/user/${jobId}`);
        if (response.data && response.data.job) {
          dispatch(setJobById(response.data.job));
        } else {
          throw new Error("Job data not found");
        }
      } catch (error) {
        setError(error.message || "Failed to fetch job details");
        console.error("Error fetching job details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }

    return () => {
      dispatch(resetBidSuccess());
    };
  }, [dispatch, jobId]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await axiosInstance.post(`/jobs/${jobId}/bid`, {
        amount: parseFloat(amount),
      });
      dispatch(setBidSuccess(true));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit bid");
      console.error("Error submitting bid:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-white">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!job || !job.budget) {
    return (
      <div className="p-6 text-white">
        <p>Job not found or invalid job data</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-4">{job.title}</h1>
      <div className="space-y-4">
        <p className="text-gray-300">{job.description}</p>
        <p className="text-gray-300">
          Budget: ${job.budget.min} - ${job.budget.max}
        </p>

        {bidSuccess ? (
          <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg">
            <p className="text-green-500">Your bid has been placed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">
                Bid Amount:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={job.budget.min}
                  max={job.budget.max}
                  className="ml-2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Submit Bid
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
