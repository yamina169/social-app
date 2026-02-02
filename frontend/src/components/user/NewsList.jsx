import { useEffect, useState, useRef } from "react";
import { FaClock } from "react-icons/fa";

const API_KEY = "pub_b1bf5ec23ced4b57b4d82fbe7f68577f";
const BASE_URL = "https://newsdata.io/api/1/latest";

// mots-clés tech
const KEYWORDS_FILTER = ["ai", "cloud", "blockchain", "crypto", "data science"];

const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const nextPageRef = useRef(null);

  const fetchBatch = async () => {
    setLoading(true);
    try {
      const url = new URL(BASE_URL);
      url.searchParams.set("apikey", API_KEY);
      url.searchParams.set("category", "technology");
      url.searchParams.set("language", "en");
      url.searchParams.set("size", "6"); // récupérer plus pour filtrer

      if (nextPageRef.current) {
        url.searchParams.set("page", nextPageRef.current);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];

      // filtrage flexible par mots-clés
      const filtered = results.filter((article) =>
        KEYWORDS_FILTER.some((keyword) => {
          const lowerKeyword = keyword.toLowerCase();
          const title = article.title?.toLowerCase() || "";
          const description = article.description?.toLowerCase() || "";
          return (
            title.includes(lowerKeyword) || description.includes(lowerKeyword)
          );
        })
      );

      // compléter pour avoir exactement 4 articles
      let finalArticles = filtered;
      if (filtered.length < 4) {
        const remaining = results.filter((a) => !filtered.includes(a));
        finalArticles = [...filtered, ...remaining];
      }

      // ne prendre que 4 articles
      finalArticles = finalArticles.slice(0, 4);

      // filtrer uniquement ceux avec un lien valide
      finalArticles = finalArticles.filter((item) => item.link);

      setArticles(finalArticles);
      nextPageRef.current = data.nextPage || null;
    } catch (err) {
      console.error("Erreur récupération news:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
    const interval = setInterval(fetchBatch, 30 * 60 * 1000); // mise à jour toutes les 60 secondes
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const truncateTitle = (title) => {
    if (!title) return "";
    return title.length > 70 ? title.slice(0, 70) + "..." : title;
  };

  if (loading && articles.length === 0)
    return <p className="text-gray-500 animate-pulse">Loading news...</p>;

  if (articles.length === 0)
    return <p className="text-gray-500">No news found.</p>;

  return (
    <div
      className="
        w-full md:w-80
        bg-white rounded-xl shadow-md overflow-y-auto p-3
        max-h-[60vh] md:max-h-[80vh]
      "
    >
      <h3 className="text-lg font-bold mb-3 text-center">Tech News</h3>

      {articles.map((item) => (
        <a
          key={item.article_id || item.title}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 items-start border-b last:border-b-0 pb-2 mb-2 hover:bg-gray-50 transition"
        >
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="w-16 h-16 md:w-16 md:h-16 sm:w-14 sm:h-14 xs:w-12 xs:h-12 object-cover rounded-md flex-shrink-0"
            />
          )}

          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm leading-snug">
              {truncateTitle(item.title)}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaClock className="text-gray-400" />
              <span>{formatDateTime(item.pubDate)}</span>
              <span>•</span>
              <span>{item.source_id || "Source"}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default NewsList;
