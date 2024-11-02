import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export const ProtectedRoute: React.FC<{ children: JSX.Element; }> = ({
  children,
}) => {
  const { user } = useAuth();
  if (!user && sessionStorage.getItem('user') === null) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};
