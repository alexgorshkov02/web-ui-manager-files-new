import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      return;
    }
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (user) {
    return children;
  } else {
    return null;
  }
};

export default ProtectedRoute;
