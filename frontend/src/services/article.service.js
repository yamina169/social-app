import { api } from "./api";

const ArticleService = {
  // =====================
  // ARTICLES
  // =====================

  getArticles: async (params = {}) => {
    const response = await api.get("/articles", { params });
    return response.data; // { articles, articlesCount }
  },

  getArticle: async (slug) => {
    const response = await api.get(`/articles/${slug}`);
    return response.data.article;
  },

  createArticle: async (articleData, file) => {
    const formData = new FormData();
    formData.append("article[title]", articleData.title);
    formData.append("article[description]", articleData.description);
    formData.append("article[body]", articleData.body);

    if (articleData.tagList && articleData.tagList.length > 0) {
      articleData.tagList.forEach((tag) => {
        formData.append("article[tagList][]", tag);
      });
    }

    if (file) formData.append("image", file);

    const token = localStorage.getItem("token");

    const response = await api.post("/articles", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.article;
  },

  updateArticle: async (slug, data) => {
    const token = localStorage.getItem("token");

    const response = await api.put(
      `/articles/${slug}`,
      { article: data },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.article;
  },

  deleteArticle: async (slug) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(`/articles/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  addToFavorites: async (slug) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
      `/articles/${slug}/favorite`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.article;
  },

  removeFromFavorites: async (slug) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(`/articles/${slug}/favorite`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.article;
  },

  // =====================
  // COMMENTAIRES
  // =====================

  // src/services/article.service.js
  getComments: async (slug, params = {}) => {
    try {
      // params peut contenir { limit, offset }
      const response = await api.get(`/articles/${slug}/comments`, { params });

      // S'assurer que la réponse a les bons champs
      const comments = response.data.comments || [];
      const total = response.data.total ?? comments.length;

      return { comments, total };
    } catch (err) {
      console.error("Error fetching comments:", err);
      return { comments: [], total: 0 }; // fallback pour éviter les erreurs
    }
  },

  addComment: async (slug, body) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await api.post(
      `/articles/${slug}/comments`,
      { comment: { body } },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.comment;
  },

  deleteComment: async (slug, commentId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await api.delete(
      `/articles/${slug}/comments/${commentId}`,
      {
        headers: { Authorization: `Bearer ${token}` }, // ✅ corrigé
      }
    );

    return response.data;
  },
};

export default ArticleService;
