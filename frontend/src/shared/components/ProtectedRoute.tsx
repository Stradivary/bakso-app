import { Navigate } from "react-router-dom";
import { useAuth } from "../services/authService";

export const ProtectedRoute: React.FC<{ children: JSX.Element; }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};