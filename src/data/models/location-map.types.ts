import { NearbyUser } from "./user.types";

export type UserRole = "customer" | "seller";

export interface LocationMapProps {
  position: [number, number] | null;
  nearbyUsers: NearbyUser[];
  currentUser: NearbyUser;
  error: string | null;
  userRole: UserRole;
  onExit: () => void;
}
