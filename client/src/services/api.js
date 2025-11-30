import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getSlots = async (date) => {
    const response = await api.get(`/appointments/slots?date=${date}`);
    return response.data;
};

export const bookAppointment = async (data) => {
    const response = await api.post('/appointments/book', data);
    return response.data;
};

export const cancelAppointment = async (id) => {
    const response = await api.delete(`/appointments/cancel/${id}`);
    return response.data;
};

export default api;
