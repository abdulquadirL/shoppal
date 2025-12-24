import axios from "axios";

export const acceptOrder = (orderId: string) =>
  axios.post(`/api/orders/${orderId}/accept`);

export const rejectOrder = (orderId: string) =>
  axios.post(`/api/orders/${orderId}/reject`);
