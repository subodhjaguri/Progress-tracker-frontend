import React, { useState } from "react";
import { Send } from "lucide-react";
import { Section } from "../../components/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useComments, usePostComment } from "../../api/comments.js";
import { initials, fmtDate } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

export function CommentsPanel({ parentType, parentId }) {
  const { user } = useAuth();
  const { announce } = useData();
  const { data: comments = [] } = useComments(parentType, parentId);
  const post = usePostComment();
  const [message, setMessage] = useState("");

  const send = async () => {
    if (!message.trim()) return;
    try {
      await post.mutateAsync({ parentType, parentId, text: message.trim() });
      setMessage("");
    } catch (err) {
      announce(errMessage(err, "Could not post comment"));
    }
  };

  return (
    <Section title="Discussion" className="comments-panel">
      <div className="comments-list">
        {comments.map((c) => (
          <div className={`comment ${c.author?.id === user?.id ? "mine" : ""}`} key={c.id}>
            <div className="avatar">{initials(c.author?.name || "")}</div>
            <div>
              <span>
                {c.author?.name || "—"} · {fmtDate(c.createdAt)}
              </span>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="empty-inline">
            <strong>No comments yet</strong>
            <p>Start the discussion with the site team.</p>
          </div>
        )}
      </div>
      <div className="comment-composer">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Write a comment..."
        />
        <button onClick={send} disabled={post.isPending}>
          <Send size={18} />
        </button>
      </div>
    </Section>
  );
}
