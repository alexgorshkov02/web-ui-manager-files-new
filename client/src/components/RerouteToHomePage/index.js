import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RerouteToHomePage = ({ user, children }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user === null) {
      return;
    } else {
      navigate("/");
    }
  }, [user, navigate]);
};

export default RerouteToHomePage;
