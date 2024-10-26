import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';

export const useNotification = (users: never[]) => {
  useEffect(() => {
    if (users.length) {
      showNotification({
        title: 'New Users Nearby',
        message: 'There are new users near your location.',
      });
    }
  }, [users]);
};
