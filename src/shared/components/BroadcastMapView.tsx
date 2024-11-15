import { Badge, Button, Center, Image, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications as notify } from "@mantine/notifications";
import L, { Point } from 'leaflet';
import React, { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { ActionButtons } from './ActionButtons';
import { Dialog } from './Dialog';
import { iconBakso, iconPerson } from "./Icon";
import { useTracker } from '../hooks/useTracker';
import { calculateDistance } from '../services/trackerServices';

const UPDATE_INTERVAL = 2 * 1000; // Update interval in milliseconds (5 seconds)

// Custom hook to handle map updates
const MapUpdater = ({
  userId,
  userRole,
  updateLocation,
}: {
  userId: string,
  userRole: string,
  updateLocation: (userId: string, location: L.LatLng) => void;
}
) => {
  const { location } = useLocation();

  useEffect(() => {
    if (userRole === 'seller') {
      const updateInterval = setInterval(() => {
        updateLocation(userId, new L.LatLng(location?.latitude ?? 0, location?.longitude ?? 0));
      }, UPDATE_INTERVAL);

      return () => clearInterval(updateInterval);
    }
  }, [userRole, updateLocation, location?.latitude, location?.longitude]);

  return null;
};

const BroadcastMapView: React.FC = () => {
  const { session, logout } = useAuth();

  const userId = session?.user?.id as string;
  const userRole = sessionStorage.getItem('role') as 'seller' | 'buyer';
  const [exitModalOpened, { close: exitModalClose, open: openModal }] = useDisclosure();

  const { location } = useLocation();


  const {
    nearbyUsers,
    handleLocationUpdate: updateLocation,
    handlePing: pingSeller,
    notifications,
    deactivateUser,
  } = useTracker(userId, userRole, new L.LatLng(location?.latitude ?? 0, location?.longitude ?? 0), session?.user?.user_metadata?.name ?? '');


  const [mapRef, setMapRef] = React.useState<L.Map | null>(null);

  const handleRecenter = React.useCallback(() => {
    if (mapRef && location) {
      const newLocation = [location?.latitude || 0, location?.longitude || 0]
      mapRef.setView(new L.LatLng(newLocation[0], newLocation[1]), mapRef.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [mapRef, location]);

  const handleExit = React.useCallback(() => {
    deactivateUser();
    logout();
    sessionStorage.removeItem('role');
    exitModalClose();
  }, [deactivateUser, exitModalClose, logout]);

  if (!location) {
    return (
      <div>
        <Text>Getting your location...</Text>
      </div>
    );
  }

  return (
    <>
      <MapContainer
        key={location.toString()}
        ref={(map) => setMapRef(map)}
        center={new L.LatLng(location?.latitude || 0, location?.longitude || 0)}
        zoom={16}
        minZoom={13}
        maxZoom={18}
        style={{ height: "100dvh", width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {userRole === 'seller' && (
          <MapUpdater userId={userId} userRole={userRole} updateLocation={updateLocation} />
        )}

        {/* Render user's current location */}
        <Marker position={new L.LatLng(location?.latitude ?? 0, location?.longitude ?? 0)} icon={userRole === 'seller' ? iconBakso : iconPerson}>
          <Tooltip permanent direction='bottom' offset={new Point(0, 12)}>
            Lokasi
            Anda
          </Tooltip>
        </Marker>

        {/* Render nearby users */}
        {nearbyUsers.map((nearbyUser) => {
          return (
            <Marker
              key={`${nearbyUser.user_id} ${nearbyUser.role}`}
              position={new L.LatLng(nearbyUser?.location?.lat ?? 0, nearbyUser?.location?.lng ?? 0)}
              icon={nearbyUser.role === 'seller' ? iconBakso : iconPerson}
              eventHandlers={{
                click: () => {
                  if (nearbyUser.role === "seller") {
                    const buyerLocation = new L.LatLng(location?.latitude ?? 0, location?.longitude ?? 0);
                    const sellerLocation = new L.LatLng(
                      nearbyUser.location.lat,
                      nearbyUser.location.lng
                    );
                    const distanceInMeters = calculateDistance(buyerLocation, sellerLocation);
                    const walkingSpeed = 1.4; // meters per second
                    const estimatedTimeInMinutes = Math.round((distanceInMeters / walkingSpeed) / 60);

                    modals.openConfirmModal({
                      title: "Pesan Bakso",
                      children: (
                        <Stack gap={4}>
                          <Text size="sm">
                            🍜 Apakah Anda ingin memesan bakso dari {nearbyUser.userName}?
                          </Text>
                          <Text size="xs" c="dimmed">
                            Estimasi waktu: {estimatedTimeInMinutes} menit berjalan kaki
                          </Text>
                        </Stack>
                      ),
                      labels: { cancel: "Batal", confirm: "Pesan" },
                      onConfirm: () => {
                        pingSeller?.(nearbyUser.user_id, nearbyUser.userName);
                        notify.show({
                          title: "Pesan Bakso",
                          message: "Pesan bakso telah dikirim",
                          color: "blue",

                        });
                      },
                    });
                  }
                },
              }}
            >
              <Tooltip>
                <Stack gap={4}>
                  <Text>{nearbyUser.userName}</Text>
                  <Text c="gray">{nearbyUser.role === 'seller' ? 'Pedagang Bakso' : 'Pelanggan'}</Text>
                </Stack>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      <ActionButtons
        role={userRole}
        onExit={() => {
          openModal();
        }}
        notifications={notifications}
        onRecenter={handleRecenter}
      >
        <Badge variant='filled' color='teal'>
          {session?.user?.user_metadata?.name}
        </Badge>
      </ActionButtons>

      <Dialog opened={exitModalOpened} close={exitModalClose}>
        <Stack>
          <Center>
            <Image src="/confirmation.png" alt="confirmation" w={100} h={100} />
          </Center>
          <Text ta="center">
            Dengan menutup halaman ini, kamu akan keluar dari pantauan Tukang
            Bakso
          </Text>
          <Button onClick={handleExit} radius="lg" size="md">
            OK
          </Button>
          <Button onClick={exitModalClose} radius="lg" variant="outline">
            Batal
          </Button>
        </Stack>
      </Dialog>
    </>
  );
};

export default BroadcastMapView;