import BroadcastMapView from "@/shared/views/BroadcastMapView";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const BroadcastMapPage = () => {
  return (
    <ProtectedRoute>
      <BroadcastMapView />
    </ProtectedRoute>
  );
};