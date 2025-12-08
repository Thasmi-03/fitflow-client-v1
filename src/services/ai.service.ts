import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const aiService = {
    getSuggestions: async (skinTone: string) => {
        const token = Cookies.get('token');
        const response = await axios.post(
            `${API_URL}/ai/suggestions`,
            { skinTone },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    },

    detectSkinTone: async (imageUrl: string) => {
        const token = Cookies.get('token');
        const response = await axios.post(
            `${API_URL}/ai/detect-skin-tone`,
            { imageUrl },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    },
};
