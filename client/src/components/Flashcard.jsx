import { useState } from "react";

export default function Flashcard({ q, a }) {
  const [flip, setFlip] = useState(false);
  return (
    <div className={`flash ${flip ? "flip": ""}`} onClick={()=>setFlip(!flip)} style={{ height: 160 }}>
      <div className="flash-inner" style={{ height:"100%" }}>
        <div className="flash-face card" style={{ height:"100%" }}>
          <strong>Q:</strong> {q}
          <p style={{opacity:.7}}>Click to flip</p>
        </div>
        <div className="flash-face flash-back card" style={{ height:"100%" }}>
          <strong>A:</strong> {a}
        </div>
      </div>
    </div>
  );
}
