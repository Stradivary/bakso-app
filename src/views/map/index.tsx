import { ProtectedRoute } from "@/views/components/ProtectedRoute";
import MapView from "@/views/map/MapView";

export const BroadcastMapPage = () => {
  return (
    <ProtectedRoute>
      <MapView />
    </ProtectedRoute>
  );
};
