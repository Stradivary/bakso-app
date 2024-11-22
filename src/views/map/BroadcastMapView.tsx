import { User } from "@/models/BroadcastMapModel";
import { useLocation } from "@/viewmodels/hooks/useLocation";
import {
  useBroadcastMapViewModel,
  useOrderConfirmationModal,
} from "@/viewmodels/useBroadcastMapViewModel";
import { ActionButtons } from "@/views/components/ActionButtons";
import { Dialog } from "@/views/components/Dialog";
import { ExitConfirmationDialog } from "@/views/components/ExitConfirmationDialog";
import {
  MapUpdater,
  NearbyUsersMarker,
  UserMarker,
} from "@/views/components/MapUpdater";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import React, { FC } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

const PingModal: FC<{
  nearbyUser: any;
  estimatedTimeInMinutes: number;
}> = ({ nearbyUser, estimatedTimeInMinutes }: any) => (
  <Stack gap={4}>
    <Text size="sm">
      🍜 Apakah Anda ingin memesan bakso dari {nearbyUser.userName}?
    </Text>
    <Text size="xs" c="dimmed">
      Estimasi waktu: {estimatedTimeInMinutes} menit berjalan kaki
    </Text>
  </Stack>
);

const BroadcastMapView: React.FC = () => {
  const { location } = useLocation();
  const {
    centerLocation,
    exitModalClose,
    exitModalOpened,
    fixedLocation,
    handleExit,
    handleLocationUpdate,
    handleMarkerClick,
    handleRecenter,
    nearbyUsers,
    notifications,
    openModal,
    sendPing,
    setMapRef,
    userId,
    userName,
    userRole,
  } = useBroadcastMapViewModel(location);

  const { open } = useOrderConfirmationModal({
    sendPing,
    children: PingModal,
  });

  const handleClick = (nearbyUser: User) => {
    const result = handleMarkerClick(nearbyUser);
    if (result) {
      open(result);
    }
  };

  return (
    <>
      <LoadingOverlay visible={!location} />
      <MapContainer
        key={`${location?.toString()}-map`}
        ref={(map) => setMapRef(map)}
        center={centerLocation}
        zoom={16}
        minZoom={13}
        maxZoom={18}
        style={{ height: "100dvh", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater
          userId={userId}
          userRole={userRole}
          updateLocation={handleLocationUpdate}
        />

        <UserMarker location={fixedLocation} userRole={userRole} />

        <NearbyUsersMarker
          nearbyUsers={nearbyUsers}
          handleMarkerClick={handleClick}
        />
      </MapContainer>

      <ActionButtons
        name={userName}
        role={userRole}
        onExit={openModal}
        notifications={notifications}
        onRecenter={handleRecenter}
      />

      <Dialog opened={exitModalOpened} close={exitModalClose}>
        <ExitConfirmationDialog
          role={userRole}
          handleExit={handleExit}
          exitModalClose={exitModalClose}
        />
      </Dialog>
    </>
  );
};

export default BroadcastMapView;
