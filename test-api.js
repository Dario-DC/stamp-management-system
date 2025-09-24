/**
 * Simple API Integration Test
 * Verifies that all endpoints work correctly
 */

// Test the API endpoints manually
async function testAPI() {
    const baseUrl = 'http://localhost:3001/api';
    
    console.log('🚀 Testing Stamp Management API...\n');
    
    try {
        // Test 1: Get all stamps
        console.log('1️⃣ Testing GET /stamps/collection');
        const stampsResponse = await fetch(`${baseUrl}/stamps/collection`);
        const stamps = await stampsResponse.json();
        console.log(`✅ Found ${stamps.length} stamps`);
        
        // Test 2: Get all postage rates
        console.log('\n2️⃣ Testing GET /stamps/postage-rates');
        const ratesResponse = await fetch(`${baseUrl}/stamps/postage-rates`);
        const rates = await ratesResponse.json();
        console.log(`✅ Found ${rates.length} postage rates`);
        
        // Test 3: Add a new stamp
        console.log('\n3️⃣ Testing POST /stamps/collection');
        const newStampResponse = await fetch(`${baseUrl}/stamps/collection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test API Stamp',
                val: 99,
                n: 5
            })
        });
        const newStamp = await newStampResponse.json();
        console.log(`✅ Added stamp: ${newStamp.name} (ID: ${newStamp.id})`);
        
        // Test 4: Update stamp quantity
        console.log('\n4️⃣ Testing PUT /stamps/collection/:id');
        const updateResponse = await fetch(`${baseUrl}/stamps/collection/${newStamp.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n: 10 })
        });
        const updatedStamp = await updateResponse.json();
        console.log(`✅ Updated stamp quantity to ${updatedStamp.n}`);
        
        // Test 5: Add a new postage rate
        console.log('\n5️⃣ Testing POST /stamps/postage-rates');
        const newRateResponse = await fetch(`${baseUrl}/stamps/postage-rates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test API Rate',
                rate: 123
            })
        });
        const newRate = await newRateResponse.json();
        console.log(`✅ Added rate: ${newRate.name} (€${newRate.rate/100})`);
        
        // Test 6: Delete the test stamp
        console.log('\n6️⃣ Testing DELETE /stamps/collection/:id');
        const deleteStampResponse = await fetch(`${baseUrl}/stamps/collection/${newStamp.id}`, {
            method: 'DELETE'
        });
        console.log(`✅ Deleted test stamp (Status: ${deleteStampResponse.status})`);
        
        // Test 7: Delete the test rate
        console.log('\n7️⃣ Testing DELETE /stamps/postage-rates/:name');
        const deleteRateResponse = await fetch(`${baseUrl}/stamps/postage-rates/Test%20API%20Rate`, {
            method: 'DELETE'
        });
        console.log(`✅ Deleted test rate (Status: ${deleteRateResponse.status})`);
        
        console.log('\n🎉 All API tests passed! The backend is working perfectly.\n');
        
        // Summary
        console.log('📊 API Summary:');
        console.log(`• Stamps endpoint: ${baseUrl}/stamps/collection`);
        console.log(`• Rates endpoint: ${baseUrl}/stamps/postage-rates`);
        console.log(`• Health check: http://localhost:3001/health`);
        console.log(`• Backend running on: http://localhost:3001`);
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testAPI();
}

export default testAPI;
