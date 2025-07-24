/**
 * Simple performance test for the website
 * Tests loading times and basic functionality
 */

// Performance monitoring
const performanceData = {
    pageLoadStart: performance.now(),
    domContentLoaded: null,
    windowLoaded: null,
    firstPaint: null,
    firstContentfulPaint: null
};

// Monitor DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    performanceData.domContentLoaded = performance.now();
    console.log(`📊 DOM Content Loaded: ${(performanceData.domContentLoaded - performanceData.pageLoadStart).toFixed(2)}ms`);
});

// Monitor Window Load
window.addEventListener('load', function() {
    performanceData.windowLoaded = performance.now();
    console.log(`📊 Window Loaded: ${(performanceData.windowLoaded - performanceData.pageLoadStart).toFixed(2)}ms`);
    
    // Get paint timing if available
    if ('getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
                performanceData.firstPaint = entry.startTime;
                console.log(`🎨 First Paint: ${entry.startTime.toFixed(2)}ms`);
            }
            if (entry.name === 'first-contentful-paint') {
                performanceData.firstContentfulPaint = entry.startTime;
                console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
            }
        });
    }
    
    // Run performance tests after page load
    setTimeout(runPerformanceTests, 1000);
});

function runPerformanceTests() {
    console.log('\n🚀 Running Performance Tests...\n');
    
    // Test 1: Check for console errors
    const originalError = console.error;
    let errorCount = 0;
    console.error = function(...args) {
        errorCount++;
        originalError.apply(console, args);
    };
    
    // Test 2: Check resource loading
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    console.log(`📦 Total Resources Loaded: ${resources.length}`);
    if (slowResources.length > 0) {
        console.log(`⚠️  Slow Resources (>1s): ${slowResources.length}`);
        slowResources.forEach(resource => {
            console.log(`   - ${resource.name}: ${resource.duration.toFixed(2)}ms`);
        });
    } else {
        console.log('✅ All resources loaded quickly (<1s)');
    }
    
    // Test 3: Check image optimization
    const images = document.querySelectorAll('img');
    let largeImages = 0;
    images.forEach(img => {
        if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
            largeImages++;
        }
    });
    
    if (largeImages > 0) {
        console.log(`⚠️  Large Images Found: ${largeImages} (consider optimization)`);
    } else {
        console.log('✅ Image sizes appear optimized');
    }
    
    // Test 4: Check accessibility features
    const skipLinks = document.querySelectorAll('.skip-link');
    const ariaLabels = document.querySelectorAll('[aria-label]');
    const altTexts = document.querySelectorAll('img[alt]');
    
    console.log(`♿ Skip Links: ${skipLinks.length}`);
    console.log(`♿ ARIA Labels: ${ariaLabels.length}`);
    console.log(`♿ Images with Alt Text: ${altTexts.length}/${images.length}`);
    
    // Test 5: Check responsive design
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    console.log(`📱 Viewport: ${viewport.width}x${viewport.height}`);
    
    if (viewport.width < 768) {
        console.log('📱 Mobile viewport detected');
    } else if (viewport.width < 1024) {
        console.log('📱 Tablet viewport detected');
    } else {
        console.log('🖥️  Desktop viewport detected');
    }
    
    // Test 6: Check for JavaScript errors
    setTimeout(() => {
        if (errorCount === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log(`❌ ${errorCount} JavaScript errors detected`);
        }
        
        // Final performance summary
        console.log('\n📊 Performance Summary:');
        console.log(`   Page Load: ${(performanceData.windowLoaded - performanceData.pageLoadStart).toFixed(2)}ms`);
        console.log(`   DOM Ready: ${(performanceData.domContentLoaded - performanceData.pageLoadStart).toFixed(2)}ms`);
        
        if (performanceData.windowLoaded < 3000) {
            console.log('✅ Page loads within 3 seconds');
        } else {
            console.log('⚠️  Page load time exceeds 3 seconds');
        }
        
        console.log('\n🎯 Performance test complete!');
    }, 500);
}

// Test keyboard navigation
function testKeyboardNavigation() {
    console.log('\n⌨️  Testing Keyboard Navigation...');
    
    const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    console.log(`🎯 Focusable Elements: ${focusableElements.length}`);
    
    // Test tab order
    let tabIndex = 0;
    focusableElements.forEach((element, index) => {
        const computedTabIndex = element.tabIndex;
        if (computedTabIndex >= 0) {
            tabIndex++;
        }
    });
    
    console.log(`📋 Elements in Tab Order: ${tabIndex}`);
    
    // Test skip links
    const skipLinks = document.querySelectorAll('.skip-link');
    if (skipLinks.length > 0) {
        console.log('✅ Skip links available for keyboard users');
    }
}

// Export for manual testing
window.performanceTest = {
    data: performanceData,
    testKeyboard: testKeyboardNavigation,
    runTests: runPerformanceTests
};

// Auto-run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode detected - running performance tests');
}