import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    alert("Registration successful! You can now login.");
    setIsLogin(true);
  };

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      alert("Enter email and password");
      return;
    }

    // Fake login (no backend)
    localStorage.setItem("role", formData.role);
    localStorage.setItem("token", "fake-token");

    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-white">
      <div className="bg-[#111827] p-10 rounded-2xl shadow-2xl w-[400px]">

        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? "Login to InsureAI" : "Create InsureAI Account"}
        </h2>

        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-[#1F2937] border border-gray-600 outline-none"
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-[#1F2937] border border-gray-600 outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-[#1F2937] border border-gray-600 outline-none"
        />

        {!isLogin && (
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-[#1F2937] text-white border border-gray-600 outline-none"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}

        {isLogin ? (
          <button
            onClick={handleLogin}
            className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-xl font-semibold"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleRegister}
            className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-xl font-semibold"
          >
            Sign Up
          </button>
        )}

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 mt-4 text-center cursor-pointer hover:text-cyan-400"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>

      </div>
    </div>
  );
}

export default Landing;
