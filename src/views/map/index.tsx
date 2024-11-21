import { ProtectedRoute } from "@/views/components/ProtectedRoute";
import BroadcastMapView from "@/views/map/BroadcastMapView";

export const BroadcastMapPage = () => {
  return (
    <ProtectedRoute>
      <BroadcastMapView />
    </ProtectedRoute>
  );
};
