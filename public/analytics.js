/**
 * ME PROMPT Analytics Tracking Script
 * Lightweight client-side analytics for tracking page views
 */

(function () {
    'use strict';

    const ANALYTICS_ENDPOINT = 'http://49.231.43.177:7077/api/analytics/track';
    const SESSION_KEY = 'mp_session_id';

    // Generate or retrieve session ID
    function getSessionId() {
        let sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = generateUUID();
            localStorage.setItem(SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    // Simple UUID generator
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    // Track page view
    function trackPageView() {
        const data = {
            sessionId: getSessionId(),
            page: window.location.pathname + window.location.search,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
        };

        // Send tracking data
        fetch(ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).catch((err) => {
            // Silently fail - don't break the website
            console.debug('Analytics tracking failed:', err);
        });
    }

    // Track initial page view
    if (document.readyState === 'complete') {
        trackPageView();
    } else {
        window.addEventListener('load', trackPageView);
    }

    // Track SPA navigation (for Next.js, React Router, etc.)
    let lastPath = window.location.pathname;
    setInterval(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
            lastPath = currentPath;
            trackPageView();
        }
    }, 1000);
})();
