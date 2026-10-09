export interface User {
  id: string;
  name: string;
  email: string;
  usn: string;
  branch: string;
  phone: string;
  hostelBlock?: string;
  avatar?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'Textbooks & Notes' | 'Tech & Electronics' | 'Hostel & Living' | 'Cycles & Mobility' | 'Lab Uniform & Drafters' | 'Sports & Fitness';
  condition: 'Like New' | 'Good' | 'Fair';
  imageUrl: string;
  status: 'active' | 'sold';
  sellerId: string;
  sellerName: string;
  sellerUsn: string;
  sellerBranch: string;
  sellerPhone: string;
  campusLocation: string;
  pincodeVerified?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = [
  'All',
  'Textbooks & Notes',
  'Tech & Electronics',
  'Hostel & Living',
  'Cycles & Mobility',
  'Lab Uniform & Drafters',
  'Sports & Fitness'
] as const;

export type CategoryType = typeof CATEGORIES[number];
