import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const TransactionDetails = () => {
  const { transactionId } = useParams(); // Get transaction ID from the URL
  const [transaction, setTransaction] = useState(null); // State for transaction details
  const [loading, setLoading] = useState(true); // State for loading indicator

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/transaction/${transactionId}`
        ); // Fetch transaction details from backend
        setTransaction(response.data.transaction); // Set transaction data
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        setLoading(false); // Stop loading on error
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  if (loading) {
    return <p className="text-white">Loading transaction details...</p>;
  }

  if (!transaction) {
    return <p className="text-white">Transaction not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Transaction Details</h1>

      <div className="mt-4 bg-dark p-4 rounded shadow">
        <p className="text-white">
          <strong>Transaction ID:</strong> {transaction._id}
        </p>
        <p className="text-white">
          <strong>Amount:</strong> ${transaction.amount.toFixed(2)}
        </p>
        <p className="text-white">
          <strong>Transaction Type:</strong> {transaction.transactionType}
        </p>
        <p className="text-white">
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded-full ${
              transaction.status === "pending"
                ? "border-yellow-500 text-yellow-100"
                : transaction.status === "completed"
                ? "border-emerald-500 text-emerald-100"
                : "border-red-500 text-red-100"
            } text-center border text-xs`}
          >
            {transaction.status}
          </span>
        </p>
        <p className="text-white">
          <strong>Commission:</strong> ${transaction.commission.toFixed(2)}
        </p>
        <p className="text-white">
          <strong>Job:</strong>{" "}
          {transaction.job && transaction.job.title
            ? transaction.job.title
            : "N/A"}
        </p>
        <p className="text-white">
          <strong>Created At:</strong>{" "}
          {new Date(transaction.createdAt).toLocaleString()}
        </p>
        <p className="text-white">
          <strong>Updated At:</strong>{" "}
          {new Date(transaction.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TransactionDetails;
