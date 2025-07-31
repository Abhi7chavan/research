// Test script to insert sample data into the database
async function insertTestData() {
    try {
        // Test performance data
        const testPerformanceData = {
            platform: 'Railway',
            loadTime: 1234,
            ttfb: 567,
            isColdStart: true,
            memoryUsage: 45,
            fpsAverage: 58,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'test_session_' + Date.now()
        };

        console.log('Inserting test performance data...');
        const perfResponse = await fetch('/api/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPerformanceData)
        });
        
        const perfResult = await perfResponse.json();
        console.log('Performance data result:', perfResult);

        // Test interaction data
        const testInteractionData = {
            sessionId: testPerformanceData.sessionId,
            action: 'test_action',
            data: { message: 'This is test data', timestamp: new Date().toISOString() }
        };

        console.log('Inserting test interaction data...');
        const intResponse = await fetch('/api/interaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testInteractionData)
        });
        
        const intResult = await intResponse.json();
        console.log('Interaction data result:', intResult);

        console.log('✅ Test data inserted successfully!');
        console.log('🔍 Check your Railway PostgreSQL database now');

    } catch (error) {
        console.error('❌ Error inserting test data:', error);
    }
}

// Add a button to the page to manually trigger test data insertion
function addTestButton() {
    const button = document.createElement('button');
    button.textContent = 'Insert Test Data';
    button.className = 'fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50 hover:bg-green-700';
    button.onclick = insertTestData;
    document.body.appendChild(button);
}

// Add the test button when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton);
} else {
    addTestButton();
}

// Also make the function available globally
window.insertTestData = insertTestData;
