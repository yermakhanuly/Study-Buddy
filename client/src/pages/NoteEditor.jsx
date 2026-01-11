import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/http.js";

export default function NoteEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/notes", { title, content });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Could not save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h2 className="page-title">New Note</h2>
          <p className="page-subtitle">Write your study notes, then generate flashcards.</p>
        </div>
      </div>
      <div className="card">
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={save}>
          <input
            className="input"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="textarea"
            rows={12}
            placeholder="Paste or write your study notes here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="row space">
            <span className="meta">{content.length} characters</span>
            <button className="btn" disabled={loading || !title || !content}>
              {loading ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
