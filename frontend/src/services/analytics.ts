/**
 * Privacy-focused analytics service
 * Supports Plausible Analytics (recommended) and Google Analytics
 */

const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const ANALYTICS_PROVIDER = import.meta.env.VITE_ANALYTICS_PROVIDER || 'plausible';
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'resistanceradio.org';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Initialize analytics
 */
export function initAnalytics() {
  if (!ANALYTICS_ENABLED) {
    console.log('Analytics disabled');
    return;
  }

  if (ANALYTICS_PROVIDER === 'plausible') {
    initPlausible();
  } else if (ANALYTICS_PROVIDER === 'ga') {
    initGoogleAnalytics();
  }
}

/**
 * Initialize Plausible Analytics (privacy-focused, GDPR compliant)
 */
function initPlausible() {
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
  
  console.log('Plausible Analytics initialized');
}

/**
 * Initialize Google Analytics
 */
function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics ID not configured');
    return;
  }

  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true, // Anonymize IP for privacy
    cookie_flags: 'SameSite=None;Secure'
  });

  console.log('Google Analytics initialized');
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!ANALYTICS_ENABLED) return;

  if (ANALYTICS_PROVIDER === 'plausible') {
    // Plausible automatically tracks page views
    if (window.plausible) {
      window.plausible('pageview', { props: { path, title } });
    }
  } else if (ANALYTICS_PROVIDER === 'ga') {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title
      });
    }
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  if (!ANALYTICS_ENABLED) return;

  if (ANALYTICS_PROVIDER === 'plausible') {
    if (window.plausible) {
      window.plausible(eventName, { props: properties });
    }
  } else if (ANALYTICS_PROVIDER === 'ga') {
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  }

  console.log('Event tracked:', eventName, properties);
}

/**
 * Track audio play event
 */
export function trackAudioPlay(episodeTitle: string, showTitle?: string) {
  trackEvent('audio_play', {
    episode: episodeTitle,
    show: showTitle || 'unknown'
  });
}

/**
 * Track audio pause event
 */
export function trackAudioPause(episodeTitle: string, currentTime: number) {
  trackEvent('audio_pause', {
    episode: episodeTitle,
    time: Math.round(currentTime)
  });
}

/**
 * Track audio complete event
 */
export function trackAudioComplete(episodeTitle: string) {
  trackEvent('audio_complete', {
    episode: episodeTitle
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(formType: string) {
  trackEvent('form_submission', {
    form_type: formType
  });
}

/**
 * Track download
 */
export function trackDownload(fileName: string, fileType: string) {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    query,
    results: resultsCount
  });
}

/**
 * Track social share
 */
export function trackSocialShare(platform: string, contentType: string, contentTitle: string) {
  trackEvent('social_share', {
    platform,
    content_type: contentType,
    content_title: contentTitle
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup() {
  trackEvent('newsletter_signup');
}

/**
 * Track outbound link click
 */
export function trackOutboundLink(url: string) {
  trackEvent('outbound_link', {
    url
  });
}

// Type declarations for window
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackAudioPlay,
  trackAudioPause,
  trackAudioComplete,
  trackFormSubmission,
  trackDownload,
  trackSearch,
  trackSocialShare,
  trackNewsletterSignup,
  trackOutboundLink
};
