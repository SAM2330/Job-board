import api from './axios';

export const getNotifications = () => {
  return api.get('/notifications');
};

export const markNotificationAsRead = (id: string) => {
  return api.put(`/notifications/${id}/read`);
};
