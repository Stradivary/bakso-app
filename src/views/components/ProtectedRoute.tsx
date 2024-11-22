import { Box, LoadingOverlay } from "@mantine/core";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/authProvider";

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box h="100dvh">
        <LoadingOverlay visible />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
