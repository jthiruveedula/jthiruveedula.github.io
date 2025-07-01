'use strict';

import { initThemeToggle, initScrollToTop, initContactForm, initNavigation } from './ui.js';
import {
    initNameAnimation,
    initTaglineAnimation,
    initScrollReveal,
    initHeaderParallax
} from './animations.js';
import {
    initVerticalTimeline,
    initHorizontalTimeline,
    initTimelineAriaManagement
} from './timeline.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initNavigation();
    initThemeToggle();
    initScrollToTop();
    initContactForm();

    // Initialize animations
    initNameAnimation();
    initTaglineAnimation();
    initScrollReveal(); // Observes general sections
    initHeaderParallax();

    // Initialize timelines (which include their own IntersectionObservers and animations)
    initVerticalTimeline();
    initHorizontalTimeline();
    initTimelineAriaManagement();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
});
