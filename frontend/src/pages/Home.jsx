import { useEffect, useState } from "react";
import ArticleService from "../services/article.service";
import UserSidebar from "../components/user/UserSidbar";
import BlogList from "../components/user/BlogList";
import NewsList from "../components/user/NewsList";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalArticles, setTotalArticles] = useState(0);

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
                ? a.favoritesCount - 1
                : a.favoritesCount + 1,
            }
          : a
      )
    );

    try {
      const updatedArticle = isFavorited
        ? await ArticleService.removeFromFavorites(blog.slug)
        : await ArticleService.addToFavorites(blog.slug);

      setArticles((prev) =>
        prev.map((a) => (a.slug === blog.slug ? updatedArticle : a))
      );
    } catch (error) {
      console.error("Erreur favori:", error);
      fetchArticles(page);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalArticles / limit));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-white shadow-md sticky top-0 h-screen">
        <UserSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 px-4 md:px-6 py-6 md:py-10">
        {/* Blog articles */}
        <div className="flex-1">
          {loading && (
            <p className="text-center text-gray-500 animate-pulse mb-4">
              Chargement articles...
            </p>
          )}

          <BlogList articles={articles} onToggleFavorite={handleFavorite} />

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
        <div className="w-full md:w-80 flex-shrink-0">
          <NewsList />
        </div>
      </div>
    </div>
  );
};

export default Home;
