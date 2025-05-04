import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import axiosInstance from "../../../api/axiosInstance";

const TransactionsList = () => {
  // Local state to manage transactions
  const [transactionsToDisplay, setTransactionsToDisplay] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosInstance.get(
          "/transaction/all-transactions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with your token retrieval logic
            },
          }
        );

        // If more than 5 transactions, slice to get the first 5, else set all transactions
        setTransactionsToDisplay(
          response.data.transactions.length > 5
            ? response.data.transactions.slice(0, 5)
            : response.data.transactions
        );
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  if (transactionsToDisplay.length === 0) {
    return <p className="text-white">No transactions available.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Transactions</h2>

      {/* Table-like layout using grid */}
      <div className="grid grid-cols-5 text-left bg-grey text-cyan-blue font-medium rounded-t-lg">
        <div className="p-3">Transaction ID</div>
        <div className="p-3">Job Title</div>
        <div className="p-3">Amount</div>
        <div className="p-3">Status</div>
        <div className="p-3">Details</div>
      </div>

      {/* Map through transactionsToDisplay and display entries */}
      {transactionsToDisplay.map((transaction) => (
        <div
          key={transaction._id}
          className="grid grid-cols-5 text-left bg-grey text-white border-b border-gray-700 my-2"
        >
          <div className="p-3 break-all">{transaction._id}</div>
          <div className="p-3 break-all">
            {transaction.job && transaction.job.title
              ? transaction.job.title
              : "N/A"}
          </div>
          <div className="p-3 break-all">${transaction.amount.toFixed(2)}</div>
          <div className="p-3">
            <span
              className={`px-2 py-1 rounded-full ${
                transaction.status === "pending"
                  ? "border-yellow-500 text-yellow-100"
                  : transaction.status === "completed"
                  ? "border-emerald-500 text-emerald-100"
                  : transaction.status === "failed"
                  ? "border-red-500 text-red-100"
                  : "bg-gray-500"
              } text-center border text-xs`}
            >
              {transaction.status}
            </span>
          </div>
          <div className="p-3">
            {/* Link to navigate to TransactionDetails with transactionId */}
            <Link to={`/transactions/details/${transaction._id}`}>
              <span className="text-blue-500 hover:underline cursor-pointer">
                View Details
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionsList;
