
import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered successfully: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              console.log('SW update found');
            });
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      });
      
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from SW:', event.data);
      });
    } else {
      console.log('Service workers are not supported in this browser');
    }
  }, []);
};
