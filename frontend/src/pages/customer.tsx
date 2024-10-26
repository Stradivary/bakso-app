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

export function CustomerPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [sellers, setSellers] = useState<NearbyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to update user's location and fetch nearby sellers
  const updateLocationAndFetchSellers = async (latitude: number, longitude: number) => {
    try {
      // Update user's location
      await userService.updateLocation({ latitude, longitude });

      // Fetch nearby sellers
      const nearbySellers = await userService.findNearbyCounterparts({
        latitude,
        longitude,
        ...SEARCH_PARAMS
      });

      setSellers(nearbySellers);
      setError(null);
    } catch (err) {
      console.error('Error updating location or fetching sellers:', err);
      setError((err as Error).message);
    }
  };

  // Initialize location tracking and seller discovery
  useEffect(() => {
    let locationWatcher: number;
    let locationInterval: NodeJS.Timeout;

    const initializeLocation = async () => {
      try {
        setIsLoading(true);

        // Get initial position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        await updateLocationAndFetchSellers(latitude, longitude);

        // Watch for location changes
        locationWatcher = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setPosition([latitude, longitude]);
            await updateLocationAndFetchSellers(latitude, longitude);
          },
          (error) => {
            console.error('Location watch error:', error);
            setError('Unable to track location. Please ensure location services are enabled.');
          },
          { enableHighAccuracy: true }
        );

        // Periodic location update and seller refresh
        locationInterval = setInterval(async () => {
          if (position) {
            const { latitude, longitude } = position.coords;
            await updateLocationAndFetchSellers(latitude, longitude);
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

    // Cleanup function
    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, []);

  // Subscribe to real-time seller updates
  useEffect(() => {
    const subscription = supabase
      .channel('public:users_new')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users_new',
          filter: 'role=eq.seller'
        },
        async () => {
          if (position) {
            // Refresh sellers list when a seller's data changes
            await updateLocationAndFetchSellers(position[0], position[1]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [position]);

  // Manual refresh function
  const refreshSellers = async () => {
    if (position) {
      setIsLoading(true);
      try {
        await updateLocationAndFetchSellers(position[0], position[1]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle user exit
  const handleExit = async () => {
    try {
      await userService.deactivateUser();
      navigate('/auth');
    } catch (err) {
      console.error('Error deactivating user:', err);
      navigate('/auth'); // Navigate anyway
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
          <Marker position={position} icon={iconPerson}>
            <Tooltip>You are here</Tooltip>
          </Marker>
        )}
        {sellers.map((seller) => (
          <Marker
            key={seller.id}
            position={[seller.location.latitude, seller.location.longitude]}
            icon={iconBakso}
          >
            <Tooltip>
              <div>
                <strong>{seller.name}</strong>
                <br />
                Distance: {(seller.distance / 1000).toFixed(1)} km
                {seller.rating && <><br /> Rating: {seller.rating.toFixed(1)}⭐</>}
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
            onClick={refreshSellers}
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