import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectBidsForUser } from "../../redux/reducers/dashboard/bidingSlice";
import BidDetails from "./BidingComponents/BidDetails";
import Sidebar from "../dashboard/dashboardcomponents/Sidebar";
import { selectIsSidebarMinimized } from "../../redux/reducers/dashboard/sidebarSlice";
import { FiSearch, FiFilter } from 'react-icons/fi';

const Bids = () => {
  const bids = useSelector(selectBidsForUser);
  const [selectedBid, setSelectedBid] = useState(null);
  const isSidebarMinimized = useSelector(selectIsSidebarMinimized);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAmount, setFilterAmount] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleRowClick = (bid) => {
    if (selectedBid && selectedBid._id === bid._id) {
      setSelectedBid(null);
    } else {
      setSelectedBid(bid);
    }
  };

  const filteredBids = useMemo(() => {
    return bids
      ?.filter((bid) => bid.job && bid.job.title)
      .filter((bid) => {
        const matchesSearch = 
          bid.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bid.amount.toString().includes(searchTerm);

        const matchesStatus = 
          filterStatus === "all" || bid.status === filterStatus;

        let matchesAmount = true;
        if (filterAmount === "0-100") {
          matchesAmount = bid.amount <= 100;
        } else if (filterAmount === "101-500") {
          matchesAmount = bid.amount > 100 && bid.amount <= 500;
        } else if (filterAmount === "501-1000") {
          matchesAmount = bid.amount > 500 && bid.amount <= 1000;
        } else if (filterAmount === "1000+") {
          matchesAmount = bid.amount > 1000;
        }

        return matchesSearch && matchesStatus && matchesAmount;
      });
  }, [bids, searchTerm, filterStatus, filterAmount]);

  return (
    <div className={`flex flex-grow bg-gray-900 min-h-screen ${
      isSidebarMinimized ? "ml-5" : "ml-10"
    } transition-all duration-300`}>
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Bids <span className="text-sm text-blue-400 ml-2">({filteredBids?.length || 0})</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-72 px-4 py-3 bg-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 transition-all placeholder-gray-400"
                  />
                  <FiSearch className="absolute left-4 top-3.5 text-blue-400 text-lg" />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-gray-700 text-blue-400 rounded-xl flex items-center gap-2 hover:bg-gray-600 transition-all duration-300 shadow-sm"
                >
                  <FiFilter className="text-lg" />
                  Filters
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-700 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Amount Range
                  </label>
                  <select
                    value={filterAmount}
                    onChange={(e) => setFilterAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">All Amounts</option>
                    <option value="0-100">$0 - $100</option>
                    <option value="101-500">$101 - $500</option>
                    <option value="501-1000">$501 - $1000</option>
                    <option value="1000+">$1000+</option>
                  </select>
                </div>
              </div>
            )}

            <div className="overflow-hidden bg-gray-800 rounded-xl shadow-md">
              <table className="w-full text-left">
                <thead className="bg-gray-700 text-gray-300 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredBids && filteredBids.length > 0 ? (
                    filteredBids.map((bid) => (
                      <React.Fragment key={bid._id}>
                        <tr
                          className={`hover:bg-gray-700 cursor-pointer transition-all duration-300 ${
                            selectedBid?._id === bid._id ? "bg-gray-700" : ""
                          }`}
                          onClick={() => handleRowClick(bid)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-100">{bid.job.title}</div>

                          </td>
                          <td className="px-6 py-4 text-gray-100 font-medium">
                            ${bid.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                                bid.status === "accepted"
                                  ? "bg-green-900 text-green-300 border border-green-700"
                                  : bid.status === "rejected"
                                  ? "bg-red-900 text-red-300 border border-red-700"
                                  : "bg-yellow-900 text-yellow-300 border border-yellow-700"
                              }`}
                            >
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                        {selectedBid?._id === bid._id && (
                          <tr>
                            <td colSpan="3" className="bg-gray-700">
                              <BidDetails bid={bid} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                        No bids found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bids;
