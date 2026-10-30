import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "@mui/material/Button";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";

const Comments = ({ ticketId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    api
      .get(`/tickets/${ticketId}/comments/`)
      .then((res) => setComments(res.data))
      .catch((err) => setCommentError(err));
  }, [ticketId]);

  const handelAddComment = () => {
    if (!newComment.trim()) return;

    api
      .post(`/tickets/${ticketId}/comments/`, { message: newComment })
      .then((res) => {
        setComments((prev) => [...prev, res.data]);
        setNewComment("");
      })
      .catch(() => setCommentError("could not post comment"));
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.message);
  };
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handelUpdateComment = (commentId) => {
    api
      .patch(`/tickets/${ticketId}/comments/${commentId}/`, {
        message: editingText,
      })
      .then((res) => {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? res.data : c)),
        );
        cancelEditing();
      })
      .catch(() => setCommentError("Could not update comment"));
  };

  const handelDeleteComment = (commentId) => {
    api
      .delete(`/tickets/${ticketId}/comments/${commentId}/`)
      .then(() => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      })
      .catch(() => setCommentError("could not delete comment"));
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Comments</h3>
      

      {commentError && (
        <p className="text-sm text-red-600 mb-3">{commentError}</p>
      )}

      <div className="space-y-3 mb-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-400">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl bg-slate-50 border border-slate-100 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700">
                  {comment.username}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>

              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handelUpdateComment(comment.id)}
                    >
                      Save
                    </Button>
                    <Button size="small" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {comment.message}
                  </p>

                  {(comment.user === user?.id || user?.role === "admin") && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => startEditing(comment)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handelDeleteComment(comment.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add comment box */}
      <div className="flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <Button
          variant="contained"
          onClick={handelAddComment}
          sx={{ textTransform: "none", alignSelf: "flex-end" }}
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default Comments;
