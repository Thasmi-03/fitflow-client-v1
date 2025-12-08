export type Category = 'dress' | 'shirt' | 'pants' | 'jacket' | 'skirt' | 'top' | 'shorts' | 'suit' | 'blazer' | 'sweater' | 'coat' | 'tshirt' | 'frock' | 'saree' | 'kurta' | 'lehenga' | 'churidar' | 'kurti' | 'gown' | 'salwar suit' | 'anarkali' | 'bridal wear' | 'party wear' | 'crop top & skirt' | 'tops & tunics' | 't-shirt' | 'jean pants' | 'palazzo' | 'leggings' | 'jackets / shrugs' | 'nightwear' | 'maternity wear' | 'abaya / burkha' | 'men\'s shirt' | 'men\'s t-shirt' | 'men\'s trouser' | 'jeans' | 'joggers' | 'hoodies' | 'sweatshirts' | 'sherwani' | 'ethnic wear' | 'kids casual wear' | 'newborn dress';
export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'black' | 'white' | 'gray' | 'brown' | 'pink' | 'purple' | 'orange' | 'beige' | 'navy' | 'maroon' | 'teal' | 'coral' | 'multi';
export type Occasion = 'casual' | 'formal' | 'business' | 'party' | 'wedding' | 'sports' | 'beach';
export type SkinTone = 'fair' | 'light' | 'medium' | 'tan' | 'deep' | 'dark';

export const CATEGORIES: Category[] = ['dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts', 'suit', 'blazer', 'sweater', 'coat', 'tshirt', 'frock', 'saree', 'kurta', 'lehenga', 'churidar', 'kurti', 'gown', 'salwar suit', 'anarkali', 'bridal wear', 'party wear', 'crop top & skirt', 'tops & tunics', 't-shirt', 'jean pants', 'palazzo', 'leggings', 'jackets / shrugs', 'nightwear', 'maternity wear', 'abaya / burkha', 'men\'s shirt', 'men\'s t-shirt', 'men\'s trouser', 'jeans', 'joggers', 'hoodies', 'sweatshirts', 'sherwani', 'ethnic wear', 'kids casual wear', 'newborn dress'];
export const PARTNER_CATEGORIES = CATEGORIES;
export const OCCASIONS: Occasion[] = ['casual', 'formal', 'business', 'party', 'wedding', 'sports', 'beach'];

export interface Cloth {
    _id: string;
    id?: string; // For backward compatibility
    name: string;
    category: string;
    subCategory?: string;
    color: string;
    size?: string;
    price?: number;
    image?: string;
    imageUrl?: string; // For backward compatibility
    description?: string;
    note?: string; // For backward compatibility
    occasion?: string[] | string; // Can be array or string
    gender?: string;
    skinTone?: string;
    age?: string;
    inStock?: boolean;
    partnerId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type Clothes = Cloth;

export interface CreateClothInput {
    name: string;
    category: string;
    subCategory?: string;
    color: string;
    size?: string;
    price?: number;
    image?: string;
    description?: string;
    note?: string;
    occasion?: string[] | string;
    gender?: string;
}

export interface UpdateClothInput extends Partial<CreateClothInput> {
    inStock?: boolean;
}
