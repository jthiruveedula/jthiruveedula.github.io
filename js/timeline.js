'use strict';

// Debounce function (can be shared if needed by other modules, or kept local)
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function initVerticalTimeline() {
    const timelineItems = document.querySelectorAll('#experience .experience-vertical-container .timeline-item');
    if (timelineItems.length > 0) {
        const prefersReducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        const isReducedMotion = prefersReducedMotionQuery.matches;

        if (isReducedMotion) {
            timelineItems.forEach(item => {
                item.style.opacity = '1';
                item.classList.remove('animate-in');
            });
        } else {
            const timelineObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        const itemIndex = Array.from(timelineItems).indexOf(item);
                        setTimeout(() => {
                            item.classList.add('animate-in');
                        }, itemIndex * 150);
                        observer.unobserve(item);
                    }
                });
            }, {
                threshold: 0.2,
            });

            timelineItems.forEach(item => {
                timelineObserver.observe(item);
            });
        }
    }

    const timelineElement = document.querySelector('#experience .experience-vertical-container .timeline');
    if (timelineElement) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            timelineElement.classList.add('timeline-draw');
        } else {
            const timelineDrawObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        timelineElement.classList.add('timeline-draw');
                        observer.unobserve(timelineElement);
                    }
                });
            }, { threshold: 0.1 });

            timelineDrawObserver.observe(timelineElement);
        }
    }
}

export function initHorizontalTimeline() {
    const horizontalTimelineWrapper = document.querySelector('.timeline-items-wrapper');
    const prevButton = document.querySelector('.timeline-nav-prev');
    const nextButton = document.querySelector('.timeline-nav-next');

    if (horizontalTimelineWrapper && prevButton && nextButton) {
        const getItemScrollAmount = () => {
            const firstItem = horizontalTimelineWrapper.querySelector('.horizontal-timeline-item');
            let scrollAmount = 340; // Fallback for item width + margin
            if (firstItem) {
                const style = window.getComputedStyle(firstItem);
                const marginRight = parseFloat(style.marginRight) || 0;
                scrollAmount = firstItem.offsetWidth + marginRight;
            }
            return scrollAmount;
        };

        const updateNavButtonStates = () => {
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') {
                prevButton.disabled = true;
                nextButton.disabled = true;
                return;
            }

            const scrollLeft = Math.round(horizontalTimelineWrapper.scrollLeft);
            const scrollWidth = horizontalTimelineWrapper.scrollWidth;
            const clientWidth = horizontalTimelineWrapper.clientWidth;

            // If scrollWidth is not significantly larger than clientWidth, no scrolling is possible.
            if (scrollWidth <= clientWidth + 1) {
                prevButton.disabled = true;
                nextButton.disabled = true;
                return;
            }

            const atStartThreshold = 5;
            const atEndThreshold = 5;

            prevButton.disabled = scrollLeft < atStartThreshold;
            nextButton.disabled = (scrollWidth - scrollLeft - clientWidth) < atEndThreshold;
        };

        prevButton.addEventListener('click', () => {
            const scrollAmount = getItemScrollAmount();
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') return;
            horizontalTimelineWrapper.scrollLeft -= scrollAmount;
            setTimeout(updateNavButtonStates, 550); // Allow time for scroll animation to complete
        });

        nextButton.addEventListener('click', () => {
            const scrollAmount = getItemScrollAmount();
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') return;
            horizontalTimelineWrapper.scrollLeft += scrollAmount;
            setTimeout(updateNavButtonStates, 550); // Allow time for scroll animation to complete
        });

        const debouncedUpdateNavButtonStates = debounce(updateNavButtonStates, 100);

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(debouncedUpdateNavButtonStates);
            resizeObserver.observe(horizontalTimelineWrapper);
        } else {
            window.addEventListener('resize', debouncedUpdateNavButtonStates);
        }

        horizontalTimelineWrapper.addEventListener('scroll', debouncedUpdateNavButtonStates);

        const attemptInitialUpdate = (retries = 5, delay = 250) => {
            updateNavButtonStates();

            const scrollWidth = horizontalTimelineWrapper.scrollWidth;
            const clientWidth = horizontalTimelineWrapper.clientWidth;
            const itemCount = horizontalTimelineWrapper.querySelectorAll('.horizontal-timeline-item').length;
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');

            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') {
                return; // Don't retry if hidden
            }

            const estimatedMinItemRenderedWidth = 300;
            const minimumExpectedScrollWidth = itemCount * estimatedMinItemRenderedWidth;

            if (itemCount > 1 &&
                (scrollWidth < minimumExpectedScrollWidth || scrollWidth <= clientWidth) &&
                retries > 0) {
                setTimeout(() => attemptInitialUpdate(retries - 1, delay), delay);
            } else {
                if (retries < 5) {
                     updateNavButtonStates(); // Final update
                }
            }
        };

        const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
        if (horizontalContainer && window.getComputedStyle(horizontalContainer).display !== 'none') {
             requestAnimationFrame(() => {
                attemptInitialUpdate();
            });
        } else {
            updateNavButtonStates(); // Call directly if hidden initially
        }
        setTimeout(updateNavButtonStates, 50); // Fallback initial call
    }

    // Horizontal Timeline Item Entrance Animation
    const horizontalItems = document.querySelectorAll('.horizontal-timeline-item');
    const scrollWrapperForObserver = document.querySelector('.timeline-items-wrapper');

    if (horizontalItems.length > 0 && scrollWrapperForObserver) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const itemObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    if (prefersReducedMotion) {
                        item.classList.add('is-visible-no-anim');
                    } else {
                        const itemGlobalIndex = Array.from(horizontalItems).indexOf(item);
                        const delay = Math.max(0, itemGlobalIndex) * 100;
                        item.style.transitionDelay = `${delay}ms`;
                        item.classList.add('is-visible');
                    }
                    observer.unobserve(item);
                }
            });
        }, {
            root: scrollWrapperForObserver,
            rootMargin: "0px 0px 0px 0px",
            threshold: 0.1
        });

        horizontalItems.forEach(item => {
            itemObserver.observe(item);
        });
    }
}

export function initTimelineAriaManagement() {
    const verticalContainerForAria = document.querySelector('.experience-vertical-container');
    const horizontalContainerForAria = document.querySelector('.experience-horizontal-container');

    function manageTimelineAriaStates() {
        if (!verticalContainerForAria || !horizontalContainerForAria) {
            return;
        }
        const isMobileView = window.matchMedia('(max-width: 992px)').matches;

        if (isMobileView) {
            verticalContainerForAria.removeAttribute('aria-hidden');
            horizontalContainerForAria.setAttribute('aria-hidden', 'true');
        } else {
            horizontalContainerForAria.removeAttribute('aria-hidden');
            verticalContainerForAria.setAttribute('aria-hidden', 'true');
        }
    }

    manageTimelineAriaStates(); // Initial call
    window.addEventListener('resize', debounce(manageTimelineAriaStates, 200));
}
