import { useState } from "react";

export default function Flashcard({ q, a, onDelete }) {
  const [flip, setFlip] = useState(false);
  const toggle = () => setFlip((value) => !value);
  return (
    <div
      className={`flash ${flip ? "flip": ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={flip}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {onDelete && (
        <button
          className="btn btn-small btn-danger flash-action"
          type="button"
          aria-label="Delete flashcard"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          Delete
        </button>
      )}
      <div className="flash-inner">
        <div className="flash-face">
          <strong>Q:</strong> {q}
          <span className="meta">Tap to flip</span>
        </div>
        <div className="flash-face flash-back">
          <strong>A:</strong> {a}
          <span className="meta">Tap to flip</span>
        </div>
      </div>
    </div>
  );
}
