import { Button, Center, Drawer, Image, Stack, Text } from "@mantine/core";
import { useLocationMap } from "../shared/hooks/useLocationMap";
import { LocationMapView } from "../shared/components/LocationMapView";

export const LocationMapPage = () => {
  const {
    opened,
    open,
    close,
    position,
    currentUser,
    nearbyUsers,
    isLoading,
    error,
    userRole,
    refreshUsers,
    handleExit,
  } = useLocationMap();

  return (
    <>
      <LocationMapView
        position={position}
        currentUser={currentUser}
        nearbyUsers={nearbyUsers}
        isLoading={isLoading}
        error={error}
        userRole={userRole}
        onRefresh={refreshUsers}
        onExit={open}
      />

      <Drawer
        position="bottom"
        opened={opened}
        onClose={close}
        withCloseButton={false}
        withinPortal
        offset={8}
        styles={{
          content: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        <div
          style={{
            width: 42,
            height: 4,
            background: "#DFE2E7",
            borderRadius: 8,
            flex: "none",
            order: 1,
            flexGrow: 0,
            margin: "16px auto 24px auto",
          }}
        />
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
          <Button onClick={close} radius="lg" variant="outline">
            Batal
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default LocationMapPage;
