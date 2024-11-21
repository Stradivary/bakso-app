import { User } from "@/models/BroadcastMapModel";
import { useLocation } from "@/viewmodels/hooks/useLocation";
import { useBroadcastMapViewModel } from "@/viewmodels/useBroadcastMapViewModel";
import { ActionButtons } from "@/views/components/ActionButtons";
import { Dialog } from "@/views/components/Dialog";
import { ExitConfirmationDialog } from "@/views/components/ExitConfirmationDialog";
import {
  MapUpdater,
  NearbyUsersMarker,
  UserMarker,
} from "@/views/components/MapUpdater";
import { Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications as notify } from "@mantine/notifications";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

const useOrderConfirmationModal = ({
  sendPing,
}: {
  sendPing: (userId: string) => void;
}) => {
  const open = ({
    nearbyUser,
    estimatedTimeInMinutes,
  }: {
    nearbyUser: User;
    estimatedTimeInMinutes: number;
  }) =>
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
        sendPing(nearbyUser.user_id);
        notify.show({
          title: "Pesan Bakso",
          message: "Pesan bakso telah dikirim",
          color: "blue",
        });
      },
    });

  return {
    open,
  };
};

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

  const { open } = useOrderConfirmationModal({ sendPing });

  const handleMarkerClickWrapper = (nearbyUser: User) => {
    const result = handleMarkerClick(nearbyUser);
    if (result) {
      open(result);
    }
  };

  if (!location) {
    return (
      <div>
        <Text>Memuat lokasi anda...</Text>
      </div>
    );
  }

  return (
    <>
      <MapContainer
        key={location.toString()}
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
          handleMarkerClick={handleMarkerClickWrapper}
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
