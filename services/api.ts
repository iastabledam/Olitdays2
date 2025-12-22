// This file serves as the bridge between the frontend and the backend.
import { MOCK_PROPERTIES, MOCK_RESERVATIONS, MOCK_TASKS, MOCK_LAUNDRY_ORDERS } from '../constants';

// --- CONFIGURATION ---
// Set this to FALSE to attempt connecting to the local Node.js server (server.js)
// Set this to TRUE to use the static browser-side mocks (Demo mode)
export const USE_MOCK = true; 

export const API_URL = 'http://localhost:3000/api';

export const api = {
  properties: {
    list: async () => {
      if (USE_MOCK) return Promise.resolve(MOCK_PROPERTIES);
      try {
        const res = await fetch(`${API_URL}/properties`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
      } catch (e) {
        console.warn("Backend unreachable, falling back to mock", e);
        return Promise.resolve(MOCK_PROPERTIES);
      }
    }
  },
  reservations: {
    list: async () => {
      if (USE_MOCK) return Promise.resolve(MOCK_RESERVATIONS);
      try {
        const res = await fetch(`${API_URL}/reservations`);
        return await res.json();
      } catch (e) {
        return Promise.resolve(MOCK_RESERVATIONS);
      }
    }
  },
  tasks: {
    list: async () => {
      if (USE_MOCK) return Promise.resolve(MOCK_TASKS);
      try {
         const res = await fetch(`${API_URL}/tasks`);
         return await res.json();
      } catch (e) {
         return Promise.resolve(MOCK_TASKS);
      }
    }
  },
  laundry: {
    orders: async () => {
      if (USE_MOCK) return Promise.resolve(MOCK_LAUNDRY_ORDERS);
      try {
        const res = await fetch(`${API_URL}/laundry/orders`);
        return await res.json();
      } catch (e) {
        return Promise.resolve(MOCK_LAUNDRY_ORDERS);
      }
    }
  },
  auth: {
    // This is how you would trigger the real OAuth flow from the frontend
    connectChannel: async (platform: string) => {
      if (USE_MOCK) return { url: '#' }; // Mock just opens modal
      const res = await fetch(`http://localhost:3000/auth/${platform}/connect`);
      return res.json(); // Returns { url: 'https://airbnb.com/oauth...' }
    }
  }
};