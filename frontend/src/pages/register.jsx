import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await makeRequest.post("/auth/register", inputs);
      setErr(null);
      setSuccess("Account created. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      if (error.response && error.response.data) {
        setErr(error.response.data);
      } else {
        setErr(error.message);
      }
    }
  };

  return (
    <main className="uks-auth-page">
      <section className="uks-auth-copy">
        <div className="uks-auth-logo">
          <span>U</span>
          <strong>Uks15</strong>
        </div>
        <h1>Start your circle today.</h1>
        <p>
          Create a profile, share photo posts, follow people, and receive
          updates when your circle interacts.
        </p>
      </section>

      <section className="uks-auth-card">
        <form onSubmit={handleClick}>
          <input
            type="text"
            placeholder="Full name"
            name="name"
            value={inputs.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={inputs.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={inputs.email}
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
          {success && <span className="uks-auth-success">{success}</span>}
          <button className="uks-auth-submit" type="submit">
            Create account
          </button>
          <hr />
          <Link to="/login" className="uks-auth-create">
            Back to login
          </Link>
        </form>
      </section>
    </main>
  );
};

export default Register;
