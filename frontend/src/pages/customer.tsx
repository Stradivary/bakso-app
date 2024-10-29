import { Button, Center, Drawer, Image, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { iconBakso, iconPerson } from '../shared/components/icon.tsx';
import { supabase } from '../shared/services/supabaseService';
import { NearbyUser, userService } from '../shared/services/userService';

const RADIUS_METERS = 5000; // 5 km radius
const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
const SEARCH_PARAMS = {
  radiusMeters: RADIUS_METERS,
  maxResults: 50,
  minRating: 0,
  activeWithinMinutes: 15
};


export function LocationMapPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') as 'customer' | 'seller';

  // Get the correct role for searching counterparts
  const counterpartRole = userRole === 'customer' ? 'seller' : 'buyer';

  // Function to update user's location and fetch nearby users
  const updateLocationAndFetchUsers = async (latitude: number, longitude: number) => {
    try {
      await userService.updateLocation({ latitude, longitude });

      const nearbyCounterparts = await userService.findNearbyCounterparts({
        latitude,
        longitude,
        ...SEARCH_PARAMS,
      });

      setNearbyUsers(nearbyCounterparts);
      setError(null);
    } catch (err) {
      console.error('Error updating location or fetching users:', err);
      setError((err as Error).message);
    }
  };

  // Initialize location tracking and user discovery
  useEffect(() => {
    let locationWatcher: number;
    let locationInterval: NodeJS.Timeout;

    const initializeLocation = async () => {
      try {
        setIsLoading(true);

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        await updateLocationAndFetchUsers(latitude, longitude);

        locationWatcher = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setPosition([latitude, longitude]);
            await updateLocationAndFetchUsers(latitude, longitude);
          },
          (error) => {
            console.error('Location watch error:', error);
            setError('Unable to track location. Please ensure location services are enabled.');
          },
          { enableHighAccuracy: true }
        );

        locationInterval = setInterval(async () => {
          if (position) {
            const { latitude, longitude } = position.coords;
            await updateLocationAndFetchUsers(latitude, longitude);
          }
        }, LOCATION_UPDATE_INTERVAL);

      } catch (err) {
        console.error('Error initializing location:', err);
        setError('Please enable location services to use this app.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocation();

    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('public:users_new')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users_new',
          filter: `role=eq.${counterpartRole}`
        },
        async () => {
          if (position) {
            await updateLocationAndFetchUsers(position[0], position[1]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [position, counterpartRole]);

  const refreshUsers = async () => {
    if (position) {
      setIsLoading(true);
      try {
        await updateLocationAndFetchUsers(position[0], position[1]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExit = async () => {
    try {
      await userService.deactivateUser();
      navigate('/auth');
    } catch (err) {
      console.error('Error deactivating user:', err);
      navigate('/auth');
    }
  };

  if (isLoading && !position) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return (
      <Stack align="center" gap="md" p="xl">
        <Text c="red" size="lg">{error}</Text>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Stack>
    );
  }


  const currentUserIcon = userRole === 'seller' ? iconBakso : iconPerson;

  const counterpartIcon = userRole === 'seller' ? iconPerson : iconBakso;

  return (
    <>
      <MapContainer
        center={position ?? [0, 0]}
        zoom={16}
        minZoom={15}
        maxZoom={18}
        style={{ height: '100dvh', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <Marker position={position} icon={currentUserIcon}>
            <Tooltip>You are here</Tooltip>
          </Marker>
        )}
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            position={[user.location.latitude, user.location.longitude]}
            icon={counterpartIcon}
          >
            <Tooltip>
              <div>
                <strong>{user.name}</strong>
                <br />
                Distance: {(user.distance / 1000).toFixed(1)} km
                {user.rating && <><br /> Rating: {user.rating.toFixed(1)}⭐</>}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <div style={{
        zIndex: 400,
        position: 'absolute',
        top: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        padding: 8,
      }}>
        <Stack m={16}>
          <Button
            onClick={refreshUsers}
            variant='white'
            size='compact-md'
            loading={isLoading}
          >
            <RefreshCw size={20} />
          </Button>
          <Button
            color="red"
            onClick={open}
            variant='white'
            size='compact-md'
          >
            <X size={20} />
          </Button>
        </Stack>
      </div>

      <Drawer
        position='bottom'
        opened={opened}
        onClose={close}
        withCloseButton={false}
        withinPortal
        styles={{
          content: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        <div style={{
          width: 42,
          height: 4,
          background: "#DFE2E7",
          borderRadius: 8,
          flex: 'none',
          order: 1,
          flexGrow: 0,
          margin: '16px auto 24px auto',
        }} />
        <Stack>
          <Center>
            <Image src="/confirmation.png" alt="confirmation" w={100} h={100} />
          </Center>
          <Text ta="center">
            Dengan menutup halaman ini, kamu akan keluar dari pantauan Tukang Bakso
          </Text>
          <Button onClick={handleExit} radius="lg" size='md'>
            OK
          </Button>
          <Button onClick={close} radius="lg" variant='outline'>
            Batal
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}