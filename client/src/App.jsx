import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NoteEditor from "./pages/NoteEditor.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import NavBar from "./components/NavBar.jsx";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/notes/new" element={<PrivateRoute><NoteEditor /></PrivateRoute>} />
        <Route path="/flashcards/:noteId" element={<PrivateRoute><Flashcards /></PrivateRoute>} />
      </Routes>
    </>
  );
}
