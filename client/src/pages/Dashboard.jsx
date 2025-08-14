import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/http.js";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get("/notes").then(res => setNotes(res.data));
  }, []);

  return (
    <div className="container">
      <h2>Your Notes</h2>
      <div className="grid">
        {notes.map(n => (
          <div key={n._id} className="card">
            <h3>{n.title}</h3>
            <p style={{opacity:.8, whiteSpace:"pre-wrap"}}>{n.content.slice(0, 200)}{n.content.length>200?"...":""}</p>
            <div className="row">
              <Link className="btn" to={`/flashcards/${n._id}`}>View Flashcards</Link>
              <button className="btn" onClick={async ()=>{
                const res = await api.post(`/notes/${n._id}/generate-flashcards`);
                alert(`Generated ${res.data.count} flashcards`);
              }}>Generate Flashcards</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
