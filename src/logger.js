// Generate a simple session ID
const getSessionId = () => {
    let sessionId = localStorage.getItem('debug_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('debug_session_id', sessionId);
    }
    return sessionId;
};

const sessionId = getSessionId();

const sendLog = (level, message) => {
    const payload = {
        level,
        message: typeof message === 'object' ? JSON.stringify(message) : String(message),
        timestamp: new Date().toISOString(),
        sessionId,
        url: window.location.href
    };

    // Use sendBeacon if available for reliability during unload, otherwise fetch
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/log', blob);
    } else {
        fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.warn('Failed to send log:', err));
    }
};

// Override console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
    originalLog.apply(console, args);
    // Join args for better readability in text file
    sendLog('info', args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '));
};

console.error = (...args) => {
    originalError.apply(console, args);
    sendLog('error', args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '));
};

console.warn = (...args) => {
    originalWarn.apply(console, args);
    sendLog('warn', args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '));
};

// Capture unhandled errors
window.onerror = (message, source, lineno, colno, error) => {
    sendLog('error', `Unhandled Error: ${message} at ${source}:${lineno}:${colno}`);
};

// Capture unhandled promise rejections
window.onunhandledrejection = (event) => {
    sendLog('error', `Unhandled Promise Rejection: ${event.reason}`);
};

console.info(`[Logger] Remote logging initialized. Session ID: ${sessionId}`);
