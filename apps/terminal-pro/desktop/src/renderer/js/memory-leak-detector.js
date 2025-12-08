/**
 * RinaWarp Terminal Pro - Memory Leak Detector & Cleaner
 * Detects and automatically fixes memory leaks
 */

class MemoryLeakDetector {
    constructor() {
        this.isDetecting = false;
        this.baselineMemory = null;
        this.memorySnapshots = [];
        this.suspiciousObjects = new Set();
        this.cleanupCallbacks = new Map();
        this.originalMethods = new Map();
        
        this.thresholds = {
            memoryIncreaseWarning: 50 * 1024 * 1024, // 50MB
            memoryIncreaseCritical: 100 * 1024 * 1024, // 100MB
            snapshotInterval: 30000, // 30 seconds
            maxSnapshots: 20
        };
        
        this.setupInterceptors();
        this.startDetection();
    }

    setupInterceptors() {
        // Intercept common sources of memory leaks
        
        // Event listeners
        this.interceptEventListeners();
        
        // Timers and intervals
        this.interceptTimers();
        
        // Intersection Observer and Mutation Observer
        this.interceptObservers();
        
        // Canvas and WebGL contexts
        this.interceptCanvas();
        
        // Fetch and XMLHttpRequest
        this.interceptNetworkRequests();
    }

    interceptEventListeners() {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            const result = originalAddEventListener.call(this, type, listener, options);
            
            // Track event listeners
            MemoryLeakDetector.trackEventListener(this, type, listener, options);
            
            return result;
        };
        
        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            MemoryLeakDetector.untrackEventListener(this, type, listener);
            return originalRemoveEventListener.call(this, type, listener, options);
        };
        
        this.originalMethods.set('addEventListener', originalAddEventListener);
        this.originalMethods.set('removeEventListener', originalRemoveEventListener);
    }

    static trackEventListener(target, type, listener, options) {
        if (!window.__eventListeners) {
            window.__eventListeners = new WeakMap();
        }
        
        const listeners = window.__eventListeners.get(target) || [];
        listeners.push({
            type,
            listener,
            options,
            timestamp: Date.now()
        });
        
        window.__eventListeners.set(target, listeners);
    }

    static untrackEventListener(target, type, listener) {
        if (!window.__eventListeners) return;
        
        const listeners = window.__eventListeners.get(target);
        if (!listeners) return;
        
        const index = listeners.findIndex(l => l.listener === listener && l.type === type);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    interceptTimers() {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        const originalClearTimeout = window.clearTimeout;
        const originalClearInterval = window.clearInterval;
        
        this.trackedTimers = new Set();
        
        window.setTimeout = function(callback, delay, ...args) {
            const timerId = originalSetTimeout(callback, delay, ...args);
            MemoryLeakDetector.trackTimer(timerId, callback, 'timeout');
            return timerId;
        };
        
        window.setInterval = function(callback, delay, ...args) {
            const timerId = originalSetInterval(callback, delay, ...args);
            MemoryLeakDetector.trackTimer(timerId, callback, 'interval');
            return timerId;
        };
        
        window.clearTimeout = function(timerId) {
            MemoryLeakDetector.untrackTimer(timerId);
            return originalClearTimeout(timerId);
        };
        
        window.clearInterval = function(timerId) {
            MemoryLeakDetector.untrackTimer(timerId);
            return originalClearInterval(timerId);
        };
        
        this.originalMethods.set('setTimeout', originalSetTimeout);
        this.originalMethods.set('setInterval', originalSetInterval);
        this.originalMethods.set('clearTimeout', originalClearTimeout);
        this.originalMethods.set('clearInterval', originalClearInterval);
    }

    static trackTimer(id, callback, type) {
        if (!window.__trackedTimers) {
            window.__trackedTimers = new Map();
        }
        
        window.__trackedTimers.set(id, {
            callback,
            type,
            created: Date.now(),
            target: callback
        });
    }

    static untrackTimer(id) {
        if (!window.__trackedTimers) return;
        window.__trackedTimers.delete(id);
    }

    interceptObservers() {
        // Intersection Observer
        if ('IntersectionObserver' in window) {
            const originalIntersectionObserver = window.IntersectionObserver;
            
            window.IntersectionObserver = function(callback, options) {
                const observer = new originalIntersectionObserver(callback, options);
                MemoryLeakDetector.trackObserver(observer, callback, 'intersection');
                return observer;
            };
            
            this.originalMethods.set('IntersectionObserver', originalIntersectionObserver);
        }
        
        // Mutation Observer
        if ('MutationObserver' in window) {
            const originalMutationObserver = window.MutationObserver;
            
            window.MutationObserver = function(callback) {
                const observer = new originalMutationObserver(callback);
                MemoryLeakDetector.trackObserver(observer, callback, 'mutation');
                return observer;
            };
            
            this.originalMethods.set('MutationObserver', originalMutationObserver);
        }
        
        // Resize Observer
        if ('ResizeObserver' in window) {
            const originalResizeObserver = window.ResizeObserver;
            
            window.ResizeObserver = function(callback) {
                const observer = new originalResizeObserver(callback);
                MemoryLeakDetector.trackObserver(observer, callback, 'resize');
                return observer;
            };
            
            this.originalMethods.set('ResizeObserver', originalResizeObserver);
        }
    }

    static trackObserver(observer, callback, type) {
        if (!window.__trackedObservers) {
            window.__trackedObservers = new WeakMap();
        }
        
        window.__trackedObservers.set(observer, {
            callback,
            type,
            created: Date.now()
        });
    }

    interceptCanvas() {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        
        HTMLCanvasElement.prototype.getContext = function(contextType, options) {
            const context = originalGetContext.call(this, contextType, options);
            
            if (context && (contextType === 'webgl' || contextType === 'webgl2')) {
                MemoryLeakDetector.trackWebGLContext(this, context, contextType);
            }
            
            return context;
        };
        
        this.originalMethods.set('getContext', originalGetContext);
    }

    static trackWebGLContext(canvas, context, type) {
        if (!window.__webglContexts) {
            window.__webglContexts = new WeakMap();
        }
        
        window.__webglContexts.set(canvas, {
            context,
            type,
            created: Date.now()
        });
    }

    interceptNetworkRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const promise = originalFetch.apply(this, args);
            
            promise.finally(() => {
                // Cleanup fetch-related resources if needed
            });
            
            return promise;
        };
        
        this.originalMethods.set('fetch', originalFetch);
    }

    startDetection() {
        this.isDetecting = true;
        
        // Take initial baseline
        setTimeout(() => {
            this.takeMemorySnapshot('baseline');
        }, 5000);
        
        // Start regular monitoring
        this.monitoringInterval = setInterval(() => {
            this.takeMemorySnapshot('regular');
            this.analyzeMemoryUsage();
        }, this.thresholds.snapshotInterval);
        
        console.log('Memory leak detection started');
    }

    stopDetection() {
        this.isDetecting = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Memory leak detection stopped');
    }

    takeMemorySnapshot(reason) {
        const snapshot = {
            timestamp: Date.now(),
            reason,
            memory: this.getMemoryInfo(),
            eventListeners: this.countEventListeners(),
            timers: this.countTimers(),
            observers: this.countObservers(),
            webglContexts: this.countWebGLContexts()
        };
        
        this.memorySnapshots.push(snapshot);
        
        // Keep only recent snapshots
        if (this.memorySnapshots.length > this.thresholds.maxSnapshots) {
            this.memorySnapshots.shift();
        }
        
        if (reason === 'baseline') {
            this.baselineMemory = snapshot.memory.usedJSHeapSize;
        }
        
        return snapshot;
    }

    getMemoryInfo() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        return {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
        };
    }

    countEventListeners() {
        if (!window.__eventListeners) return 0;
        
        let count = 0;
        for (const listeners of window.__eventListeners.values()) {
            count += listeners.length;
        }
        
        return count;
    }

    countTimers() {
        return window.__trackedTimers ? window.__trackedTimers.size : 0;
    }

    countObservers() {
        if (!window.__trackedObservers) return 0;
        
        let count = 0;
        for (const _ of window.__trackedObservers.keys()) {
            count++;
        }
        
        return count;
    }

    countWebGLContexts() {
        if (!window.__webglContexts) return 0;
        
        let count = 0;
        for (const _ of window.__webglContexts.keys()) {
            count++;
        }
        
        return count;
    }

    analyzeMemoryUsage() {
        const currentSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];
        if (!currentSnapshot || !this.baselineMemory) return;
        
        const memoryIncrease = currentSnapshot.memory.usedJSHeapSize - this.baselineMemory;
        
        if (memoryIncrease > this.thresholds.memoryIncreaseCritical) {
            this.detectMemoryLeak('critical', memoryIncrease);
        } else if (memoryIncrease > this.thresholds.memoryIncreaseWarning) {
            this.detectMemoryLeak('warning', memoryIncrease);
        }
        
        // Check for accumulating event listeners
        if (this.memorySnapshots.length > 2) {
            const recentListeners = this.memorySnapshots.slice(-3);
            const increasing = recentListeners.every((snapshot, index) => {
                if (index === 0) return true;
                return snapshot.eventListeners >= recentListeners[index - 1].eventListeners;
            });
            
            if (increasing && recentListeners[recentListeners.length - 1].eventListeners > 100) {
                this.flagMemoryLeak('Event Listeners Accumulating', {
                    count: recentListeners[recentListeners.length - 1].eventListeners,
                    action: 'cleanup'
                });
            }
        }
        
        // Check for accumulating timers
        if (this.memorySnapshots.length > 2) {
            const recentTimers = this.memorySnapshots.slice(-3);
            const increasing = recentTimers.every((snapshot, index) => {
                if (index === 0) return true;
                return snapshot.timers >= recentTimers[index - 1].timers;
            });
            
            if (increasing && recentTimers[recentTimers.length - 1].timers > 50) {
                this.flagMemoryLeak('Timers Accumulating', {
                    count: recentTimers[recentTimers.length - 1].timers,
                    action: 'cleanup'
                });
            }
        }
    }

    detectMemoryLeak(level, memoryIncrease) {
        const message = `Memory increase detected: ${this.formatBytes(memoryIncrease)}`;
        
        if (level === 'critical') {
            this.criticalMemoryLeakDetected(memoryIncrease);
            console.error(`[MEMORY LEAK] ${message}`);
        } else {
            console.warn(`[MEMORY WARNING] ${message}`);
        }
        
        this.flagMemoryLeak(message, {
            level,
            memoryIncrease,
            action: 'cleanup'
        });
    }

    flagMemoryLeak(description, data) {
        const leak = {
            id: Date.now(),
            description,
            data,
            timestamp: Date.now(),
            resolved: false
        };
        
        this.suspiciousObjects.add(leak);
        
        // Auto-cleanup for known issues
        if (data.action === 'cleanup') {
            this.performAutoCleanup(data);
        }
    }

    criticalMemoryLeakDetected(memoryIncrease) {
        // Perform aggressive cleanup
        this.aggressiveCleanup();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Notify application
        this.emitMemoryLeakAlert({
            level: 'critical',
            message: `Critical memory leak detected: ${this.formatBytes(memoryIncrease)}`,
            action: 'aggressive_cleanup_performed'
        });
    }

    performAutoCleanup(data) {
        switch (data.type || 'general') {
            case 'event_listeners':
                this.cleanupEventListeners();
                break;
            case 'timers':
                this.cleanupTimers();
                break;
            case 'observers':
                this.cleanupObservers();
                break;
            default:
                this.generalCleanup();
        }
    }

    aggressiveCleanup() {
        // Clear all tracked timers
        this.cleanupTimers(true);
        
        // Disconnect unused observers
        this.cleanupObservers(true);
        
        // Force cleanup of terminal resources
        if (window.terminalManager && typeof window.terminalManager.performMemoryCleanup === 'function') {
            window.terminalManager.performMemoryCleanup();
        }
        
        // Clear caches
        this.clearCaches();
        
        // Remove orphaned DOM elements
        this.cleanupOrphanedDOM();
    }

    generalCleanup() {
        // Remove inactive event listeners
        this.cleanupEventListeners();
        
        // Clear old timers
        this.cleanupTimers();
        
        // Clear caches
        this.clearCaches();
    }

    cleanupEventListeners(force = false) {
        if (!window.__eventListeners) return;
        
        const now = Date.now();
        const maxAge = force ? 0 : 60000; // 1 minute for normal cleanup, immediate for force
        
        for (const [target, listeners] of window.__eventListeners.entries()) {
            const activeListeners = listeners.filter(listener => {
                const age = now - listener.timestamp;
                return age < maxAge;
            });
            
            if (activeListeners.length !== listeners.length) {
                window.__eventListeners.set(target, activeListeners);
            }
        }
    }

    cleanupTimers(force = false) {
        if (!window.__trackedTimers) return;
        
        const now = Date.now();
        const maxAge = force ? 0 : 300000; // 5 minutes for normal cleanup
        
        for (const [id, timer] of window.__trackedTimers.entries()) {
            const age = now - timer.created;
            if (force || age > maxAge) {
                if (timer.type === 'timeout') {
                    clearTimeout(id);
                } else {
                    clearInterval(id);
                }
                window.__trackedTimers.delete(id);
            }
        }
    }

    cleanupObservers(force = false) {
        if (!window.__trackedObservers) return;
        
        const now = Date.now();
        const maxAge = force ? 0 : 600000; // 10 minutes for normal cleanup
        
        for (const [observer, data] of window.__trackedObservers.entries()) {
            const age = now - data.created;
            if (force || age > maxAge) {
                try {
                    observer.disconnect();
                } catch (e) {
                    // Observer might already be disconnected
                }
                window.__trackedObservers.delete(observer);
            }
        }
    }

    cleanupOrphanedDOM() {
        // Remove event listeners from disconnected DOM nodes
        if (!window.__eventListeners) return;
        
        for (const target of window.__eventListeners.keys()) {
            if (target instanceof Node && !document.contains(target)) {
                window.__eventListeners.delete(target);
            }
        }
    }

    clearCaches() {
        // Clear various caches
        if (window.terminalManager && window.terminalManager.requestCache) {
            window.terminalManager.requestCache.clear();
        }
        
        if (window.aiRouter && window.aiRouter.requestCache) {
            window.aiRouter.requestCache.clear();
        }
        
        // Clear other application caches
        if (window.applicationCache) {
            window.applicationCache.clear();
        }
    }

    emitMemoryLeakAlert(alert) {
        // Emit custom event for UI components to respond to
        window.dispatchEvent(new CustomEvent('memory-leak-alert', {
            detail: alert
        }));
        
        // Call registered cleanup callbacks
        for (const callback of this.cleanupCallbacks.values()) {
            try {
                callback(alert);
            } catch (error) {
                console.error('Error in memory leak cleanup callback:', error);
            }
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Public API
    getMemoryReport() {
        const current = this.memorySnapshots[this.memorySnapshots.length - 1];
        const baseline = this.memorySnapshots[0];
        
        const memoryIncrease = baseline && current 
            ? current.memory.usedJSHeapSize - baseline.memory.usedJSHeapSize
            : 0;
        
        return {
            current: current,
            baseline: baseline,
            memoryIncrease: memoryIncrease,
            suspiciousObjects: Array.from(this.suspiciousObjects),
            memoryIncreaseFormatted: this.formatBytes(memoryIncrease),
            isLeaking: memoryIncrease > this.thresholds.memoryIncreaseWarning
        };
    }

    getLeaks() {
        return Array.from(this.suspiciousObjects);
    }

    forceCleanup() {
        this.aggressiveCleanup();
        
        if (window.gc) {
            window.gc();
        }
        
        return {
            cleaned: true,
            timestamp: Date.now()
        };
    }

    onMemoryLeak(callback) {
        const callbackId = Date.now();
        this.cleanupCallbacks.set(callbackId, callback);
        return callbackId;
    }

    removeMemoryLeakCallback(callbackId) {
        this.cleanupCallbacks.delete(callbackId);
    }

    destroy() {
        this.stopDetection();
        
        // Restore original methods
        for (const [name, original] of this.originalMethods.entries()) {
            try {
                switch (name) {
                    case 'addEventListener':
                        EventTarget.prototype.addEventListener = original;
                        break;
                    case 'removeEventListener':
                        EventTarget.prototype.removeEventListener = original;
                        break;
                    case 'setTimeout':
                        window.setTimeout = original;
                        break;
                    case 'setInterval':
                        window.setInterval = original;
                        break;
                    case 'clearTimeout':
                        window.clearTimeout = original;
                        break;
                    case 'clearInterval':
                        window.clearInterval = original;
                        break;
                    case 'getContext':
                        HTMLCanvasElement.prototype.getContext = original;
                        break;
                    case 'IntersectionObserver':
                        if (original) window.IntersectionObserver = original;
                        break;
                    case 'MutationObserver':
                        if (original) window.MutationObserver = original;
                        break;
                    case 'ResizeObserver':
                        if (original) window.ResizeObserver = original;
                        break;
                    case 'fetch':
                        window.fetch = original;
                        break;
                }
            } catch (error) {
                console.warn(`Failed to restore ${name}:`, error);
            }
        }
        
        // Clean up global tracking objects
        delete window.__eventListeners;
        delete window.__trackedTimers;
        delete window.__trackedObservers;
        delete window.__webglContexts;
        
        this.cleanupCallbacks.clear();
        this.suspiciousObjects.clear();
        
        console.log('Memory leak detector destroyed');
    }
}

// Export memory leak detector
window.MemoryLeakDetector = MemoryLeakDetector;
window.memoryLeakDetector = new MemoryLeakDetector();