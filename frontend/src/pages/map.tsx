/**
 * New MAP based on broadcast mode
 */

import BroadcastMapView from "@/shared/components/BroadcastMapView";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const BroadcastMapPage = () => {
  return (
    <ProtectedRoute>
      <BroadcastMapView />
    </ProtectedRoute>
  );
};