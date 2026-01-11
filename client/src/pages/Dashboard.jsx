import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/http.js";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/notes");
        if (alive) setNotes(res.data);
      } catch (err) {
        if (alive) setError(err.response?.data?.error || "Could not load notes");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const pollJob = async (noteId, jobId) => {
    try {
      const res = await api.get(`/notes/${noteId}/flashcard-jobs/${jobId}`);
      if (!mounted.current) return;
      if (res.data.status === "succeeded") {
        setNotice(`Generated ${res.data.count} flashcards.`);
        setGeneratingId(null);
        return;
      }
      if (res.data.status === "failed") {
        setError(res.data.error || "Flashcard generation failed");
        setGeneratingId(null);
        return;
      }
      setTimeout(() => pollJob(noteId, jobId), 1500);
    } catch (err) {
      if (!mounted.current) return;
      setError(err.response?.data?.error || "Could not check generation status");
      setGeneratingId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h2 className="page-title">Your Notes</h2>
          <p className="page-subtitle">Capture ideas, then turn them into quick study cards.</p>
        </div>
        <div className="row">
          <span className="badge">{notes.length} notes</span>
          <Link className="btn" to="/notes/new">Create Note</Link>
        </div>
      </div>

      {notice && <div className="alert success">{notice}</div>}
      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card" style={{ minHeight: 160 }} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="card hero empty">
          <h3>Start your first study set</h3>
          <p>Drop in class notes or summaries and generate flashcards in seconds.</p>
          <Link className="btn" to="/notes/new">Create your first note</Link>
        </div>
      ) : (
        <div className="grid">
          {notes.map(n => (
            <div key={n._id} className="card">
              <div className="row space">
                <h3>{n.title}</h3>
                <span className="meta">{n.content.length} chars</span>
              </div>
              <p style={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
                {`${n.content.slice(0, 180)}${n.content.length > 180 ? "..." : ""}`}
              </p>
              <div className="row">
                {n.content.length > 180 && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setActiveNote(n)}
                  >
                    View full text
                  </button>
                )}
                <Link className="btn btn-secondary" to={`/flashcards/${n._id}`}>View Flashcards</Link>
                <button
                  className="btn"
                  disabled={generatingId === n._id}
                  onClick={async () => {
                    setNotice("");
                    setError("");
                    setGeneratingId(n._id);
                    let shouldClear = true;
                    try {
                      const res = await api.post(
                        `/notes/${n._id}/generate-flashcards`,
                        null,
                        { params: { async: 1 } }
                      );
                      if (res.status === 202 && res.data.jobId) {
                        shouldClear = false;
                        pollJob(n._id, res.data.jobId);
                        return;
                      }
                      setNotice(`Generated ${res.data.count} flashcards.`);
                    } catch (err) {
                      setError(err.response?.data?.error || "Flashcard generation failed");
                    } finally {
                      if (!mounted.current || !shouldClear) return;
                      setGeneratingId(null);
                    }
                  }}
                >
                  {generatingId === n._id ? "Generating..." : "Generate Flashcards"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeNote && (
        <div className="modal-backdrop" onClick={() => setActiveNote(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="row space">
              <h3>{activeNote.title}</h3>
              <button className="btn btn-ghost" type="button" onClick={() => setActiveNote(null)}>
                Close
              </button>
            </div>
            <p className="modal-body">{activeNote.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
