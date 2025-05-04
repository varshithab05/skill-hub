import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { login } from "../../redux/Features/user/authSlice"; // Adjust path if necessary
import { useNavigate } from "react-router-dom"; // Import useNavigate

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigate
  const [showPassword, setShowPassword] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await dispatch(login(usernameOrEmail, password)); // Dispatch the login action
      console.log("User logged in successfully");
      navigate("/"); // Redirect to home page
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r flex justify-center items-center">
      <div className="bg-gray-800 py-10 px-8 rounded-lg shadow-lg min-w-[325px] sm:min-w-[60%] lg:min-w-[35%] max-w-[90%]">
        <img src="/logo.png" className=" mx-auto w-20" alt="" />
        <h2 className="text-3xl text-white font-bold text-center mb-6">
          Welcome Back
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="email-username"
              name="email_username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Email or Username"
              className="w-full p-3 border-2 border-blue-400 bg-gray-700 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border-2 border-blue-400 bg-gray-700 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150"
              required
            />
            <span
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
              onClick={togglePasswordVisibility}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "rgb(37, 99, 235)",
              color: "white",
              border: "2px solid rgb(37, 99, 235)",
            }}
            className="w-full py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-200 text-xl"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {"Don't have an account? "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
