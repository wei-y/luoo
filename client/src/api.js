import axios from 'axios';

// Use relative path to leverage Vite proxy in dev and same-origin in prod
const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getJournals = async (page = 1, limit = 9, tags = []) => {
    const params = { page, limit };
    if (tags && tags.length > 0) {
        params.tags = tags.join(',');
    }
    const response = await api.get('/journals', { params });
    return response.data;
};

export const getJournalById = async (id) => {
    const response = await api.get(`/journals/${id}`);
    return response.data;
};

export const getSongsByJournalId = async (id) => {
    const response = await api.get(`/journals/${id}/songs`);
    return response.data;
};

export const getTags = async () => {
    const response = await api.get(`/tags`);
    return response.data;
};

export const getJournalsByTagId = async (tagId, page = 1, limit = 12) => {
    const response = await api.get(`/tags/${tagId}/journals`, { params: { page, limit } });
    return response.data;
};

export default api;
