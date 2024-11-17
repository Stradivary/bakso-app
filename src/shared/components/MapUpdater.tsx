import { Stack, Text } from "@mantine/core";
import { LatLng, Point } from "leaflet";
import { Marker, Tooltip } from "react-leaflet";
import { useLocationUpdater } from "../hooks/useLocationUpdater";
import { User } from "../models/BroadcastMapModel";
import { iconBakso, iconPerson } from "./Icon";

export const MapUpdater = ({
  disabled,
  userId,
  userRole,
  updateLocation,
}: Readonly<{
  disabled: boolean;
  userId: string;
  userRole: string;
  updateLocation: (userId: string, location: LatLng) => void;
}>) => {
  useLocationUpdater({ disabled, userId, userRole, updateLocation });
  return null;
};

export function TargetMark({
  handleClick,
  nearbyUser,
}: Readonly<{
  nearbyUser: User;
  handleClick: (nearbyUser: User) => void;
}>) {
  return (
    <Marker
      position={
        new LatLng(
          nearbyUser?.location?.lat ?? 0,
          nearbyUser?.location?.lng ?? 0,
        )
      }
      icon={nearbyUser.role === "seller" ? iconBakso : iconPerson}
      eventHandlers={{
        click: () => handleClick(nearbyUser),
      }}
    >
      <Tooltip>
        <Stack gap={4}>
          <Text>{nearbyUser.userName}</Text>
          <Text c="gray">
            {nearbyUser.role === "seller" ? "Pedagang Bakso" : "Pelanggan"}
          </Text>
        </Stack>
      </Tooltip>
    </Marker>
  );
}

export function UserMarker({
  location,
  userRole,
}: Readonly<{
  location: { latitude: number; longitude: number };
  userRole: string;
}>) {
  return (
    <Marker
      position={new LatLng(location?.latitude ?? 0, location?.longitude ?? 0)}
      icon={userRole === "seller" ? iconBakso : iconPerson}
    >
      <Tooltip permanent direction="bottom" offset={new Point(0, 12)}>
        Lokasi Anda
      </Tooltip>
    </Marker>
  );
}

export function NearbyUsersMarker({
  nearbyUsers,
  handleMarkerClick,
}: {
  nearbyUsers: User[];
  handleMarkerClick: (nearbyUser: User) => void;
}): React.ReactNode {
  return nearbyUsers.map((nearbyUser, idx) => (
    <TargetMark
      key={`${nearbyUser.user_id} ${idx} ${nearbyUser.role}`}
      nearbyUser={nearbyUser}
      handleClick={handleMarkerClick}
    />
  ));
}
