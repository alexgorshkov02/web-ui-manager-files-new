import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ user, children, requireAdmin = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) return; // still loading
    if (!user || (requireAdmin && user.role !== "admin")) {
      navigate("/");
    }
  }, [user, navigate, requireAdmin]);

  return user ? children : null;
};

export default ProtectedRoute;
