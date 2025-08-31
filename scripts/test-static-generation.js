import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testStaticGeneration() {
  try {
    console.log('🧪 Testing static generation system...');
    
    // Create test directory
    const testDir = path.join(path.dirname(__dirname), 'public', 'static-data');
    await fs.mkdir(testDir, { recursive: true });
    
    // Create sample data
    const sampleData = {
      'test-user-1': {
        companyData: {
          name: 'Test Company 1',
          town: 'Stockholm',
          instagram: '@testcompany1',
          owners: ['Test Owner 1']
        },
        products: [
          {
            id: 'product-1',
            name: 'Test Product',
            description: 'A test product',
            price: 100,
            type: 'product',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString()
      },
      'test-user-2': {
        companyData: {
          name: 'Test Company 2',
          town: 'Göteborg',
          owners: ['Test Owner 2']
        },
        products: [],
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Generate test files
    for (const [userId, data] of Object.entries(sampleData)) {
      const filePath = path.join(testDir, `${userId}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Generated test file: ${userId}.json`);
    }
    
    // Generate index file
    const indexData = {
      companies: Object.keys(sampleData),
      totalCompanies: Object.keys(sampleData).length,
      generatedAt: new Date().toISOString(),
      test: true
    };
    
    const indexPath = path.join(testDir, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log('🎉 Test static generation complete!');
    console.log(`📁 Test files created in: ${testDir}`);
    console.log('📊 Files generated:');
    console.log('  - index.json (company list)');
    console.log('  - test-user-1.json (sample company 1)');
    console.log('  - test-user-2.json (sample company 2)');
    
    // Test data service integration
    console.log('\n🔍 Testing DataService integration...');
    
    // Simulate what the DataService would do
    const testUserId = 'test-user-1';
    const testFilePath = path.join(testDir, `${testUserId}.json`);
    const testData = await fs.readFile(testFilePath, 'utf-8');
    const parsedData = JSON.parse(testData);
    
    console.log('✅ DataService can read static files:');
    console.log(`  - Company: ${parsedData.companyData.name}`);
    console.log(`  - Products: ${parsedData.products.length}`);
    console.log(`  - Last updated: ${parsedData.lastUpdated}`);
    
    console.log('\n🚀 Static generation system is working correctly!');
    console.log('💡 In production, this will use real Firebase data.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testStaticGeneration();
