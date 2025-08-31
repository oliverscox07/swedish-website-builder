import { UserData } from '../utils/cache';

// Smart caching: Use Firebase for updates, cache for visitors
const isProduction = import.meta.env.PROD;
const isStaticDataAvailable = false; // We'll handle caching manually

export class DataService {
  private static cache = new Map<string, { data: UserData; timestamp: number }>();
  private static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for visitors

  static async getWebsiteData(userId: string): Promise<UserData | null> {
    // Check cache first - serve cached data to visitors
    const cached = this.cache.get(userId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('Serving cached data for visitor (no Firebase read)');
      return cached.data;
    }

    // If no cached data, return null - don't fetch from Firebase for visitors
    console.log('No cached data available, returning null (no Firebase read)');
    return null;
  }

  static async getWebsiteDataBySlug(slug: string): Promise<UserData | null> {
    // Check cache first - serve cached data to visitors
    const cached = this.cache.get(slug);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('Serving cached data for visitor (by slug, no Firebase read)');
      return cached.data;
    }

    // If no cached data, return null - don't fetch from Firebase for visitors
    console.log('No cached data available for slug, returning null (no Firebase read)');
    return null;
  }

  private static async fetchFromStaticFiles(userId: string): Promise<UserData | null> {
    try {
      const response = await fetch(`/static-data/${userId}.json`);
      
      if (!response.ok) {
        return null;
      }

      const staticData = await response.json();
      
      return {
        companyData: staticData.companyData,
        products: staticData.products
      };
    } catch (error) {
      console.log('Static data not available, falling back to Firebase');
      return null;
    }
  }

  private static async fetchFromFirebase(userId: string): Promise<UserData | null> {
    try {
      const { db } = await import('../config/firebase');
      const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.companyData) {
          // Fetch products from subcollection
          const productsRef = collection(db, 'users', userId, 'products');
          const productsSnapshot = await getDocs(productsRef);
          
          const products: any[] = [];
          productsSnapshot.forEach((doc) => {
            const productData = doc.data();
            products.push({
              id: productData.id || doc.id,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              type: productData.type,
              imageUrl: productData.imageUrl,
              createdAt: productData.createdAt?.toDate() || new Date(),
              updatedAt: productData.updatedAt?.toDate() || new Date()
            });
          });
          
          return {
            companyData: data.companyData,
            products: products
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching from Firebase:', error);
      return null;
    }
  }

  private static async fetchFromStaticFilesBySlug(slug: string): Promise<UserData | null> {
    try {
      // First get the index to find the userId for this slug
      const indexResponse = await fetch('/static-data/index.json');
      if (!indexResponse.ok) {
        return null;
      }
      
      const indexData = await indexResponse.json();
      
      // Find the user with matching slug
      for (const userId of indexData.companies || []) {
        const response = await fetch(`/static-data/${userId}.json`);
        if (response.ok) {
          const data = await response.json();
          if (data.companyData?.slug === slug) {
            return {
              companyData: data.companyData,
              products: data.products
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log('Static data not available for slug, falling back to Firebase');
      return null;
    }
  }

  private static async fetchFromFirebaseBySlug(slug: string): Promise<UserData | null> {
    try {
      const { db } = await import('../config/firebase');
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      
      // Query users collection to find the one with matching slug
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('companyData.slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userId = doc.id;
        const data = doc.data();
        
        if (data.companyData) {
          // Fetch products from subcollection
          const productsRef = collection(db, 'users', userId, 'products');
          const productsSnapshot = await getDocs(productsRef);
          
          const products: any[] = [];
          productsSnapshot.forEach((productDoc) => {
            const productData = productDoc.data();
            products.push({
              id: productData.id || productDoc.id,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              type: productData.type,
              imageUrl: productData.imageUrl,
              createdAt: productData.createdAt?.toDate() || new Date(),
              updatedAt: productData.updatedAt?.toDate() || new Date()
            });
          });
          
          return {
            companyData: data.companyData,
            products: products
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching from Firebase by slug:', error);
      return null;
    }
  }

  private static async checkForOldSlug(oldSlug: string): Promise<UserData | null> {
    try {
      const { db } = await import('../config/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      
      // Get all users and check if any have this as an old slug
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      for (const doc of querySnapshot.docs) {
        const userId = doc.id;
        const data = doc.data();
        if (data.companyData && data.oldSlugs) {
          // Check if this user has the old slug in their redirect list
          if (data.oldSlugs.includes(oldSlug)) {
            // Fetch products from subcollection
            const productsRef = collection(db, 'users', userId, 'products');
            const productsSnapshot = await getDocs(productsRef);
            
            const products: any[] = [];
            productsSnapshot.forEach((productDoc) => {
              const productData = productDoc.data();
              products.push({
                id: productData.id || productDoc.id,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                type: productData.type,
                imageUrl: productData.imageUrl,
                createdAt: productData.createdAt?.toDate() || new Date(),
                updatedAt: productData.updatedAt?.toDate() || new Date()
              });
            });
            
            return {
              companyData: data.companyData,
              products: products
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for old slug:', error);
      return null;
    }
  }

  static async getAllCompanies(): Promise<string[]> {
    try {
      if (isStaticDataAvailable) {
        const response = await fetch('/static-data/index.json');
        if (response.ok) {
          const indexData = await response.json();
          return indexData.companies || [];
        }
      }
      
      // Fallback: return empty array (could implement Firebase fallback if needed)
      return [];
    } catch (error) {
      console.error('Error fetching companies index:', error);
      return [];
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static clearUserCache(userId: string): void {
    this.cache.delete(userId);
  }

  static clearCacheBySlug(slug: string): void {
    this.cache.delete(slug);
  }
}
