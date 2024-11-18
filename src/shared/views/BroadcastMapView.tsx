import { Text } from "@mantine/core";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ActionButtons } from "../components/ActionButtons";
import { Dialog } from "../components/Dialog";
import { ExitConfirmationDialog } from "../components/ExitConfirmationDialog";
import {
  MapUpdater,
  NearbyUsersMarker,
  UserMarker,
} from "../components/MapUpdater";
import { useBroadcastMapViewModel } from "../viewModels/useBroadcastMapViewModel";

const BroadcastMapView: React.FC = () => {
  const {
    userName,
    userRole,
    location,
    nearbyUsers,
    handleLocationUpdate,
    notifications,
    exitModalOpened,
    openModal,
    exitModalClose,
    handleRecenter,
    handleExit,
    handleMarkerClick,
    userId,
    setMapRef,
    centerLocation,
  } = useBroadcastMapViewModel();

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
          disabled={userRole !== "seller"}
          userId={userId}
          userRole={userRole}
          updateLocation={handleLocationUpdate}
        />

        <UserMarker location={location} userRole={userRole} />

        <NearbyUsersMarker
          nearbyUsers={nearbyUsers}
          handleMarkerClick={handleMarkerClick}
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
