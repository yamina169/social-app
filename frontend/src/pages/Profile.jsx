import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import UserSidebar from "../components/user/UserSidebar";
import ArticleService from "../services/article.service";
import BlogList from "../components/user/BlogList";

const DashboardProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    username: storedUser.username || "",
    email: storedUser.email || "",
    password: "",
    bio: storedUser.bio || "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [allUserArticles, setAllUserArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 2;
  const totalPages = Math.ceil(allUserArticles.length / limit) || 1;

  const fetchUserArticles = async () => {
    setLoading(true);
    try {
      const { articles: allArticles } = await ArticleService.getArticles();
      const userArticles = allArticles.filter(
        (article) => article.author.username === storedUser.username
      );
      setAllUserArticles(userArticles);
      setArticles(userArticles.slice(0, limit));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserArticles();
  }, []);

  const handlePageChange = (newPage) => {
    const start = (newPage - 1) * limit;
    const end = start + limit;
    setArticles(allUserArticles.slice(start, end));
    setPage(newPage);
  };

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async () => {
    toast.success("Profile updated successfully!");
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block w-64 sticky top-0 h-screen border-gray-200">
        <UserSidebar />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col items-center">
        {/* Profile Card */}
        <div className="w-full sm:max-w-xl md:max-w-2xl bg-white rounded-2xl shadow-xl mb-10 relative">
          {/* Header cover */}
          <div className="h-24 sm:h-32 bg-indigo-100 rounded-t-2xl"></div>

          {/* Edit link top right */}
          <button
            onClick={() => setModalOpen(true)}
            className="absolute top-3 sm:top-4 right-4 sm:right-6 text-indigo-600 font-semibold hover:underline"
          >
            Edit
          </button>

          {/* Profile content */}
          <div className="flex flex-col items-center -mt-12 sm:-mt-16 pb-6 sm:pb-8 px-4 sm:px-8">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 text-4xl sm:text-5xl font-bold mb-2 sm:mb-4 border-4 border-white">
              {storedUser.username?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* Nom et username */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formData.username}
            </h1>
            <p className="text-gray-500 mb-1 sm:mb-2">@{formData.username}</p>

            {/* Bio */}
            <p className="text-center text-gray-700 mt-1 sm:mt-2 px-2 sm:px-4">
              {formData.bio || "No bio yet"}
            </p>
          </div>
        </div>

        {/* Articles */}
        <div className="w-full sm:max-w-3xl md:max-w-4xl px-2 sm:px-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Your Articles
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center">Loading articles...</p>
          ) : articles.length === 0 ? (
            <p className="text-gray-500 text-center">
              You have no articles yet.
            </p>
          ) : (
            <>
              <BlogList articles={articles} onToggleFavorite={() => {}} />

              {/* Pagination */}
              <div className="flex justify-center items-center mt-4 sm:mt-6 gap-2 sm:gap-3 flex-wrap">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold transition ${
                      page === i + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate-fadeIn px-2">
            <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-xl relative animate-slideUp">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
                Edit Profile
              </h2>

              {/* Form fields */}
              <div className="flex flex-col mb-3">
                <label className="text-gray-700 font-semibold mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={inputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex flex-col mb-3">
                <label className="text-gray-700 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={inputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Password with toggle */}
              <div className="flex flex-col mb-3 relative">
                <label className="text-gray-700 font-semibold mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={inputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 sm:top-10 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                <button
                  onClick={handleUpdateProfile}
                  className="py-2 px-6 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-6 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <Toaster position="top-center" />

        {/* Animations */}
        <style>
          {`
        @keyframes fadeIn {
          from { opacity: 0; } 
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease forwards; }
      `}
        </style>
      </div>
    </div>
  );
};

export default DashboardProfile;
