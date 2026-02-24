import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyEmail } from "../services/authService";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(() => alert("Email verified successfully"))
        .catch(() => alert("Invalid or expired token"));
    }
  }, [token]);

  return <h2>Email Verification Processing...</h2>;
}

export default VerifyEmail;
