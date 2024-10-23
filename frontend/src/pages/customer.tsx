/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/CustomerInterface.tsx
import { Button, Center, Drawer, Image, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { iconBakso, iconPerson } from '../components/icon.tsx';

export function CustomerPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const navigate = useNavigate();
  // const radiusMeters = 5000; // 5 km radius

  // Obtain user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);

        // Update user's location in Supabase
        // await updateUserLocation(latitude, longitude);

        //   Fetch nearby sellers
        // const nearbySellers = await getNearbySellers(
        //   latitude,
        //   longitude,
        //   radiusMeters
        // );
        // MOCK DATA, random sellers in radius of 1 km, on all directions
        const nearbySellers = Array.from({ length: 10 }, (_, i) => ({
          id: i,
          name: `Seller ${i}`,
          location: {
            type: 'Point',
            coordinates: [
              longitude + (Math.random() - 0.5) / 100,
              latitude + (Math.random() - 0.5) / 100,
            ],
          },
        }));
        setSellers(nearbySellers);
      },
      (error) => {
        console.error('Error getting location:', error.message);
        alert('Please enable location services to use this app.');
      }
    );
  }, []);

  // // Subscribe to real-time updates
  // useEffect(() => {
  //   if (!position) return;

  //   const subscription = supabase
  //     .channel('public:users')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'users',
  //         filter: `role=eq.Seller`,
  //       },
  //       async () => {
  //         // Re-fetch nearby sellers on any change
  //         const [latitude, longitude] = position;
  //         const nearbySellers = await getNearbySellers(
  //           latitude,
  //           longitude,
  //           radiusMeters
  //         );
  //         setSellers(nearbySellers);
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(subscription);
  //   };
  // }, [position]);

  // const refreshSellers = async () => {
  //   if (position) {
  //     const [latitude, longitude] = position;
  //     const nearbySellers = await getNearbySellers(
  //       latitude,
  //       longitude,
  //       radiusMeters
  //     );
  //     setSellers(nearbySellers);
  //   }
  // };

  if (!position) {
    return <div>Loading map...</div>;
  }

  return (
    <>

      <MapContainer center={position} zoom={16} minZoom={15} maxZoom={18} style={{ height: '100dvh', zIndex: 0 }} >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={iconPerson}>
          <Tooltip  >
            You are here
          </Tooltip>
        </Marker>
        {sellers.map((seller) => (
          <Marker
            key={seller.id}
            position={[
              seller.location.coordinates[1],
              seller.location.coordinates[0],
            ]}
            icon={iconBakso}
          >
            <Tooltip>
              {seller.name}
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

          <Button onClick={() => { }} variant='white' size='compact-md'>
            <RefreshCw size={20} />
          </Button>
          <Button color="red" onClick={open} variant='white' size='compact-md'>
            <X size={20} />
          </Button>
        </Stack>
      </div>
      <Drawer position='bottom' opened={opened} onClose={close} withCloseButton={false} withinPortal styles={{
        content: {
          // top radius only
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,

        }
      }}>
        {/* a box shaped as a rounded circular for mobile holding */}
        <div style={{
          width: 42,
          height: 4,

          background: "#DFE2E7",
          borderRadius: 8,

          flex: 'none',
          order: 1,
          flexGrow: 0,
          margin: '16px auto 24px auto',

        }}>
        </div>
        <Stack  >
          <Center>

            <Image src="/confirmation.png" alt="confirmation" w={100} h={100} />
          </Center>
          <Text ta="center">
            Dengan menutup halaman ini, kamu akan keluar dari pantauan Tukang Bakso
          </Text>
          <Button onClick={() => navigate('/auth')} radius="lg" size='md'>
            OK
          </Button>
          <Button onClick={close} radius="lg" variant='outline'  >
            Batal
          </Button>
        </Stack>
      </Drawer >
    </>
  );
}
