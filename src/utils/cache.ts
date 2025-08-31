interface CompanyData {
  name: string;
  town: string;
  description?: string;
  swishNumber?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  owners: string[];
  slug?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'service';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  companyData: CompanyData;
  products: Product[];
}

// Global cache to store website data
const websiteDataCache = new Map<string, { data: UserData; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds for faster updates

export const getCachedWebsiteData = (userId: string): UserData | null => {
  const cachedData = websiteDataCache.get(userId);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData.data;
  }
  
  return null;
};

export const setCachedWebsiteData = (userId: string, data: UserData): void => {
  websiteDataCache.set(userId, { data, timestamp: Date.now() });
};

export const clearCache = (): void => {
  websiteDataCache.clear();
};

export const clearUserCache = (userId: string): void => {
  websiteDataCache.delete(userId);
};
