import { Link } from "react-router-dom";
import { FaHeart, FaClock } from "react-icons/fa";

const TAG_COLORS = [
  "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",
  "bg-orange-200 text-orange-800",
];

const BlogList = ({ articles, onToggleFavorite }) => {
  const getTagColor = (index) => TAG_COLORS[index % TAG_COLORS.length];

  // Formater date + heure "1 Feb 2026, 14:35"
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="flex flex-col space-y-8">
      {articles.map((blog) => {
        const created = formatDateTime(blog.createdAt);
        const updated = formatDateTime(blog.updatedAt);

        const displayDate =
          updated && updated !== created
            ? `Updated: ${updated}`
            : `Created: ${created}`;

        // Vérifier si l'image est valide
        const hasImage = blog.image && blog.image.trim() !== "";

        return (
          <Link
            to={`/blog/${blog.slug}`}
            key={blog.id}
            className="relative flex flex-col md:flex-row-reverse bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 md:h-48"
            // md:h-48 : hauteur fixe sur desktop pour que l'image ait une référence
          >
            {/* Image à droite uniquement si valide */}
            {hasImage && (
              <div className="md:w-1/4 h-full flex-shrink-0">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover rounded-r-xl"
                  loading="lazy"
                  onError={(e) => e.currentTarget.parentElement.remove()}
                />
              </div>
            )}

            {/* Contenu */}
            <div
              className={`p-6 flex flex-col justify-between ${
                hasImage ? "md:w-3/4" : "w-full"
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                  {blog.title}
                </h2>

                <p className="text-gray-700 mb-2 line-clamp-3">
                  {blog.description ||
                    (blog.body ? blog.body.substring(0, 120) + "..." : "")}
                </p>

                <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
                  <FaClock className="text-gray-400" />
                  <span>{displayDate}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {blog.tagList?.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-block px-3 py-1 text-xs rounded-full border ${getTagColor(
                        index
                      )}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Heart */}
            <div
              onClick={(e) => onToggleFavorite(e, blog)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow cursor-pointer"
            >
              <FaHeart
                className={`transition ${
                  blog.favorited ? "text-red-500" : "text-gray-400"
                }`}
              />
              <span className="font-semibold text-gray-700">
                {blog.favoritesCount}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BlogList;
