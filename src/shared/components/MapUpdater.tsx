import { Stack, Text } from "@mantine/core";
import { LatLng, Point } from "leaflet";
import { useEffect } from "react";
import { Marker, Tooltip } from "react-leaflet";
import { useLocation } from "../hooks/useLocation";
import { User } from "../models/BroadcastMapModel";
import { iconBakso, iconPerson } from "./Icon";

const UPDATE_INTERVAL = 2 * 1000;

export const MapUpdater = ({
  disabled,
  userId,
  userRole,
  updateLocation,
}: {
  disabled: boolean,
  userId: string,
  userRole: string,
  updateLocation: (userId: string, location: LatLng) => void;
}
) => {
  const { location } = useLocation();

  useEffect(() => {
    if (userRole === 'seller' && !disabled) {
      const updateInterval = setInterval(() => {
        updateLocation(userId, new LatLng(location?.latitude ?? 0, location?.longitude ?? 0));
      }, UPDATE_INTERVAL);

      return () => clearInterval(updateInterval);
    }
  }, [userRole, updateLocation, location?.latitude, location?.longitude, disabled]);

  return null;
};


export function TargetMark({ handleClick, nearbyUser }: {
  nearbyUser: User,
  handleClick: () => L.LeafletMouseEventHandlerFn | undefined,
}) {
  return <Marker
    position={new LatLng(nearbyUser?.location?.lat ?? 0, nearbyUser?.location?.lng ?? 0)}
    icon={nearbyUser.role === 'seller' ? iconBakso : iconPerson}
    eventHandlers={{
      click: handleClick,
    }}
  >
    <Tooltip>
      <Stack gap={4}>
        <Text>{nearbyUser.userName}</Text>
        <Text c="gray">{nearbyUser.role === 'seller' ? 'Pedagang Bakso' : 'Pelanggan'}</Text>
      </Stack>
    </Tooltip>
  </Marker>;
}


export function UserMarker({ location, userRole }: { location: { latitude: number; longitude: number; }; userRole: string; }) {
  return (<Marker
    position={new LatLng(location?.latitude ?? 0, location?.longitude ?? 0)}
    icon={userRole === 'seller' ? iconBakso : iconPerson}>
    <Tooltip permanent direction='bottom' offset={new Point(0, 12)}>
      Lokasi Anda
    </Tooltip>
  </Marker>);
}