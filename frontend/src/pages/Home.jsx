import React, { useEffect, useState } from "react";
import ArticleService from "../services/article.service";
import UserSidebar from "../components/user/UserSidebar";
import BlogList from "../components/user/BlogList";
import NewsList from "../components/user/NewsList";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalArticles, setTotalArticles] = useState(0);

  const [searchQuery, setSearchQuery] = useState(""); // état pour recherche

  // Fetch articles depuis API (une seule fois)
  const fetchArticles = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const offset = (pageNumber - 1) * limit;
      const data = await ArticleService.getArticles({ limit, offset });
      setArticles(data.articles || []);
      setTotalArticles(data.articlesCount || 0);
      setPage(pageNumber);
    } catch (error) {
      console.error("Erreur chargement articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, []);

  // Filtrage côté client, insensible à la casse
  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFavorite = async (e, blog) => {
    e.preventDefault();
    const isFavorited = blog.favorited;

    setArticles((prev) =>
      prev.map((a) =>
        a.slug === blog.slug
          ? {
              ...a,
              favorited: !isFavorited,
              favoritesCount: isFavorited
                ? Math.max(0, a.favoritesCount - 1)
                : a.favoritesCount + 1,
            }
          : a
      )
    );

    try {
      let updatedArticle;
      if (isFavorited) {
        updatedArticle = await ArticleService.removeFromFavorites(blog.slug);
      } else {
        updatedArticle = await ArticleService.addToFavorites(blog.slug);
      }

      updatedArticle = {
        ...blog,
        favorited: !isFavorited,
        favoritesCount: updatedArticle.favoritesCount ?? blog.favoritesCount,
      };

      setArticles((prev) =>
        prev.map((a) => (a.slug === blog.slug ? updatedArticle : a))
      );
    } catch (error) {
      console.error("Erreur favori:", error);
      setArticles((prev) =>
        prev.map((a) =>
          a.slug === blog.slug
            ? {
                ...a,
                favorited: isFavorited,
                favoritesCount: isFavorited
                  ? a.favoritesCount + 1
                  : Math.max(0, a.favoritesCount - 1),
              }
            : a
        )
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalArticles / limit));

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <div className="sticky z-20">
        <UserSidebar />
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 pt-20 md:pt-10 px-4 md:px-6 pb-24 md:pb-6 relative">
        <div className="flex-1 max-w-full md:max-w-[600px] mx-auto">
          {/* Search input */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {loading && (
            <p className="text-center text-gray-500 animate-pulse mb-4">
              Chargement articles...
            </p>
          )}

          {/* Liste filtrée */}
          <BlogList
            articles={filteredArticles}
            onToggleFavorite={handleFavorite}
          />

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-3">
            <button
              onClick={() => fetchArticles(page - 1)}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="flex items-center text-gray-700 font-medium">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchArticles(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* News list */}
        <div className="w-full md:w-80 md:fixed md:top-25 md:right-5 md:h-[calc(100vh-5rem)] bottom-0 md:bottom-auto z-10">
          <NewsList />
        </div>
      </div>
    </div>
  );
};

export default Home;
