// Enhanced Performance Monitor for Accurate Metrics
class AccuratePerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
        this.observer = null;
        this.setupObservers();
    }

    setupObservers() {
        // Performance Observer for accurate metrics
        if ('PerformanceObserver' in window) {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processEntry(entry);
                }
            });

            // Observe all performance entry types
            try {
                this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
            } catch (e) {
                console.warn('Some performance observers not supported:', e);
            }
        }
    }

    processEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                this.metrics.navigation = {
                    domContentLoaded: Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
                    loadComplete: Math.round(entry.loadEventEnd - entry.loadEventStart),
                    ttfb: Math.round(entry.responseStart - entry.fetchStart),
                    dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
                    tcp: Math.round(entry.connectEnd - entry.connectStart),
                    request: Math.round(entry.responseEnd - entry.requestStart),
                    response: Math.round(entry.responseEnd - entry.responseStart),
                    domProcessing: Math.round(entry.domContentLoadedEventStart - entry.responseEnd)
                };
                break;

            case 'paint':
                if (entry.name === 'first-paint') {
                    this.metrics.firstPaint = Math.round(entry.startTime);
                } else if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = Math.round(entry.startTime);
                }
                break;

            case 'largest-contentful-paint':
                this.metrics.largestContentfulPaint = Math.round(entry.startTime);
                break;

            case 'first-input':
                this.metrics.firstInputDelay = Math.round(entry.processingStart - entry.startTime);
                break;

            case 'layout-shift':
                this.metrics.cumulativeLayoutShift = (this.metrics.cumulativeLayoutShift || 0) + entry.value;
                break;
        }
    }

    detectPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('onrender.com')) return 'Render';
        if (hostname.includes('railway.app')) return 'Railway';
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) return 'Local';
        return 'Unknown';
    }

    detectColdStart() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return { isColdStart: false, ttfb: 0 };

        const ttfb = Math.round(navigation.responseStart - navigation.fetchStart);
        const isColdStart = ttfb > 2000; // Cold start if TTFB > 2 seconds

        return { isColdStart, ttfb };
    }

    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        } : null;
    }

    getMemoryInfo() {
        if (performance.memory) {
            return {
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
            };
        }
        return null;
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            language: navigator.language,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            }
        };
    }

    async getDetailedMetrics() {
        // Wait for navigation to complete
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });

        // Wait a bit more for paint metrics
        await new Promise(resolve => setTimeout(resolve, 1000));

        const coldStart = this.detectColdStart();
        const platform = this.detectPlatform();

        const detailedMetrics = {
            // Basic Info
            timestamp: new Date().toISOString(),
            platform: platform,
            url: window.location.href,
            
            // Performance Metrics
            ...this.metrics,
            
            // Cold Start Detection
            isColdStart: coldStart.isColdStart,
            coldStartTTFB: coldStart.ttfb,
            
            // Resource Timing
            resourceCount: performance.getEntriesByType('resource').length,
            
            // Memory Info
            memory: this.getMemoryInfo(),
            
            // Network Info
            network: this.getNetworkInfo(),
            
            // Device Info
            device: this.getDeviceInfo(),
            
            // Page Load Time
            totalLoadTime: Math.round(performance.now() - this.startTime)
        };

        return detailedMetrics;
    }

    displayMetrics(metrics) {
        console.group('🔍 DETAILED PERFORMANCE METRICS');
        console.log('Platform:', metrics.platform);
        console.log('Cold Start:', metrics.isColdStart ? `YES (${metrics.coldStartTTFB}ms TTFB)` : 'NO');
        
        // AI Website Builder Hosting Score
        const hostingScore = this.calculateHostingScore(metrics);
        console.log('🏗️ AI Hosting Score:', `${hostingScore.total}/100`);
        
        if (metrics.navigation) {
            console.group('⏱️ Navigation Timing');
            console.log('DNS Lookup:', metrics.navigation.dns + 'ms');
            console.log('TCP Connection:', metrics.navigation.tcp + 'ms');
            console.log('Time to First Byte:', metrics.navigation.ttfb + 'ms');
            console.log('Response Time:', metrics.navigation.response + 'ms');
            console.log('DOM Processing:', metrics.navigation.domProcessing + 'ms');
            console.log('DOM Content Loaded:', metrics.navigation.domContentLoaded + 'ms');
            console.log('Load Complete:', metrics.navigation.loadComplete + 'ms');
            console.groupEnd();
        }

        console.group('🎨 Paint Metrics');
        console.log('First Paint:', (metrics.firstPaint || 'N/A') + 'ms');
        console.log('First Contentful Paint:', (metrics.firstContentfulPaint || 'N/A') + 'ms');
        console.log('Largest Contentful Paint:', (metrics.largestContentfulPaint || 'N/A') + 'ms');
        console.groupEnd();

        if (metrics.firstInputDelay !== undefined) {
            console.log('⚡ First Input Delay:', metrics.firstInputDelay + 'ms');
        }

        if (metrics.cumulativeLayoutShift !== undefined) {
            console.log('📐 Cumulative Layout Shift:', metrics.cumulativeLayoutShift.toFixed(3));
        }

        if (metrics.memory) {
            console.group('💾 Memory Usage');
            console.log('Used Heap:', metrics.memory.usedJSHeapSize + 'MB');
            console.log('Total Heap:', metrics.memory.totalJSHeapSize + 'MB');
            console.groupEnd();
        }

        if (metrics.network) {
            console.group('🌐 Network Info');
            console.log('Connection Type:', metrics.network.effectiveType);
            console.log('Downlink Speed:', metrics.network.downlink + 'Mbps');
            console.log('Round Trip Time:', metrics.network.rtt + 'ms');
            console.groupEnd();
        }

        console.group('🏗️ AI Hosting Evaluation');
        console.log('Cold Start Impact:', hostingScore.coldStart + '/25 points');
        console.log('Performance Score:', hostingScore.performance + '/25 points');
        console.log('Scalability Score:', hostingScore.scalability + '/25 points');
        console.log('User Experience:', hostingScore.userExperience + '/25 points');
        console.groupEnd();

        console.log('📊 Total Load Time:', metrics.totalLoadTime + 'ms');
        console.log('🔗 Resource Count:', metrics.resourceCount);
        console.groupEnd();

        return metrics;
    }

    calculateHostingScore(metrics) {
        const scores = {
            coldStart: 0,
            performance: 0,
            scalability: 0,
            userExperience: 0
        };

        // Cold Start Score (25 points)
        if (metrics.isColdStart) {
            if (metrics.coldStartTTFB < 3000) scores.coldStart = 20;
            else if (metrics.coldStartTTFB < 5000) scores.coldStart = 15;
            else if (metrics.coldStartTTFB < 10000) scores.coldStart = 10;
            else scores.coldStart = 5;
        } else {
            scores.coldStart = 25; // No cold start = perfect score
        }

        // Performance Score (25 points)
        const ttfb = metrics.navigation?.ttfb || 0;
        if (ttfb < 200) scores.performance = 25;
        else if (ttfb < 500) scores.performance = 20;
        else if (ttfb < 1000) scores.performance = 15;
        else if (ttfb < 2000) scores.performance = 10;
        else scores.performance = 5;

        // Scalability Score (25 points) - Based on memory efficiency
        const memoryUsed = metrics.memory?.usedJSHeapSize || 0;
        if (memoryUsed < 20) scores.scalability = 25;
        else if (memoryUsed < 50) scores.scalability = 20;
        else if (memoryUsed < 100) scores.scalability = 15;
        else if (memoryUsed < 200) scores.scalability = 10;
        else scores.scalability = 5;

        // User Experience Score (25 points) - Based on FCP and LCP
        const fcp = metrics.firstContentfulPaint || 0;
        const lcp = metrics.largestContentfulPaint || 0;
        
        let uxScore = 0;
        if (fcp < 1000) uxScore += 12;
        else if (fcp < 2000) uxScore += 8;
        else if (fcp < 3000) uxScore += 5;
        else uxScore += 2;

        if (lcp < 2000) uxScore += 13;
        else if (lcp < 4000) uxScore += 9;
        else if (lcp < 6000) uxScore += 5;
        else uxScore += 2;

        scores.userExperience = uxScore;

        const total = scores.coldStart + scores.performance + scores.scalability + scores.userExperience;

        return {
            ...scores,
            total: Math.round(total)
        };
    }

    startContinuousMonitoring() {
        // Monitor FPS
        let frameCount = 0;
        let lastTime = performance.now();
        
        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                const fpsElement = document.getElementById('fps-counter');
                if (fpsElement) {
                    fpsElement.textContent = `FPS: ${fps}`;
                    fpsElement.style.color = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';
                }
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();

        // Monitor memory usage
        setInterval(() => {
            const memory = this.getMemoryInfo();
            if (memory) {
                const memoryElement = document.getElementById('memory-usage');
                if (memoryElement) {
                    memoryElement.textContent = `Memory: ${memory.usedJSHeapSize}MB`;
                    memoryElement.style.color = memory.usedJSHeapSize > 100 ? '#ef4444' : '#fbbf24';
                }
            }
        }, 2000);

        // Update platform info
        const platformElement = document.getElementById('platform-info');
        if (platformElement) {
            platformElement.textContent = `Platform: ${this.detectPlatform()}`;
        }
    }
}

// Initialize performance monitor
const performanceMonitor = new AccuratePerformanceMonitor();

// Auto-run detailed analysis after page load
window.addEventListener('load', async () => {
    // Start continuous monitoring
    performanceMonitor.startContinuousMonitoring();
    
    // Get detailed metrics after everything loads
    setTimeout(async () => {
        try {
            const metrics = await performanceMonitor.getDetailedMetrics();
            performanceMonitor.displayMetrics(metrics);
            
            // Store for research
            window.latestPerformanceMetrics = metrics;
            
            // Show cold start indicator if detected
            if (metrics.isColdStart) {
                const indicator = document.createElement('div');
                indicator.className = 'fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 animate-pulse';
                indicator.innerHTML = `❄️ Cold Start Detected<br>TTFB: ${metrics.coldStartTTFB}ms`;
                document.body.appendChild(indicator);
                setTimeout(() => indicator.remove(), 10000);
            }
            
        } catch (error) {
            console.error('Performance monitoring error:', error);
        }
    }, 3000);
});

// Export for manual use
window.AccuratePerformanceMonitor = AccuratePerformanceMonitor;
window.performanceMonitor = performanceMonitor;

// Helper function to get current metrics
window.getCurrentMetrics = async () => {
    return await performanceMonitor.getDetailedMetrics();
};

// Helper function to compare platforms for AI hosting
window.comparePlatforms = (renderMetrics, railwayMetrics) => {
    console.group('🔥 AI HOSTING PLATFORM COMPARISON');
    
    const comparison = {
        'Render': {
            'TTFB': renderMetrics.navigation?.ttfb + 'ms',
            'FCP': renderMetrics.firstContentfulPaint + 'ms',
            'LCP': renderMetrics.largestContentfulPaint + 'ms',
            'Memory': renderMetrics.memory?.usedJSHeapSize + 'MB',
            'Cold Start': renderMetrics.isColdStart ? 'YES' : 'NO',
            'AI Hosting Score': renderMetrics.hostingScore?.total + '/100'
        },
        'Railway': {
            'TTFB': railwayMetrics.navigation?.ttfb + 'ms',
            'FCP': railwayMetrics.firstContentfulPaint + 'ms',
            'LCP': railwayMetrics.largestContentfulPaint + 'ms',
            'Memory': railwayMetrics.memory?.usedJSHeapSize + 'MB',
            'Cold Start': railwayMetrics.isColdStart ? 'YES' : 'NO',
            'AI Hosting Score': railwayMetrics.hostingScore?.total + '/100'
        }
    };
    
    console.table(comparison);
    
    // Determine winner for each category
    console.group('🏆 CATEGORY WINNERS');
    console.log('⚡ Cold Start Performance:', 
        (renderMetrics.isColdStart ? renderMetrics.coldStartTTFB : 0) < 
        (railwayMetrics.isColdStart ? railwayMetrics.coldStartTTFB : 0) ? 'Render' : 'Railway');
    console.log('🚀 TTFB Performance:', 
        (renderMetrics.navigation?.ttfb || Infinity) < (railwayMetrics.navigation?.ttfb || Infinity) ? 'Render' : 'Railway');
    console.log('💾 Memory Efficiency:', 
        (renderMetrics.memory?.usedJSHeapSize || Infinity) < (railwayMetrics.memory?.usedJSHeapSize || Infinity) ? 'Render' : 'Railway');
    console.log('🎨 User Experience (FCP):', 
        (renderMetrics.firstContentfulPaint || Infinity) < (railwayMetrics.firstContentfulPaint || Infinity) ? 'Render' : 'Railway');
    console.groupEnd();
    
    // Overall recommendation
    const renderScore = renderMetrics.hostingScore?.total || 0;
    const railwayScore = railwayMetrics.hostingScore?.total || 0;
    
    console.group('🎯 AI WEBSITE BUILDER RECOMMENDATION');
    if (renderScore > railwayScore) {
        console.log('🥇 Winner: RENDER');
        console.log('📊 Score:', `${renderScore}/100 vs ${railwayScore}/100`);
        console.log('💡 Better for: Static AI-generated sites, simple deployments');
    } else if (railwayScore > renderScore) {
        console.log('🥇 Winner: RAILWAY');
        console.log('📊 Score:', `${railwayScore}/100 vs ${renderScore}/100`);
        console.log('💡 Better for: Dynamic AI apps, multiple databases, container workloads');
    } else {
        console.log('🤝 Tie: Both platforms perform similarly');
        console.log('📊 Score:', `${renderScore}/100 each`);
    }
    console.groupEnd();
    
    console.groupEnd();
};

// AI Website Builder specific testing functions
window.testAIHostingCapabilities = async (platformUrl) => {
    console.group(`🤖 Testing AI Hosting Capabilities: ${platformUrl}`);
    
    const tests = {
        'Static Asset Delivery': async () => {
            const start = performance.now();
            try {
                const response = await fetch(`${platformUrl}/favicon.ico`, { cache: 'no-cache' });
                const end = performance.now();
                return { success: response.ok, time: Math.round(end - start) };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },
        
        'Dynamic Content Generation': async () => {
            const start = performance.now();
            try {
                const response = await fetch(platformUrl, { 
                    cache: 'no-cache',
                    headers: { 'X-Test': 'ai-content-generation' }
                });
                const end = performance.now();
                return { success: response.ok, time: Math.round(end - start) };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },
        
        'Concurrent User Simulation': async () => {
            const concurrentRequests = 10;
            const start = performance.now();
            
            try {
                const promises = Array.from({ length: concurrentRequests }, (_, i) =>
                    fetch(`${platformUrl}?user=${i}`, { cache: 'no-cache' })
                );
                
                const responses = await Promise.all(promises);
                const end = performance.now();
                
                const successCount = responses.filter(r => r.ok).length;
                return {
                    success: successCount === concurrentRequests,
                    time: Math.round(end - start),
                    successRate: (successCount / concurrentRequests) * 100
                };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }
    };
    
    const results = {};
    for (const [testName, testFunc] of Object.entries(tests)) {
        console.log(`Running: ${testName}...`);
        results[testName] = await testFunc();
    }
    
    console.table(results);
    console.groupEnd();
    
    return results;
};
