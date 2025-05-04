import React from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { selectIsSidebarMinimized } from "../../redux/Features/dashboard/sidebarSlice";
import Sidebar from "../dashboard/dashboardcomponents/Sidebar";
import TransactionDetails from "./TransactionComponents/TransactionsDetails";
import TransactionsList from "./TransactionComponents/TransactionsList";

const Transactions = () => {
  const isSidebarMinimized = useSelector(selectIsSidebarMinimized);

  return (
    <div className={`p-6 flex ${isSidebarMinimized ? "left-16" : "left-56"}`}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<TransactionsList />} />
        <Route
          path="/details/:transactionId"
          element={<TransactionDetails />}
        />
      </Routes>
    </div>
  );
};

export default Transactions;
