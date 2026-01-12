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
  const [generationTarget, setGenerationTarget] = useState(null);
  const [cardCount, setCardCount] = useState(() => {
    const stored = Number(localStorage.getItem("flashcardCount"));
    return Number.isFinite(stored) && stored >= 1 && stored <= 20 ? stored : 8;
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes");
      if (mounted.current) setNotes(res.data);
    } catch (err) {
      if (mounted.current) setError(err.response?.data?.error || "Could not load notes");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const updateCardCount = (value) => {
    if (!Number.isFinite(value)) return;
    const next = Math.min(Math.max(value, 1), 20);
    setCardCount(next);
    localStorage.setItem("flashcardCount", String(next));
  };

  const updateNoteCount = (noteId, delta) => {
    setNotes((prev) =>
      prev.map((note) =>
        note._id === noteId
          ? { ...note, flashcardCount: (note.flashcardCount || 0) + delta }
          : note
      )
    );
  };

  const startGeneration = async (noteId) => {
    setNotice("");
    setError("");
    setGeneratingId(noteId);
    try {
      const res = await api.post(
        `/notes/${noteId}/generate-flashcards`,
        { count: cardCount }
      );
      setNotice(`Flashcards ready: ${res.data.count} added.`);
      updateNoteCount(noteId, res.data.count);
    } catch (err) {
      setError(err.response?.data?.error || "Flashcard generation failed");
    } finally {
      if (!mounted.current) return;
      setGeneratingId(null);
    }
  };

  const deleteNote = async (noteId) => {
    const ok = window.confirm("Delete this note and its flashcards?");
    if (!ok) return;
    setError("");
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete note");
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
            <div key={n._id} className="card note-card">
              <div className="row space">
                <h3>{n.title}</h3>
                <span className="badge">{n.flashcardCount || 0} cards</span>
              </div>
              <p style={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
                {`${n.content.slice(0, 180)}${n.content.length > 180 ? "..." : ""}`}
              </p>
              <div className="row note-actions">
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
                  disabled={Boolean(generatingId)}
                  onClick={() => setGenerationTarget(n)}
                >
                  {generatingId === n._id ? "Generating..." : "Generate Flashcards"}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  type="button"
                  onClick={() => deleteNote(n._id)}
                >
                  Delete Note
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

      {generationTarget && (
        <div className="modal-backdrop" onClick={() => setGenerationTarget(null)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <h3>Generate flashcards</h3>
            <p className="meta">Choose how many cards to create for this note.</p>
            <label className="row" style={{ gap: 10, marginTop: 12 }}>
              <span className="meta">Cards</span>
              <input
                className="input"
                type="number"
                min="1"
                max="20"
                value={cardCount}
                onChange={(e) => updateCardCount(Number(e.target.value))}
                style={{ width: 120, margin: 0 }}
              />
            </label>
            <div className="row" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setGenerationTarget(null)}>
                Cancel
              </button>
              <button
                className="btn"
                type="button"
                disabled={Boolean(generatingId)}
                onClick={() => {
                  const targetId = generationTarget._id;
                  setGenerationTarget(null);
                  startGeneration(targetId);
                }}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}
