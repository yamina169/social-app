import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

const API_KEY = import.meta.env.VITE_NEWSDATA_KEY;
const API_URL = `https://newsdata.io/api/1/news?apikey=pub_403e0578e5f24acdb3f519f9e65b1105&category=technology&language=en`;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour extraire les champs essentiels
  const extractFields = (article) => ({
    article_id: article.article_id, // pour vérifier doublon
    link: article.link,
    title: article.title,
    description: article.description,
    content: article.content,
    pubDate: article.pubDate,
    pubDateTZ: article.pubDateTZ,
    image_url: article.image_url,
    source_url: article.source_url,
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (Array.isArray(data.results)) {
        // Filtrer pour ne pas avoir de doublons
        const newArticles = data.results
          .map(extractFields)
          .filter((a) => !news.some((old) => old.article_id === a.article_id));

        // On prend les 4 premiers nouveaux articles uniquement
        const firstFour = newArticles.slice(0, 4);

        setNews(firstFour.length ? firstFour : news); // si pas de nouveaux, on garde les anciens
      } else {
        console.warn("News API returned no results or invalid format:", data);
        setNews([]);
      }
    } catch (err) {
      console.error("Erreur récupération news:", err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => {
      fetchNews();
    }, 60000); // toutes les 60 secondes

    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString, tz) => {
    if (!dateString) return "";
    const date = new Date(dateString + (tz ? " " + tz : ""));
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading)
    return <p className="text-gray-500 animate-pulse">Loading news...</p>;
  if (!news.length) return <p className="text-gray-500">No news found.</p>;

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-xl shadow-md w-full">
      <h3 className="text-xl font-bold mb-2">Latest Tech News</h3>
      {news.map((item, index) => (
        <a
          key={item.article_id}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col border-b last:border-b-0 pb-2 hover:bg-gray-50 transition rounded-md"
        >
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-32 object-cover rounded-md mb-2"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 8v5l3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>{formatDateTime(item.pubDate, item.pubDateTZ)}</span>
          </div>
          <p className="font-semibold line-clamp-2">{item.title}</p>
          {item.description && (
            <p className="text-gray-700 text-sm line-clamp-2">
              {item.description}
            </p>
          )}
          {item.content && (
            <p className="text-gray-600 text-sm line-clamp-3">{item.content}</p>
          )}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 mt-1"
            >
              Source
            </a>
          )}
        </a>
      ))}
    </div>
  );
};

export default NewsList;
