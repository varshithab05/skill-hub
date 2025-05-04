import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEarningsSummary,
  fetchWalletBalance,
} from "../../../redux/reducers/dashboard/earningsSlice";

const EarningsSummary = () => {
  // const dispatch = useDispatch();
  // const { wallet, recentTransactions, status, error } = useSelector(
  //   (state) => state.earnings
  // );

  // useEffect(() => {
  //   dispatch(fetchWalletBalance()); // Fetch wallet balance
  //   dispatch(fetchEarningsSummary()); // Fetch recent transactions
  // }, [dispatch]);

  // if (status === "loading") {
  //   return (
  //     <div className="flex justify-center items-center h-screen bg-dark text-light">
  //       <p className="text-xl font-semibold">Loading...</p>
  //     </div>
  //   );
  // }

  // if (status === "failed") {
  //   return (
  //     <div className="flex justify-center items-center h-screen bg-dark text-red-500">
  //       <p className="text-red-500 text-xl">Error: {error}</p>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="bg-dark p-6 w-full">
  //     <div className="mx-auto bg-grey rounded-lg shadow-lg p-6">
  //       <h2 className="text-3xl font-bold text-left text-light mb-6">
  //         Wallet & Recent Transactions
  //       </h2>

  //       {/* Wallet Balance */}
  //       <div className="flex items-center justify-between p-6 bg-cyan-blue text-dark rounded-lg shadow-lg mb-8">
  //         <div>
  //           <h3 className="text-lg font-semibold">Current Wallet Balance</h3>
  //           <p className="text-3xl font-bold">
  //             ${wallet ? wallet.toFixed(2) : "0.00"}
  //           </p>
  //         </div>
  //         <div className="text-4xl">💰</div>
  //       </div>

  //       {/* Recent Transactions */}
  //       <h3 className="text-2xl font-semibold text-light mb-4">
  //         Recent Transactions
  //       </h3>
  //       <div className="grid grid-cols-1 gap-6">
  //         {recentTransactions.map((transaction) => (
  //           <div
  //             key={transaction._id}
  //             className="p-4 bg-grey rounded-lg shadow-md flex justify-between items-center"
  //           >
  //             <div>
  //               <h4 className="text-lg font-semibold text-light">
  //                 {transaction.job?.title || "N/A"}
  //               </h4>
  //               <p
  //                 className={`text-sm mt-1 ${
  //                   transaction.transactionType === "credit"
  //                     ? "text-green-400"
  //                     : "text-red-400"
  //                 }`}
  //               >
  //                 {transaction.transactionType === "credit"
  //                   ? "Credit"
  //                   : "Debit"}
  //                 : ${transaction.amount.toFixed(2)}
  //               </p>
  //             </div>
  //             <div>
  //               <span
  //                 className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
  //                   transaction.status === "completed"
  //                     ? "bg-green-100 text-green-500"
  //                     : "bg-yellow-100 text-yellow-600"
  //                 }`}
  //               >
  //                 {transaction.status}
  //               </span>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
  return <></>;
};

export default EarningsSummary;
