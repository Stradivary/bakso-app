import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { User } from '../models/user.ts';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  users?: User[];
}

const MapView: React.FC<MapViewProps> = ({ users = [] }) => {

  const position = users.length
    ? [users[0].location.latitude, users[0].location.longitude]
    : [0, 0];
    
  return (
    <MapContainer center={position as [number, number]} zoom={13} style={{ height: '100vh' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {users.map((user) => (
        <Marker
          key={user.id}
          position={[user.location.latitude, user.location.longitude] as [number, number]}
        >
          <Popup>{user.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
