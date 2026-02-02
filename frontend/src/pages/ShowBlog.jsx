import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaRegHeart,
  FaHeart,
  FaCommentAlt,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import ArticleService from "../services/article.service";
import CommentCard from "../components/CommentCard";
import UserSidebar from "../components/user/UserSidebar";

const ShowBlog = () => {
  const { slug } = useParams();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    body: "",
  });

  // Fetch article
  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ArticleService.getArticle(slug, token);
      if (!data) {
        setError("Article not found");
        return;
      }
      setArticle(data);
      setIsFavorited(Boolean(data.favorited));
      setFavoritesCount(data.favoritesCount || 0);

      // Préremplir editData si c'est l'auteur
      if (data.author.username === storedUser.username) {
        setEditData({
          title: data.title,
          description: data.description,
          body: data.body,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Error loading article");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await ArticleService.getComments(slug);
      setComments(data.comments || []);
      setCommentsCount(data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token)
      return toast.error("You must be logged in to favorite this article.");
    const newFavorited = !isFavorited;
    const newCount = newFavorited
      ? favoritesCount + 1
      : Math.max(0, favoritesCount - 1);
    setIsFavorited(newFavorited);
    setFavoritesCount(newCount);

    try {
      let updated;
      if (isFavorited) {
        updated = await ArticleService.removeFromFavorites(slug, token);
      } else {
        updated = await ArticleService.addToFavorites(slug, token);
      }
      setIsFavorited(updated?.favorited ?? newFavorited);
      setFavoritesCount(updated?.favoritesCount ?? newCount);
    } catch (err) {
      console.error(err);
      toast.error("Error updating favorites.");
      setIsFavorited(isFavorited);
      setFavoritesCount(favoritesCount);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleUpdateArticle = async () => {
    if (!token) return toast.error("You must be logged in.");
    try {
      const updated = await ArticleService.updateArticle(slug, editData, token);
      setArticle(updated);
      toast.success("Article updated!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update article.");
    }
  };
  const handleDeleteArticle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.", { position: "top-center" });
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-4 bg-white ">
          <span className="text-center font-medium text-gray-800">
            Are you sure you want to delete this article?
          </span>
          <div className="flex justify-center gap-4 mt-3">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={async () => {
                try {
                  await ArticleService.deleteArticle(slug, token);
                  toast.success("Article deleted!", { position: "top-center" });
                  toast.dismiss(t.id);
                  setTimeout(() => {
                    window.location.href = "/home";
                  }, 1500);
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to delete article.", {
                    position: "top-center",
                  });
                }
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [slug]);

  if (loading)
    return (
      <p className="text-center mt-10 animate-pulse text-gray-500">
        Loading article...
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-10 text-red-500 font-semibold">{error}</p>
    );

  const isAuthor = article?.author.username === storedUser.username;

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-6 p-6 max-w-[1200px] mx-auto">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div className="hidden md:block w-64 sticky top-0 h-screen overflow-auto">
        <UserSidebar />
      </div>

      <div className="flex-1 flex flex-col gap-6 px-4 md:px-6 lg:px-8">
        {/* Auteur autorisé à modifier */}
        {isAuthor && !editMode && (
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1 text-indigo-600 hover:underline"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={handleDeleteArticle}
              className="flex items-center gap-1 text-red-600 hover:underline"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}

        {/* Titre */}
        {editMode ? (
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            className="w-full text-2xl sm:text-3xl md:text-4xl font-extrabold border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 px-2 py-1 mb-2"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-2 text-gray-900 drop-shadow-sm">
            {article.title}
          </h1>
        )}

        {/* Description */}
        {editMode ? (
          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            className="w-full border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 px-2 py-1 mb-2"
          />
        ) : (
          <p className="text-gray-700 mb-4 text-center max-w-3xl mx-auto">
            {article.description}
          </p>
        )}

        {/* Body */}
        {editMode ? (
          <textarea
            name="body"
            value={editData.body}
            onChange={handleEditChange}
            rows={10}
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 px-2 py-1 mb-4"
          />
        ) : (
          <div
            className="blog-content text-left mb-10 max-w-4xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: article.body || "<p>No content available.</p>",
            }}
          />
        )}

        {editMode && (
          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={handleUpdateArticle}
              className="py-2 px-6 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="py-2 px-6 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Infos, tags, image, favorite, comments */}
        {!editMode && (
          <>
            {article.author && (
              <p className="text-gray-500 mb-2 text-center">
                By{" "}
                <span className="font-semibold">{article.author.username}</span>
              </p>
            )}
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <FaCalendarAlt />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaCommentAlt />
                <span>{commentsCount}</span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:scale-110 transition transform"
                onClick={handleToggleFavorite}
              >
                {isFavorited ? (
                  <FaHeart className="text-red-500 hover:text-red-600" />
                ) : (
                  <FaRegHeart className="hover:text-red-500" />
                )}
                <span className="font-medium">{favoritesCount}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {article.tagList?.map((tag, idx) => {
                const colors = [
                  "bg-blue-100 text-blue-800",
                  "bg-green-100 text-green-800",
                  "bg-yellow-100 text-yellow-800",
                  "bg-pink-100 text-pink-800",
                  "bg-purple-100 text-purple-800",
                  "bg-indigo-100 text-indigo-800",
                  "bg-red-100 text-red-800",
                  "bg-teal-100 text-teal-800",
                ];
                const colorClass = colors[idx % colors.length];
                return (
                  <span
                    key={idx}
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full border shadow-sm hover:scale-105 transition transform ${colorClass}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>

            {/* Image */}
            {article.image && article.image.trim() !== "" && (
              <div className="flex justify-center mb-6 w-full">
                <div className="w-full sm:w-72 md:w-80 lg:w-96 overflow-hidden rounded-xl shadow-lg flex items-center justify-center bg-gray-100">
                  <img
                    src={
                      article.image.startsWith("http")
                        ? article.image
                        : `/${article.image}`
                    }
                    alt={article.title}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>
            )}

            {/* Commentaires */}
            <div className="w-full max-w-4xl mx-auto">
              <CommentCard slug={slug} comments={comments} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShowBlog;
