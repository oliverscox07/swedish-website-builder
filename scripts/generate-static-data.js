import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config (same as in your app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generateStaticData() {
  try {
    console.log('🔄 Starting static data generation...');
    
    // Validate Firebase config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Firebase configuration is missing. Please check your environment variables.');
    }
    
    // Create public directory if it doesn't exist
    const publicDir = path.join(path.dirname(__dirname), 'public', 'static-data');
    await fs.mkdir(publicDir, { recursive: true });
    
    console.log('📡 Fetching data from Firebase...');
    
    // Fetch all users with company data
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const staticData = {};
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      // Only include users with company data
      if (userData.companyData) {
        // Ensure slug exists
        const companyData = userData.companyData;
        if (!companyData.slug) {
          const baseSlug = companyData.name.toLowerCase()
            .replace(/[åäö]/g, (match) => {
              const replacements = { 'å': 'a', 'ä': 'a', 'ö': 'o' };
              return replacements[match];
            })
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          // For static generation, we'll use base slug since we can't check uniqueness
          // The actual uniqueness check happens during company setup
          companyData.slug = baseSlug;
        }
        
        // Fetch products from subcollection
        const productsRef = collection(db, 'users', userId, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        const products = [];
        productsSnapshot.forEach((productDoc) => {
          const productData = productDoc.data();
          products.push({
            id: productData.id || productDoc.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            type: productData.type,
            imageUrl: productData.imageUrl,
            createdAt: productData.createdAt?.toDate?.() || new Date(),
            updatedAt: productData.updatedAt?.toDate?.() || new Date()
          });
        });
        
        staticData[userId] = {
          companyData: companyData,
          products: products,
          lastUpdated: new Date().toISOString()
        };
      }
    }
    
    // Generate individual files for each company
    for (const [userId, data] of Object.entries(staticData)) {
      const filePath = path.join(publicDir, `${userId}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Generated static data for company: ${userId}`);
    }
    
    // Generate index file with all companies
    const indexData = {
      companies: Object.keys(staticData),
      totalCompanies: Object.keys(staticData).length,
      generatedAt: new Date().toISOString()
    };
    
    const indexPath = path.join(publicDir, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log(`🎉 Static data generation complete! Generated data for ${indexData.totalCompanies} companies`);
    console.log(`📁 Files saved to: ${publicDir}`);
    
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

// Run the script
generateStaticData();
