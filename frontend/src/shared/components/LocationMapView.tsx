import React from "react";

import { Badge, Button, Card, Center, Stack, Text } from "@mantine/core";
import { Icon, LatLngTuple, Map as LeafletMap } from "leaflet";
import { LocateFixed, RefreshCw, X } from "lucide-react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { LocationMapProps } from "../models/location-map.types";
import { iconBakso, iconPerson } from "./icon";
import { notifications } from "@mantine/notifications";
import { pokeService } from "../services/pokeService";
import { modals } from "@mantine/modals";
import { NotificationCenter } from "./NotificationCenter";
import { NearbyUser } from "../models/user.types";

interface MapControllerProps {
  position: LatLngTuple | null;
}

interface MapMarkersProps {
  position: LatLngTuple | null;
  nearbyUsers: NearbyUser[];
  currentUser: NearbyUser;
  currentUserIcon: Icon;
  counterpartIcon: Icon;
}

// MapController component
const MapController: React.FC<MapControllerProps> = ({ position }) => {
  const map = useMap();

  React.useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [map, position]);

  return null;
};

// Calculate walking time based on distance in meters
const calculateTime = (distance: number) => {
  const result = Math.round(distance / 80); // 80 meters per minute
  if (result < 1) {
    return "kurang dari 1";
  }
  return result;
};

// Markers component
const MapMarkers: React.FC<MapMarkersProps> = ({
  position,
  currentUser,
  nearbyUsers,
  currentUserIcon,
  counterpartIcon,
}) => {
  return (
    <>
      {position && (
        <Marker position={position} icon={currentUserIcon}>
          <Card shadow="xs" style={{ padding: 8 }}>
            <Text size="sm" fw={500}>
              Anda
            </Text>
          </Card>
        </Marker>
      )}
      {nearbyUsers.map((user) => (
        <Marker
          key={user.id}
          position={
            [user.location.latitude, user.location.longitude] as LatLngTuple
          }
          icon={counterpartIcon}
          eventHandlers={{
            click: () => {
              if (user.role === "seller") {
                modals.openConfirmModal({
                  title: "Pesan Bakso",
                  children: (
                    <>
                      <Text size="sm">
                        🍜 Apakah Anda ingin memesan bakso dari {user.name}?
                      </Text>
                      <Text size="xs" c="dimmed">
                        Estimasi waktu: {calculateTime(user.distance)} menit
                      </Text>
                    </>
                  ),
                  labels: { cancel: "Batal", confirm: "Pesan" },
                  onConfirm: () => {
                    pokeService
                      .createPoke(currentUser.id, user.id, 5)
                      .then(({ success, message }) => {
                        if (success) {
                          notifications.show({
                            title: "Pesan Bakso",
                            message: message,
                            color: "green",
                          });
                        }
                      })
                      .catch((error) => {
                        notifications.show({
                          title: "Pesan Bakso",
                          message: error.message,
                          color: "red",
                        });
                      });
                  },
                });
              }
            },
          }}
        >
          {" "}
          <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
            <Text size="sm" fw={500}>
              {user.name}
            </Text>
            <Text size="xs" c="dimmed">
              Jarak: {(user.distance / 1000).toFixed(1)} km
            </Text>
            {/* {user.rating && (
              <Text size="xs" c="dimmed">
                Rating: {user.rating.toFixed(1)}⭐
              </Text>
            )} */}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};

export const LocationMapView: React.FC<LocationMapProps> = ({
  position,
  nearbyUsers,
  currentUser,
  isLoading,
  error,
  userRole,
  onRefresh,
  onExit,
}) => {
  const currentUserIcon = userRole === "seller" ? iconBakso : iconPerson;
  const counterpartIcon = userRole === "seller" ? iconPerson : iconBakso;

  const [mapRef, setMapRef] = React.useState<LeafletMap | null>(null);

  const handleRecenter = React.useCallback(() => {
    if (mapRef && position) {
      mapRef.setView(position, mapRef.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [mapRef, position]);

  if (isLoading && !position) {
    return <Center>Memuat Lokasi...</Center>;
  }

  if (error) {
    return (
      <Stack align="center" gap="md" p="xl">
        <Text c="red" size="lg">
          {error}
        </Text>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </Stack>
    );
  }

  return (
    <>
      <MapContainer
        center={position ?? [0, 0]}
        zoom={16}
        minZoom={15}
        maxZoom={18}
        style={{ height: "100dvh", zIndex: 0 }}
        ref={(map) => setMapRef(map)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController position={position} />
        <MapMarkers
          position={position}
          nearbyUsers={nearbyUsers}
          currentUser={currentUser}
          currentUserIcon={currentUserIcon}
          counterpartIcon={counterpartIcon}
        />
      </MapContainer>

      <ActionButtons
        role={currentUser.role}
        users={nearbyUsers}
        onRefresh={onRefresh}
        isLoading={isLoading}
        onExit={onExit}
        onRecenter={handleRecenter}
      />
    </>
  );
};

const ActionButtons = ({
  onRefresh,
  isLoading,
  onExit,
  onRecenter,
  users,
  role,
}: {
  onRefresh: () => void;
  onRecenter: () => void;
  isLoading: boolean;
  onExit: () => void;
  role: string;
  users: NearbyUser[];
}) => (
  <div
    style={{
      zIndex: 50,
      position: "absolute",
      top: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      padding: 8,
    }}
  >
    <Stack m={16} align="end">
      <Button onClick={onRecenter} variant="white" size="compact-lg" w={50}>
        <LocateFixed size={20} />
      </Button>
      <Button
        onClick={onRefresh}
        variant="white"
        size="compact-lg"
        loading={isLoading}
        w={50}
      >
        <RefreshCw size={20} />
      </Button>
      <Button
        color="red"
        onClick={onExit}
        variant="white"
        size="compact-lg"
        w={50}
      >
        <X size={20} />
      </Button>
      {role === "seller" && <NotificationCenter users={users} />}
      <Badge color={role === "customer" ? "blue" : "green"}>
        {role === "customer" ? "Customer" : "Tukang Bakso"}
      </Badge>
    </Stack>
  </div>
);
