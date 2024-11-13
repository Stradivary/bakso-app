import { Badge, Button, Center, Image, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import L, { Point } from 'leaflet';
import React, { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { calculateDistance, useLocationTracking } from '../hooks/useTracker';
import { ActionButtons } from './ActionButtons';
import { Dialog } from './Dialog';
import { iconBakso, iconPerson } from "./Icon";

const UPDATE_INTERVAL = 5 * 1000; // Update interval in milliseconds (5 seconds)

// Custom hook to handle map updates
const MapUpdater = ({
  userRole,
  updateLocation,
}: {
  userRole: string,
  updateLocation: (location: L.LatLng) => void;
}
) => {
  const { latitude, longitude } = useLocation({
    autoUpdate: true,
  });

  useEffect(() => {
    if (userRole === 'seller') {
      const updateInterval = setInterval(() => {
        updateLocation(new L.LatLng(latitude ?? 0, longitude ?? 0));
      }, UPDATE_INTERVAL);

      return () => clearInterval(updateInterval);
    }
  }, [userRole, updateLocation, latitude, longitude]);

  return null;
};

const BroadcastMapView: React.FC = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const userId = session?.user?.id as string;
  const userRole = sessionStorage.getItem('role') as 'seller' | 'buyer';
  const [exitModalOpened, { close: exitModalClose, open: openModal }] = useDisclosure();

  const { latitude, longitude } = useLocation({ autoUpdate: true, updateInterval: 5000 });

  const initialLocation = useMemo(() => {
    console.log('latitude', latitude);
    console.log('longitude', longitude);
    return new L.LatLng(latitude ?? 0, longitude ?? 0);
  }, [latitude, longitude]);

  const {
    nearbyUsers,
    updateLocation,
    pingSeller,
    deactivateUser,
    notifications
  } = useLocationTracking(userId, userRole, initialLocation, session?.user?.user_metadata?.name ?? '');


  const [mapRef, setMapRef] = React.useState<L.Map | null>(null);

  const handleRecenter = React.useCallback(() => {
    if (mapRef && initialLocation) {
      mapRef.setView(initialLocation, mapRef.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [mapRef, initialLocation]);

  const handleExit = React.useCallback(() => {
    deactivateUser();
    logout();
    sessionStorage.removeItem('role');
    exitModalClose();
  }, [deactivateUser, exitModalClose, logout, navigate]);


  return (
    <>
      <MapContainer
        key={initialLocation.toString()}
        ref={(map) => setMapRef(map)}
        center={initialLocation}
        zoom={16}
        minZoom={13}
        maxZoom={18}
        style={{ height: "100dvh", width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* Update map position for sellers */}
        {userRole === 'seller' && (
          <MapUpdater userRole={userRole} updateLocation={updateLocation} />
        )}

        {/* Render user's current location */}
        <Marker position={initialLocation} icon={userRole === 'seller' ? iconBakso : iconPerson}>
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
                    const buyerLocation = initialLocation;
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
                        <>
                          <Text size="sm">
                            🍜 Apakah Anda ingin memesan bakso dari {nearbyUser.userName}?
                          </Text>
                          <Text size="xs" c="dimmed">
                            Estimasi waktu: {estimatedTimeInMinutes} menit berjalan kaki
                          </Text>
                        </>
                      ),
                      labels: { cancel: "Batal", confirm: "Pesan" },
                      onConfirm: () => {
                        pingSeller?.(nearbyUser.user_id);
                        modals.open({
                          title: "Pesan Bakso",
                          children: "Pesan bakso telah dikirim",
                          color: "blue",
                        });
                      },
                    });
                  }
                },
              }}
            >
              <Popup>
                <div   >
                  <Text>{nearbyUser.userName}</Text>
                  <Text c="gray">{nearbyUser.role === 'seller' ? 'Pedagang Bakso' : 'Pelanggan'}</Text>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <ActionButtons
        role={userRole}
        isLoading={false}
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