import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/http.js";
import Flashcard from "../components/Flashcard.jsx";

export default function Flashcards() {
  const { noteId } = useParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      const res = await api.get("/flashcards", { params: { noteId } });
      setCards(res.data);
      setLoading(false);
    })();
  }, [noteId]);

  return (
    <div className="container">
      <h2>Flashcards</h2>
      {loading ? <p>Loading...</p> : cards.length === 0 ? (
        <div className="card">
          <p>No flashcards yet for this note.</p>
          <p>Go back and click <strong>Generate Flashcards</strong>.</p>
        </div>
      ) : (
        <div className="grid">
          {cards.map(c => <Flashcard key={c._id} q={c.question} a={c.answer} />)}
        </div>
      )}
    </div>
  );
}
