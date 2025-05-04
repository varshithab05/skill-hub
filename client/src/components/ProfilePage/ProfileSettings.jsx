import { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  updateUserProfileThunk,
  selectUserProfile,
  addSkill,
  removeSkill,
  addExperience,
  removeExperience,
  addPreviousWork,
  removePreviousWork,
  updatePreviousWork,
} from "../../redux/Features/user/ProfileSlice";
import ImageUpload from "./ProfileComponents/ImageUpload";
import axiosInstance from "../../api/axiosInstance";
import CustomAlert from "../Notifications/CustomAlert";

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPath, setProfilePicPath] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [],
    portfolio: "",
    experience: [],
    previousWorks: [{ title: "", description: "", link: "" }],
    newSkill: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ message: "", type: "" });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear previous error when user starts typing
    setErrors({ ...errors, [name]: "" });

    // Validate email as user types
    if (name === "email" && value.trim() !== "") {
      if (!validateEmail(value)) {
        setErrors({ ...errors, email: "Please enter a valid email address" });
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      await dispatch(fetchUserProfile());
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
        skills: userProfile.info?.skills || [],
        portfolio: userProfile.info?.portfolio || "",
        experience: userProfile.info?.experience || [],
        previousWorks: userProfile.previousWorks || [
          { title: "", description: "", link: "" },
        ],
        newSkill: "",
      });
      setProfilePicPath(userProfile.info?.profilePic || null);
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: "Please enter a valid email address" });
      return;
    }

    try {
      // Create update object with all necessary fields
      const updateData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        skills: formData.skills,
        portfolio: formData.portfolio,
        experience: formData.experience,
        previousWorks: formData.previousWorks,
      };

      // Update profile data
      await dispatch(updateUserProfileThunk(updateData));

      // Handle profile picture upload if there's a new one
      if (profilePic) {
        const formDataPic = new FormData();
        formDataPic.append("profilePic", profilePic);

        const response = await axiosInstance.post(
          "/user/upload-profile-pic",
          formDataPic,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data && response.data.profilePic) {
          // Update the profile picture path in the state
          setProfilePicPath(response.data.profilePic);
          // Reset the profilePic state to prevent re-uploading
          setProfilePic(null);
        }
      }

      // Fetch updated profile data
      await dispatch(fetchUserProfile());

      // Show success message
      setAlert({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      setAlert({
        message: "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim()) {
      dispatch(addSkill(formData.newSkill));
      setFormData({ ...formData, newSkill: "" });
    }
  };

  const handleDeleteSkill = (index) => {
    dispatch(removeSkill(index));
  };

  const handleAddExperience = () => {
    dispatch(addExperience());
  };

  const handleDeleteExperience = (index) => {
    dispatch(removeExperience(index));
  };

  const handleAddPreviousWork = () => {
    dispatch(addPreviousWork());
  };

  const handleDeletePreviousWork = (index) => {
    dispatch(removePreviousWork(index));
  };

  const handlePreviousWorksChange = (index, fieldName, value) => {
    dispatch(updatePreviousWork({ index, field: fieldName, value }));
  };

  const handleExperienceChange = (index, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = value;
    setFormData({ ...formData, experience: updatedExperience });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {alert.message && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
        />
      )}
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">
            Profile Settings
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center">
              <ImageUpload
                profilePicPath={profilePicPath}
                setProfilePic={setProfilePic}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-900/50 border ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength="500"
                rows="4"
                className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                placeholder="Tell us about yourself..."
              />
              <p className="text-sm text-gray-400 text-right">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full text-sm font-medium text-blue-400 flex items-center gap-2 transition-all duration-200 hover:bg-blue-500/30"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(index)}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.newSkill}
                  onChange={(e) =>
                    setFormData({ ...formData, newSkill: e.target.value })
                  }
                  placeholder="Add a new skill"
                  className="flex-1 p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                >
                  <FaPlus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Experience
              </label>
              <div className="space-y-3">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={exp}
                      onChange={(e) =>
                        handleExperienceChange(index, e.target.value)
                      }
                      className="flex-1 p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                      placeholder="Add your experience"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(index)}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-200"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
              >
                <FaPlus size={16} /> Add Experience
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Previous Works
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.previousWorks.map((work, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-300">
                        Work #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleDeletePreviousWork(index)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={work.title}
                      onChange={(e) =>
                        handlePreviousWorksChange(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Project Title"
                      className="w-full p-3 bg-gray-900/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                    />
                    <input
                      type="text"
                      value={work.description}
                      onChange={(e) =>
                        handlePreviousWorksChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Project Description"
                      className="w-full p-3 bg-gray-900/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                    />
                    <input
                      type="text"
                      value={work.link}
                      onChange={(e) =>
                        handlePreviousWorksChange(index, "link", e.target.value)
                      }
                      placeholder="Project Link"
                      className="w-full p-3 bg-gray-900/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddPreviousWork}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
              >
                <FaPlus size={16} /> Add Previous Work
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 mt-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:-translate-y-0.5"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
