import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleReset = async () => {
    try {
      await resetPassword({ token, password });
      alert("Password reset successful");
    } catch {
      alert("Invalid or expired link");
    }
  };

  return (
    <div>
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleReset}>Reset Password</button>
    </div>
  );
}

export default ResetPassword;
