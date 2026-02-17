import React, { useState } from "react";
import axios from "axios";
import "./AuthPage.css";

function AuthPage() {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Password validation: min 6 chars, 1 number, 1 uppercase, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 6 chars, include 1 uppercase, 1 number & 1 special char");
      return;
    }

    if (isSignup && !role) {
      alert("Please select a role");
      return;
    }

    const url = isSignup
      ? "http://localhost:8080/api/auth/signup"
      : "http://localhost:8080/api/auth/login";

    try {
      const res = await axios.post(url, { name, phone, email, password, role });
      alert(res.data);
      setName(""); setPhone(""); setEmail(""); setPassword(""); setRole("");
    } catch (err) {
      alert("Error occurred");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">InsurAI</h1>
        <p className="auth-subtitle">Smart Insurance Management System</p>
        <h2 className="auth-header">{isSignup ? "Sign Up" : "Login"}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
              <select value={role} onChange={e => setRole(e.target.value)} required>
                <option value="">Select Role</option>
                <option value="customer">Customer</option>
                <option value="advisor">Advisor</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="auth-btn">{isSignup ? "Register" : "Login"}</button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New user?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;