import { VITE_API_URL } from "../../config";

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const notificationService = {
  // Obtiene notificaciones del usuario
  getNotifications: async (limit = 20, unreadOnly = false) => {
    try {
      const response = await fetch(
        `${VITE_API_URL}/notifications?limit=${limit}&unreadOnly=${unreadOnly}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Marca todas como leídas
  markAllAsRead: async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  // Marca una notificación como leída
  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${VITE_API_URL}/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isRead: true })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Elimina notificación
  deleteNotification: async (notificationId) => {
    try {
      const response = await fetch(`${VITE_API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};