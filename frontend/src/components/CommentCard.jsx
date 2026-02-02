import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../assests/spinner/Spinner";
import ArticleService from "../services/article.service";

const COMMENTS_PER_PAGE = 3;

const CommentCard = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchComments = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const offset = (pageNumber - 1) * COMMENTS_PER_PAGE;

      const { comments: fetchedComments, total } =
        await ArticleService.getComments(slug, {
          limit: COMMENTS_PER_PAGE,
          offset,
        });

      const sorted = (fetchedComments || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setComments(sorted);
      setTotalComments(total || 0);
      setCommentPage(pageNumber);
    } catch {
      toast.error("Failed to load comments.", {
        id: "load-comments",
        position: "top-center",
      });

      toast.success("Comment added!", {
        id: "comment-added",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [slug]);

  const handleAddComment = async () => {
    if (!commentBody.trim())
      return toast.error("Comment cannot be empty!", { id: "empty-comment" });

    if (!token) return toast.error("Login required!", { id: "login-required" });

    try {
      await ArticleService.addComment(slug, commentBody);
      setCommentBody("");
      fetchComments(1);
      toast.success("Comment added!", { id: "comment-added" });
    } catch {
      toast.error("Failed to add comment.", { id: "add-comment" });
    }
  };

  // 🗑️ Delete with toast confirmation
  const handleDeleteComment = (commentId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 text-center">
          <span className="font-medium">Delete this comment?</span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm border rounded"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await ArticleService.deleteComment(slug, commentId);
                  const isLastCommentOnPage =
                    comments.length === 1 && commentPage > 1;
                  fetchComments(
                    isLastCommentOnPage ? commentPage - 1 : commentPage
                  );
                  toast.success("Comment deleted!", {
                    id: "deleted",
                    position: "top-center",
                  });
                } catch {
                  toast.error("Failed to delete comment.", {
                    id: "delete-fail",
                    position: "top-center",
                  });
                }
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: "top-center",
      }
    );
  };

  const totalCommentPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);

  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-indigo-600">
        Responses
      </h2>

      <div className="mb-8">
        <textarea
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="What are your thoughts?"
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddComment}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition"
          >
            Respond
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No responses yet.</p>
      ) : (
        <div className="space-y-8">
          {comments.map((c) => {
            const isAuthor =
              currentUser &&
              (currentUser.id === c.author?.id ||
                currentUser.username === c.author?.username);

            return (
              <div key={c.id || c._id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {c.author?.username?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-indigo-600">
                        {c.author?.username || "Unknown user"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => handleDeleteComment(c.id || c._id)}
                        className="text-sm text-gray-400 hover:text-red-500 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-gray-800 leading-relaxed max-h-20 overflow-y-auto">
                    {c.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalCommentPages > 1 && (
        <div className="flex justify-center gap-4 mt-10">
          <button
            disabled={commentPage === 1}
            onClick={() => fetchComments(commentPage - 1)}
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-full disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-gray-600 pt-2">
            {commentPage} / {totalCommentPages}
          </span>

          <button
            disabled={commentPage >= totalCommentPages}
            onClick={() => fetchComments(commentPage + 1)}
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-full disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
