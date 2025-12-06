import apiClient from '@/lib/apiClient';

export interface Occasion {
    _id: string;
    userId: string;
    title: string;
    type: string;
    date: string;
    location?: string;
    dressCode?: string;
    notes?: string;
    skinTone?: string;
    clothesList: string[];
    createdAt: string;
}

export interface CreateOccasionInput {
    title: string;
    type: string;
    date: string;
    location?: string;
    dressCode?: string;
    notes?: string;
    skinTone?: string;
    clothesList?: string[];
}

export interface UpdateOccasionInput extends Partial<CreateOccasionInput> { }

// Get all occasions
export const getOccasions = async (): Promise<{ data: Occasion[] }> => {
    const response = await apiClient.get('/occasion');
    return response.data;
};

// Get occasion by ID
export const getOccasionById = async (id: string): Promise<{ occasion: Occasion }> => {
    const response = await apiClient.get(`/occasion/${id}`);
    return response.data;
};

// Create occasion
export const createOccasion = async (data: CreateOccasionInput): Promise<{ occasion: Occasion }> => {
    const response = await apiClient.post('/occasion', data);
    return response.data;
};

// Update occasion
export const updateOccasion = async (id: string, data: UpdateOccasionInput): Promise<{ occasion: Occasion }> => {
    const response = await apiClient.put(`/occasion/${id}`, data);
    return response.data;
};

// Delete occasion
export const deleteOccasion = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/occasion/${id}`);
    return response.data;
};

// Get suggestions for an occasion
export const getOccasionSuggestions = async (id: string): Promise<{
    suggestions: any[];
    occasion: { title: string; type: string; date: string };
    userGender: string
}> => {
    const response = await apiClient.get(`/occasion/${id}/suggestions`);
    return response.data;
};
