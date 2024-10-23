import { SegmentedControl } from '@mantine/core';
import React from 'react';
import ListView from '../components/ListView';
import MapView from '../components/MapView';
import { useNearbyUsers } from '../hooks/useNearbyUsers';

export const MainPage: React.FC = () => {
  const [view, setView] = React.useState<'map' | 'list'>('map');
  const users = useNearbyUsers();

  return (
    <div>
      <SegmentedControl
        value={view}
        onChange={(value) => setView(value as 'map' | 'list')}
        data={[
          { label: 'Map View', value: 'map' },
          { label: 'List View', value: 'list' },
        ]}
      />
      {view === 'map' ? <MapView users={users} /> : <ListView users={users} />}
    </div>
  );
};  