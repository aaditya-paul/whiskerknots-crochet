export enum Page {
  HOME = 'HOME',
  SHOP = 'SHOP',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Amigurumi' | 'Wearables' | 'Decor';
  image: string;
  description: string;
  isFeatured?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}
