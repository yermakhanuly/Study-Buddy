import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/http.js";
import Flashcard from "../components/Flashcard.jsx";

export default function Flashcards() {
  const { noteId } = useParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/flashcards", { params: { noteId } });
        setCards(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load flashcards");
      } finally {
        setLoading(false);
      }
    })();
  }, [noteId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this flashcard?");
    if (!ok) return;
    setError("");
    try {
      await api.delete(`/flashcards/${id}`);
      setCards((prev) => prev.filter((card) => card._id !== id));
      setNotice("Flashcard deleted.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete flashcard");
    }
  };

  const handleDeleteAll = async () => {
    const ok = window.confirm("Delete all flashcards for this note?");
    if (!ok) return;
    setError("");
    setDeletingAll(true);
    try {
      const res = await api.delete(`/flashcards/note/${noteId}`);
      setCards([]);
      setNotice(`Deleted ${res.data.deletedCount || 0} flashcards.`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete flashcards");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h2 className="page-title">Flashcards</h2>
          <p className="page-subtitle">Tap a card to flip the answer.</p>
        </div>
        <div className="row">
          <button
            className="btn btn-danger"
            type="button"
            disabled={deletingAll || cards.length === 0}
            onClick={handleDeleteAll}
          >
            {deletingAll ? "Deleting..." : "Delete All"}
          </button>
          <Link className="btn btn-secondary" to="/">Back to Notes</Link>
        </div>
      </div>

      {notice && <div className="alert success">{notice}</div>}
      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="card" style={{ minHeight: 170 }} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="card empty">
          <p>No flashcards yet for this note.</p>
          <p>Generate them from your note to start practicing.</p>
          <Link className="btn" to="/">Generate from Notes</Link>
        </div>
      ) : (
        <div className="grid">
          {cards.map(c => (
            <Flashcard
              key={c._id}
              q={c.question}
              a={c.answer}
              onDelete={() => handleDelete(c._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
