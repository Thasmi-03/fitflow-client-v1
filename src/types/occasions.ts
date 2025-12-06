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
