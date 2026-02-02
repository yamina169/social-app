import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast, { Toaster } from "react-hot-toast";
import ArticleService from "../services/article.service";
import UserSidebar from "../components/user/UserSidebar";

const CreateBlog = () => {
  const [blogImage, setBlogImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    body: "",
    tagList: [],
    newTag: "",
  });

  const titleRef = useRef(); // focus sur le titre
  const imageInputRef = useRef(); // reset input file

  // Gestion changement texte
  const inputChangeHandle = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ReactQuill
  const reactQuillChange = (value) => {
    setFormData({ ...formData, body: value });
  };

  // Upload image
  const blogImgChangeHandle = (e) => {
    const file = e.target.files[0];
    setBlogImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Ajouter un tag
  const addTag = () => {
    const tag = formData.newTag.trim();
    if (tag && !formData.tagList.includes(tag)) {
      setFormData({
        ...formData,
        tagList: [...formData.tagList, tag],
        newTag: "",
      });
    }
  };

  // Supprimer un tag
  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tagList: formData.tagList.filter((t) => t !== tag),
    });
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      body: "",
      tagList: [],
      newTag: "",
    });
    setBlogImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // reset champ file
    }

    titleRef.current?.focus(); // focus sur titre
  };

  // Publier article
  const publishBlogBtn = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to publish a blog!");
      return;
    }

    if (!formData.title) {
      toast.error("Blog title is required!");
      return;
    }
    if (!formData.body || formData.body.length < 20) {
      toast.error("Blog body must be at least 20 characters!");
      return;
    }

    try {
      const article = await ArticleService.createArticle(formData, blogImage);
      console.log("Article créé:", article);

      toast.success("Blog published successfully!");
      resetForm(); // tout réinitialise correctement
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to publish blog.");
    }
  };

  const quillModules = { toolbar: false };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 sticky top-0 h-screen border-gray-200">
        <UserSidebar />
      </div>

      {/* Form content */}
      <div className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-4xl font-bold text-indigo-600 mb-8">
          Create a New Blog
        </h1>

        <form className="flex flex-col w-full max-w-4xl gap-6 bg-white p-6 rounded-xl shadow-lg">
          {/* Title & Description */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              ref={titleRef}
              type="text"
              placeholder="Blog Title"
              name="title"
              value={formData.title}
              onChange={inputChangeHandle}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <input
              type="text"
              placeholder="Short Description"
              name="description"
              value={formData.description}
              onChange={inputChangeHandle}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* Image Upload */}
          <div className="flex items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={blogImgChangeHandle}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="w-full flex justify-center mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-xl w-full md:w-3/4 lg:w-1/2 shadow-lg object-cover h-96"
              />
            </div>
          )}

          {/* Body Editor */}
          <div className="mt-4">
            <ReactQuill
              className="h-80 rounded-lg"
              value={formData.body}
              onChange={reactQuillChange}
              modules={quillModules}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col mt-4 gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag"
                name="newTag"
                value={formData.newTag}
                onChange={inputChangeHandle}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {formData.tagList.map((tag) => (
                <span
                  key={tag}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-200"
                  onClick={() => removeTag(tag)}
                >
                  {tag} &times;
                </span>
              ))}
            </div>
          </div>

          {/* Publish Button */}
          <button
            type="submit"
            onClick={publishBlogBtn}
            className="mt-6 w-full md:w-1/3 self-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition"
          >
            Publish Blog
          </button>
        </form>

        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default CreateBlog;
