import { useState } from "react";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await forgotPassword(email);
      alert("Password reset link sent to email");
    } catch {
      alert("Error sending reset link");
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit}>Send Reset Link</button>
    </div>
  );
}

export default ForgotPassword;
