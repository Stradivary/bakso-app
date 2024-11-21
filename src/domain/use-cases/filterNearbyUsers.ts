import { UserPayload } from "@/data/models/user.types";
import { BUYER_RADIUS, SELLER_RADIUS } from "@/shared/utils/constants";
import { LatLng } from "leaflet";
import { calculateDistance } from "./calculateDistance";

export const filterNearbyUsers = (
  users: UserPayload[],
  currentLocation: LatLng,
  userRole: "seller" | "buyer",
  userId?: string,
): UserPayload[] => {
  const adjustDuplicateLocations = (users: UserPayload[]) => {
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        if (
          users[i].location.lat === users[j].location.lat &&
          users[i].location.lng === users[j].location.lng
        ) {
          users[j].location.lat += 0.01;
          users[j].location.lng += 0.01;
        }
      }
    }
    return users;
  };

  return adjustDuplicateLocations(users).filter((user) => {
    if (user.id === userId) return false; // Exclude self

    const distance = calculateDistance(
      currentLocation,
      new LatLng(user.location.lat, user.location.lng),
    );

    if (userRole === "buyer") {
      return user.role === "seller" && distance <= BUYER_RADIUS;
    } else if (userRole === "seller") {
      return (
        user.role === "buyer" && distance <= SELLER_RADIUS && user.isAvailable
      );
    }
    return false;
  });
};
