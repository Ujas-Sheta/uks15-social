import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      navigate("/");
    } catch (error) {
      setErr(error.response?.data || "Login failed");
    }
  };

  return (
    <main className="uks-auth-page">
      <section className="uks-auth-copy">
        <div className="uks-auth-logo">
          <span>U</span>
          <strong>Uks15</strong>
        </div>
        <h1>Connect, share, and grow your circle.</h1>
        <p>
          A Facebook and Instagram inspired social platform with posts,
          profiles, reactions, comments, search, follows, and updates.
        </p>
      </section>

      <section className="uks-auth-card">
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={inputs.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={inputs.password}
            onChange={handleChange}
            required
          />
          {err && (
            <span className="uks-auth-error">
              {typeof err === "string"
                ? err
                : err.sqlMessage || err.message || "Something went wrong"}
            </span>
          )}
          <button className="uks-auth-submit" type="submit">
            Log in
          </button>
          <a href="#">Forgot password?</a>
          <hr />
          <Link to="/register" className="uks-auth-create">
            Create new account
          </Link>
        </form>
      </section>
    </main>
  );
};

export default Login;
