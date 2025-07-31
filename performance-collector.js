// Performance Research Data Collector
// Run this in browser console on both deployed sites

function collectPerformanceData() {
    const platform = document.getElementById('platform-info')?.textContent || 'Unknown';
    const url = window.location.href;
    
    // Basic performance metrics
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const data = {
        timestamp: new Date().toISOString(),
        platform: platform,
        url: url,
        
        // Load metrics
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        ttfb: Math.round(navigation.responseStart - navigation.requestStart),
        
        // Paint metrics
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // Memory (if available)
        usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
        totalJSHeapSize: performance.memory?.totalJSHeapSize || 0,
        
        // Connection info
        connectionType: navigator.connection?.effectiveType || 'unknown',
        
        // Current FPS
        currentFPS: document.getElementById('fps-counter')?.textContent || '0',
        
        // Element count
        elementCount: document.getElementById('element-counter')?.textContent || '0',
    };
    
    console.log('=== PERFORMANCE RESEARCH DATA ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('================================');
    
    return data;
}

// Auto-collect data after page load
setTimeout(() => {
    collectPerformanceData();
}, 3000);

// Export function for manual collection
window.collectPerformanceData = collectPerformanceData;
