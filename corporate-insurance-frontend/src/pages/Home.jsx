import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem("role");

    if (!savedRole) {
      navigate("/");
    } else {
      setRole(savedRole);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-[#111827] p-6 space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">InsureAI</h2>

        <nav className="space-y-4 text-gray-300">
          <p className="hover:text-cyan-400 cursor-pointer">Dashboard</p>
          <p className="hover:text-cyan-400 cursor-pointer">Policies</p>
          <p className="hover:text-cyan-400 cursor-pointer">Claims</p>
          <p className="hover:text-cyan-400 cursor-pointer">AI Risk Analysis</p>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">

        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Welcome to InsureAI Dashboard
          </h1>

          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-400 mb-8">
          Logged in as: <span className="text-cyan-400">{role}</span>
        </p>

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-[#111827] p-6 rounded-xl">
            <h3 className="text-gray-400">Active Policies</h3>
            <p className="text-3xl font-bold mt-2">24</p>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl">
            <h3 className="text-gray-400">Pending Claims</h3>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl">
            <h3 className="text-gray-400">AI Risk Score</h3>
            <p className="text-3xl font-bold mt-2 text-cyan-400">82%</p>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl">
            <h3 className="text-gray-400">Premium Value</h3>
            <p className="text-3xl font-bold mt-2">$18,400</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Home;
