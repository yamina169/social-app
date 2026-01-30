// src/services/article.service.js
import { api } from "./api";

const ArticleService = {
  // Récupérer tous les articles avec filtres
  getArticles: async (params) => {
    const response = await api.get("/articles", { params });
    return response.data; // { articles, articlesCount }
  },

  // Récupérer le feed de l'utilisateur connecté
  getFeed: async (params) => {
    const response = await api.get("/articles/feed", { params });
    return response.data;
  },

  // Récupérer un article par slug
  getArticle: async (slug) => {
    const response = await api.get(`/articles/${slug}`);
    return response.data.article;
  },

  // Créer un nouvel article
  createArticle: async (articleData) => {
    const token = localStorage.getItem("token");
    console.log("🪪 Token being sent:", token);

    const response = await api.post("/articles", articleData);
    return response.data.article;
  },

  // Mettre à jour un article existant
  updateArticle: async (slug, data) => {
    const response = await api.put(`/articles/${slug}`, { article: data });
    return response.data.article;
  },

  // Supprimer un article
  deleteArticle: async (slug) => {
    const response = await api.delete(`/articles/${slug}`);
    return response.data;
  },

  // Ajouter un article aux favoris
  addToFavorites: async (slug) => {
    const response = await api.post(`/articles/${slug}/favorite`);
    return response.data.article;
  },

  // Retirer un article des favoris
  removeFromFavorites: async (slug) => {
    const response = await api.delete(`/articles/${slug}/favorite`);
    return response.data.article;
  },

  // --------------------
  // GESTION DES TAGS
  // --------------------

  // Récupérer tous les tags existants
  getAllTags: async () => {
    const response = await api.get("/tags");
    return response.data.tags; // array de string ['nestjs', 'react', ...]
  },
};

export default ArticleService;
