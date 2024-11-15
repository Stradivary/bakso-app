import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC<{ children: JSX.Element; }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {

      navigate('/login')
    }
  }, [isAuthenticated, navigate])
  return children;
};
