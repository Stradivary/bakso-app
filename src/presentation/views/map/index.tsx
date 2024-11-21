import { ProtectedRoute } from "@/presentation/components/ProtectedRoute";
import BroadcastMapView from "./BroadcastMapView";

export const BroadcastMapPage = () => {
  return (
    <ProtectedRoute>
      <BroadcastMapView />
    </ProtectedRoute>
  );
};
