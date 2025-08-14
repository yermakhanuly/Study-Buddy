import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/http.js";

export default function NoteEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/notes", { title, content });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>New Note</h2>
        <form onSubmit={save}>
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="textarea" rows={12} placeholder="Paste or write your study notes here..."
            value={content} onChange={e=>setContent(e.target.value)} />
          <button className="btn" disabled={loading || !title || !content}>Save Note</button>
        </form>
      </div>
    </div>
  );
}
