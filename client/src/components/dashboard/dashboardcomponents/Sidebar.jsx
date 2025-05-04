import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { TiHomeOutline } from "react-icons/ti";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineWorkOutline } from "react-icons/md";
import { BiDollarCircle } from "react-icons/bi";
import { FaLaptopCode } from "react-icons/fa";
import { RiAccountCircleLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSidebar,
  selectIsSidebarMinimized,
} from "../../../redux/reducers/dashboard/sidebarSlice";
import { selectRole } from "../../../redux/Features/user/authSlice";

function Sidebar() {
  const dispatch = useDispatch();
  const isSidebarMinimized = useSelector(selectIsSidebarMinimized);
  const userRole = useSelector(selectRole);
  const location = useLocation();
  const activeSection = location.pathname;

  const isFreelancer = userRole === "freelancer";
  const isHybrid = userRole === "hybrid";
  const showFreelancerMenu = isFreelancer || isHybrid;

  return (
    <div className="relative h-screen w-[250px]">
      <div
        className={`bg-gradient-to-b from-grey to-dark fixed top-16 h-full z-10 left-0 text-light flex flex-col items-center shadow-xl ${
          isSidebarMinimized ? "w-16" : "w-56"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex justify-between items-center my-5 w-full pl-5 pr-5">
          <div
            className={`text-md flex items-center space-x-2 font-bold ${
              isSidebarMinimized ? "hidden" : "block"
            }`}
          >
            <TiHomeOutline className="text-xl text-cyan-blue" />
            <Link 
              to="/dashboard" 
              className="text-base font-semibold hover:text-cyan-blue transition-colors duration-200"
            >
              Dashboard
            </Link>
          </div>
          <button
            className="text-cyan-blue hover:bg-dark p-2 rounded-full transition-all duration-200 hover:scale-110"
            onClick={() => dispatch(toggleSidebar())}
          >
            {isSidebarMinimized ? (
              <FaAngleLeft className="text-lg" />
            ) : (
              <FaAngleRight className="text-lg" />
            )}
          </button>
        </div>
        {!isSidebarMinimized && (
          <div className="w-full flex flex-col justify-between h-3/4">
            <div className="w-4/5 mx-auto flex flex-col justify-start space-y-2">
              {showFreelancerMenu && (
                <>
                  <Link
                    to="/dashboard/jobs"
                    className={`flex items-center rounded-lg ${
                      activeSection === "/dashboard/jobs"
                        ? "bg-dark border-l-4 border-cyan-blue text-cyan-blue shadow-md"
                        : "hover:bg-dark/50"
                    } px-4 py-3 transition-all duration-200 group`}
                  >
                    <MdOutlineWorkOutline className="text-xl mr-3 group-hover:text-cyan-blue" />
                    <span className="group-hover:text-cyan-blue">Jobs</span>
                  </Link>

                  <Link
                    to="/dashboard/bids"
                    className={`flex items-center rounded-lg ${
                      activeSection === "/dashboard/bids"
                        ? "bg-dark border-l-4 border-cyan-blue text-cyan-blue shadow-md"
                        : "hover:bg-dark/50"
                    } px-4 py-3 transition-all duration-200 group`}
                  >
                    <BiDollarCircle className="text-xl mr-3 group-hover:text-cyan-blue" />
                    <span className="group-hover:text-cyan-blue">Bidings</span>
                  </Link>
                </>
              )}

              {/* Always show Projects */}
              <Link
                to="/dashboard/projects"
                className={`flex items-center rounded-lg ${
                  activeSection === "/dashboard/projects"
                    ? "bg-dark border-l-4 border-cyan-blue text-cyan-blue shadow-md"
                    : "hover:bg-dark/50"
                } px-4 py-3 transition-all duration-200 group`}
              >
                <FaLaptopCode className="text-xl mr-3 group-hover:text-cyan-blue" />
                <span className="group-hover:text-cyan-blue">Projects</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
