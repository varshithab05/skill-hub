import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

const PostJob = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [categories, setCategories] = useState([]);
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCategoryKeyPress = (e) => {
    if (e.key === " " && categoryInput.trim()) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput("");
    }
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === " " && skillsInput.trim()) {
      setSkillsRequired([...skillsRequired, skillsInput.trim()]);
      setSkillsInput("");
    }
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const removeSkill = (index) => {
    setSkillsRequired(skillsRequired.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim() || title.length < 5) newErrors.title = "Title must be at least 5 characters";
    if (!description.trim() || description.length < 20) newErrors.description = "Description must be at least 20 characters";
    if (!budgetMin || Number(budgetMin) < 0) newErrors.budgetMin = "Invalid minimum budget";
    if (!budgetMax || Number(budgetMax) <= Number(budgetMin)) newErrors.budgetMax = "Maximum budget must be greater than minimum";
    if (categories.length === 0) newErrors.categories = "At least one category required";
    if (skillsRequired.length === 0) newErrors.skills = "At least one skill required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/jobs/create", {
        title,
        description,
        budget: { min: Number(budgetMin), max: Number(budgetMax) },
        categories,
        skillsRequired,
      });
      navigate(`/jobs/${data._id}`);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Error creating job" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Post a New Job
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">Job Title</label>
                <input
                  type="text"
                  className={`w-full p-4 bg-gray-900/50 border ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  placeholder="Enter a compelling job title"
                />
                {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
              </div>

              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">Job Description</label>
                <textarea
                  className={`w-full p-4 bg-gray-900/50 border ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  required
                  rows="6"
                  placeholder="Describe the job requirements, responsibilities, and expectations in detail..."
                />
                {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-300">Minimum Budget</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      className={`w-full pl-8 p-4 bg-gray-900/50 border ${
                        errors.budgetMin ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      disabled={loading}
                      required
                      placeholder="0"
                    />
                  </div>
                  {errors.budgetMin && <p className="mt-2 text-sm text-red-400">{errors.budgetMin}</p>}
                </div>

                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-300">Maximum Budget</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      className={`w-full pl-8 p-4 bg-gray-900/50 border ${
                        errors.budgetMax ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      disabled={loading}
                      required
                      placeholder="1000"
                    />
                  </div>
                  {errors.budgetMax && <p className="mt-2 text-sm text-red-400">{errors.budgetMax}</p>}
                </div>
              </div>

              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">Categories</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full text-sm font-medium text-blue-400 transition-all duration-200 hover:bg-blue-500/30"
                    >
                      <span>{category}</span>
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        onClick={() => removeCategory(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.categories && <p className="mt-2 text-sm text-red-400">{errors.categories}</p>}
                <input
                  type="text"
                  className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={handleCategoryKeyPress}
                  disabled={loading}
                  placeholder="Type category and press space to add"
                />
              </div>

              <div className="group">
                <label className="block mb-2 text-sm font-medium text-gray-300">Required Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skillsRequired.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-full text-sm font-medium text-purple-400 transition-all duration-200 hover:bg-purple-500/30"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                        onClick={() => removeSkill(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.skills && <p className="mt-2 text-sm text-red-400">{errors.skills}</p>}
                <input
                  type="text"
                  className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillKeyPress}
                  disabled={loading}
                  placeholder="Type skill and press space to add"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5'
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Job...</span>
                </div>
              ) : (
                'Post Job'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
