import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate?.("/login");
    }
  }, [isAuthenticated, navigate]);
  return children;
};
