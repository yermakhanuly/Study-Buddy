import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/auth");
  };

  return (
    <div className="nav">
      <Link className="brand" to="/">StudyBuddy AI</Link>
      <div className="row">
        {token ? (
          <>
            <span>Hello, {userName || "Student"} 👋</span>
            <Link className="btn" to="/notes/new">+ New Note</Link>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link className="btn" to="/auth">Login</Link>
        )}
      </div>
    </div>
  );
}
