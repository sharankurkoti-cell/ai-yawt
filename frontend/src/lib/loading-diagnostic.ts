// Loading Issue Diagnostic Tool

export const diagnoseLoadingIssues = () => {
  console.group('🔍 LOADING ISSUE DIAGNOSTIC');
  
  // Check 1: Browser and Environment
  console.log('\n📋 Browser & Environment Check:');
  console.log('User Agent:', navigator.userAgent);
  console.log('Current URL:', window.location.href);
  console.log('Environment:', import.meta.env?.NODE_ENV);
  console.log('HMR Enabled:', import.meta.env?.MODE === 'development');
  
  // Check 2: Network Status
  console.log('\n📋 Network Status:');
  console.log('Online:', navigator.onLine);
  console.log('Connection Type:', navigator.connection?.effectiveType || 'Unknown');
  
  // Check 3: Performance Metrics
  console.log('\n📋 Performance Metrics:');
  console.log('Memory Usage:', performance.memory ? {
    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
  } : 'Not available');
  
  console.log('Navigation Timing:', performance.timing ? {
    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
    firstPaint: performance.timing.firstPaint
  } : 'Not available');
  
  // Check 4: Console Errors
  console.log('\n📋 Recent Console Errors:');
  const errors = [];
  
  // Check for React errors
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detected');
  }
  
  // Check for specific error patterns
  const originalConsoleError = console.error;
  console.error = (...args) => {
    errors.push({
      timestamp: new Date().toISOString(),
      message: args.join(' '),
      type: 'error'
    });
    originalConsoleError.apply(console, args);
  };
  
  // Check for unhandled rejections
  window.addEventListener('unhandledrejection', (event) => {
    errors.push({
      timestamp: new Date().toISOString(),
      message: event.reason,
      type: 'unhandledRejection'
    });
  });
  
  console.log(`Total Errors Found: ${errors.length}`);
  errors.forEach((error, index) => {
    console.log(`${index + 1}. [${error.timestamp}] ${error.type}: ${error.message}`);
  });
  
  // Check 5: Resource Loading
  console.log('\n📋 Resource Loading Check:');
  const images = document.querySelectorAll('img');
  const scripts = document.querySelectorAll('script');
  const links = document.querySelectorAll('link');
  
  console.log(`Images: ${images.length} loaded`);
  console.log(`Scripts: ${scripts.length} loaded`);
  console.log(`Stylesheets: ${links.length} loaded`);
  
  // Check 6: Service Worker Status
  console.log('\n📋 Service Worker Status:');
  if ('serviceWorker' in navigator) {
    console.log('Service Worker supported:', navigator.serviceWorker.controller ? 'Active' : 'Not registered');
  }
  
  console.groupEnd();
  
  // Generate diagnostic report
  const report = {
    timestamp: new Date().toISOString(),
    environment: import.meta.env?.NODE_ENV || 'unknown',
    browser: navigator.userAgent,
    online: navigator.onLine,
    performance: performance.memory ? {
      memory: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB'
    } : null,
    errors: errors.length,
    resources: {
      images: images.length,
      scripts: scripts.length,
      stylesheets: links.length
    },
    recommendations: []
  };
  
  // Add recommendations based on findings
  if (errors.length > 0) {
    report.recommendations.push('Check console errors for application issues');
  }
  
  if (!navigator.onLine) {
    report.recommendations.push('Check network connection');
  }
  
  if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1048576) { // > 50MB
    report.recommendations.push('High memory usage detected - consider optimization');
  }
  
  console.log('\n📊 DIAGNOSTIC REPORT:');
  console.log(JSON.stringify(report, null, 2));
  
  return report;
};

// Quick fix suggestions
export const suggestQuickFixes = (report: any) => {
  console.log('\n🔧 QUICK FIX SUGGESTIONS:');
  
  const fixes = [];
  
  if (report.errors > 0) {
    fixes.push('1. Check browser console for error details');
    fixes.push('2. Try hard refresh (Ctrl+F5)');
    fixes.push('3. Clear browser cache and cookies');
  }
  
  if (!report.online) {
    fixes.push('1. Check internet connection');
    fixes.push('2. Restart router/modem');
  }
  
  if (report.performance && report.performance.memory > 50) {
    fixes.push('1. Close other browser tabs');
    fixes.push('2. Restart browser');
    fixes.push('3. Check for memory leaks');
  }
  
  fixes.forEach((fix, index) => {
    console.log(`${index + 1}. ${fix}`);
  });
  
  return fixes;
};
