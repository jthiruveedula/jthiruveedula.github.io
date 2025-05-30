'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const nameElement = document.querySelector('.animated-name');
    if (nameElement) {
        const chars = Array.from(nameElement.children);
        chars.forEach(char => {
            if (!char.classList.contains('space')) {
                char.style.opacity = '0';
            }
        });
        chars.forEach((char, index) => {
            char.style.animation = `fadeSlideUpLetter 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards ${index * 0.05 + 0.2}s`;
        });
    }

    const taglinePills = document.querySelectorAll('.tagline-pill');
    if (taglinePills.length > 0) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            taglinePills.forEach((pill, index) => {
                pill.style.animation = `pillEntrance 0.5s ease-out forwards ${index * 0.1 + 0.8}s`;
            });
        } else {
            taglinePills.forEach(pill => {
                pill.style.opacity = '1';
            });
        }
    }

    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            if (section.id !== 'experience') {
                section.style.opacity = '0';
            } else {
                // Ensure the #experience section container itself is visible,
                // as its children (timeline-item) will be animated individually.
                section.style.opacity = '1';
            }
        } else {
            section.style.opacity = '1'; // All sections visible if reduced motion
        }
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (!prefersReducedMotion) {
                    section.style.opacity = '1';
                }
                let sectionAnimationApplied = false;

                if (section.id === 'skills') {
                    const categoryHeadings = section.querySelectorAll('h3');
                    const skillChips = section.querySelectorAll('.skills-list li.skill-chip');
                    if (!prefersReducedMotion) {
                        categoryHeadings.forEach(h => h.style.opacity = '0');
                        skillChips.forEach(c => c.style.opacity = '0');
                    } else {
                        categoryHeadings.forEach(h => h.style.opacity = '1');
                        skillChips.forEach(c => c.style.opacity = '1');
                    }
                    const skillCategoryHeadings = section.querySelectorAll('h3');
                    let headingAnimationDelay = 0;
                    skillCategoryHeadings.forEach((heading, index) => {
                        if (!prefersReducedMotion) {
                            setTimeout(() => {
                                heading.classList.add('animate-slide-left');
                            }, headingAnimationDelay + (index * 150));
                        }
                    });
                    let chipAnimationBaseDelay = (skillCategoryHeadings.length > 0 && !prefersReducedMotion) ? (150 * (skillCategoryHeadings.length - 1) + 350) : 0;
                    const skillLists = section.querySelectorAll('.skills-list');
                    skillLists.forEach((list) => {
                        const chips = list.querySelectorAll('li.skill-chip');
                        chips.forEach((chip, chipIndex) => {
                            if (!prefersReducedMotion) {
                                setTimeout(() => {
                                    chip.classList.add('animate-scale-up');
                                }, chipAnimationBaseDelay + (chipIndex * 80));
                            }
                        });
                        if (!prefersReducedMotion) {
                            chipAnimationBaseDelay += chips.length * 80;
                        }
                    });
                    sectionAnimationApplied = true;
                } else if (section.id === 'about') {
                    if (!prefersReducedMotion) {
                        section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                        const paragraphs = section.querySelectorAll('.about-me-card p');
                        paragraphs.forEach((p, index) => {
                            p.style.opacity = '0';
                            p.style.animation = `revealTextCascade 0.7s ease-out forwards ${index * 0.2 + 0.4}s`;
                        });
                    } else {
                        section.style.opacity = '1';
                        const paragraphs = section.querySelectorAll('.about-me-card p');
                        paragraphs.forEach(p => p.style.opacity = '1');
                    }
                    sectionAnimationApplied = true;
                } else if (section.id === 'projects') { // Experience section animation removed
                    if (!prefersReducedMotion) {
                        section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                        const projectCards = section.querySelectorAll('.project-card');
                        projectCards.forEach((card, index) => {
                            card.style.opacity = '0';
                            card.style.animation = `cardEntrance 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.15 + 0.5}s`;
                        });
                    } else {
                        section.style.opacity = '1';
                        const projectCards = section.querySelectorAll('.project-card');
                        projectCards.forEach(card => card.style.opacity = '1');
                    }
                    sectionAnimationApplied = true;
                } else if (section.id === 'education' || section.id === 'contact') {
                    const sectionAppearDelay = (section.id === 'education') ? 0.2 : 0;
                    if (!prefersReducedMotion) {
                        section.style.animation = `contentSectionAppear 1s ease-out forwards ${sectionAppearDelay}s`;
                        const innerCards = section.querySelectorAll('.content-card');
                        innerCards.forEach((card, cardIndex) => {
                            card.style.opacity = '0';
                            const cardBaseAnimationDelay = sectionAppearDelay + 0.4 + (cardIndex * 0.2);
                            card.style.animation = `cardEntrance 0.7s ease-out forwards ${cardBaseAnimationDelay}s`;
                            let contentAnimDelay = cardBaseAnimationDelay + 0.3;
                            if (section.id === 'education') {
                                const titleElement = card.querySelector('h3'); // Corrected from h4
                                if (titleElement) {
                                    titleElement.style.opacity = '0';
                                    titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                const paragraphElement = card.querySelector('.education-details-card p');
                                if (paragraphElement) {
                                    paragraphElement.style.opacity = '0';
                                    paragraphElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                const listItemElements = card.querySelectorAll('.certifications-list-card ul li');
                                if (listItemElements.length > 0) {
                                    listItemElements.forEach((li, liIndex) => {
                                        li.style.opacity = '0';
                                        li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay + (liIndex * 0.1)}s`;
                                    });
                                }
                            } else if (section.id === 'contact' && card.classList.contains('connect-with-me-card')) {
                                // const titleElement = card.querySelector('h2'); // h2 is outside card now
                                const paragraphElement = card.querySelector('p'); // This p might not exist anymore
                                const buttonListItems = card.querySelectorAll('ul li');
                                // if (titleElement) {
                                // titleElement.style.opacity = '0';
                                // titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                // contentAnimDelay += 0.15;
                                // }
                                if (paragraphElement) {
                                    paragraphElement.style.opacity = '0';
                                    paragraphElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                buttonListItems.forEach((li, liIndex) => {
                                    li.style.opacity = '0';
                                    li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay + (liIndex * 0.1)}s`;
                                });
                            }
                        });
                    } else {
                        section.style.opacity = '1';
                        const innerCards = section.querySelectorAll('.content-card');
                        innerCards.forEach(card => {
                            card.style.opacity = '1';
                            const titleElementH3 = card.querySelector('h3'); // Corrected from h4
                            if (titleElementH3) titleElementH3.style.opacity = '1';
                            const paragraphElement = card.querySelector('p');
                            if (paragraphElement) paragraphElement.style.opacity = '1';
                            // const titleElementH2 = card.querySelector('h2');
                            // if (titleElementH2) titleElementH2.style.opacity = '1';
                            card.querySelectorAll('ul li').forEach(li => li.style.opacity = '1');
                        });
                    }
                    sectionAnimationApplied = true;
                }

                if (!sectionAnimationApplied && section.style.animation === '' && !prefersReducedMotion && section.id !== 'experience') { // Do not apply generic animation to experience section
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                } else if (prefersReducedMotion && section.style.animation !== '') {
                    section.style.animation = 'none';
                }
                observerInstance.unobserve(section);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        if (section.id !== 'experience') { // Exclude experience section from main observer if it will be handled by timelineObserver
            sectionObserver.observe(section);
        }
    });

    const scrollTopButton = document.querySelector('.scroll-to-top');
    if (scrollTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }
        });
        scrollTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const headerElement = document.querySelector('header');
    const animatedNameElement = document.querySelector('.animated-name');
    if (headerElement && animatedNameElement) {
        const chars = Array.from(animatedNameElement.children);
        const maxRotate = 8;
        headerElement.addEventListener('mousemove', (e) => {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                chars.forEach(char => {
                    const charStyle = window.getComputedStyle(char);
                    if (parseFloat(charStyle.opacity) > 0.95) {
                        char.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                    }
                });
                return;
            }
            const rect = headerElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const deltaX = (mouseX - centerX) / centerX;
            const deltaY = (mouseY - centerY) / centerY;
            const rotateY = deltaX * maxRotate;
            const rotateX = -deltaY * maxRotate;
            chars.forEach(char => {
                const charStyle = window.getComputedStyle(char);
                if (parseFloat(charStyle.opacity) > 0.95) {
                    char.style.transform = `translateY(0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
                }
            });
        });
        headerElement.addEventListener('mouseleave', () => {
            chars.forEach(char => {
                const charStyle = window.getComputedStyle(char);
                if (parseFloat(charStyle.opacity) > 0.95) {
                    char.style.transform = `translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
                }
            });
        });
    }

    // Timeline items animation (Vertical)
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

    // Timeline axis animation (Vertical)
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

    // --- Horizontal Timeline Navigation ---
    const horizontalTimelineWrapper = document.querySelector('.timeline-items-wrapper');
    const prevButton = document.querySelector('.timeline-nav-prev');
    const nextButton = document.querySelector('.timeline-nav-next');

    if (horizontalTimelineWrapper && prevButton && nextButton) {
        const getItemScrollAmount = () => {
            const firstItem = horizontalTimelineWrapper.querySelector('.horizontal-timeline-item');
            if (firstItem) {
                const style = window.getComputedStyle(firstItem);
                const marginRight = parseFloat(style.marginRight) || 0;
                return firstItem.offsetWidth + marginRight; 
            }
            return 340; // Fallback: assumes item width ~320px + margin ~20px
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
                // console.log("H_DEBUG: No significant overflow, disabling both buttons.");
                return;
            }

            const maxScrollLeft = scrollWidth - clientWidth;
            // Calculate meaningfulScrollPortion inside, as getItemScrollAmount might depend on elements being visible/ready
            const meaningfulScrollPortion = getItemScrollAmount() / 4; 

            // Default states based on absolute boundaries
            let isPrevDisabled = scrollLeft <= 0;
            let isNextDisabled = scrollLeft >= maxScrollLeft;

            // Refinement: Disable 'Next' if remaining scroll is less than a meaningful portion.
            if (!isNextDisabled && (maxScrollLeft - scrollLeft) < meaningfulScrollPortion) {
                // console.log(`H_DEBUG: Next button would be active (scrollLeft=${scrollLeft}, maxScrollLeft=${maxScrollLeft}), but remaining scroll (${maxScrollLeft - scrollLeft}px) is less than meaningful portion (${meaningfulScrollPortion}px). Disabling Next.`);
                isNextDisabled = true;
            }

            // Refinement: Disable 'Prev' if scroll distance from start is less than a meaningful portion.
            if (!isPrevDisabled && scrollLeft < meaningfulScrollPortion) {
                // console.log(`H_DEBUG: Prev button would be active (scrollLeft=${scrollLeft}), but scroll amount (${scrollLeft}px) is less than meaningful portion (${meaningfulScrollPortion}px). Disabling Prev.`);
                isPrevDisabled = true;
            }
            
            prevButton.disabled = isPrevDisabled;
            nextButton.disabled = isNextDisabled;
            // console.log(`H_DEBUG: Final states: prev.disabled=${prevButton.disabled}, next.disabled=${nextButton.disabled}, scrollLeft=${scrollLeft}, maxScrollLeft=${maxScrollLeft}, meaningfulScrollPortion=${meaningfulScrollPortion}`);
        };

        prevButton.addEventListener('click', () => {
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') {
                return; // Do nothing if hidden
            }
            horizontalTimelineWrapper.scrollLeft -= getItemScrollAmount();
            setTimeout(updateNavButtonStates, 550); 
        });

        nextButton.addEventListener('click', () => {
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') {
                return; // Do nothing if hidden
            }
            horizontalTimelineWrapper.scrollLeft += getItemScrollAmount();
            setTimeout(updateNavButtonStates, 550);
        });

        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        };

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(debounce(updateNavButtonStates, 150));
            resizeObserver.observe(horizontalTimelineWrapper);
        } else {
            window.addEventListener('resize', debounce(updateNavButtonStates, 200));
        }
        
        horizontalTimelineWrapper.addEventListener('scroll', debounce(updateNavButtonStates, 100));

        const attemptInitialUpdate = (retries = 5, delay = 250) => { 
            // console.log(`H_DEBUG: Attempting initial update. Retries left: ${retries}`);
            updateNavButtonStates(); // Update based on current dimensions first
            
            const scrollWidth = horizontalTimelineWrapper.scrollWidth;
            const clientWidth = horizontalTimelineWrapper.clientWidth;
            const itemCount = horizontalTimelineWrapper.querySelectorAll('.horizontal-timeline-item').length;
            const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
            
            if (!horizontalContainer || window.getComputedStyle(horizontalContainer).display === 'none') {
                // If hidden, no need to retry, current (disabled) state set by updateNavButtonStates is fine.
                // console.log("H_DEBUG: Horizontal container hidden, initial update aborted.");
                return;
            }

            // Estimate minimum expected scrollWidth. (Assumes items are at least ~300px wide on average)
            // This helps ensure we wait if, e.g., 5 items are present but scrollWidth is only showing width for 2.
            const estimatedMinItemRenderedWidth = 300; // A conservative estimate of an item's width
            const minimumExpectedScrollWidth = itemCount * estimatedMinItemRenderedWidth;

            // Condition for retrying:
            // 1. There are multiple items (potential for scrolling).
            // 2. The current scrollWidth is less than the estimated minimum for all items, OR
            //    the scrollWidth indicates no overflow is currently possible (scrollWidth <= clientWidth).
            // 3. We still have retries left.
            if (itemCount > 1 &&
                (scrollWidth < minimumExpectedScrollWidth || scrollWidth <= clientWidth) && 
                retries > 0) {
                // console.log(`H_DEBUG: Retrying initial update. scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, minimumExpectedScrollWidth=${minimumExpectedScrollWidth}, itemCount=${itemCount}`);
                setTimeout(() => attemptInitialUpdate(retries - 1, delay), delay);
            } else {
                // console.log("H_DEBUG: Initial update deemed final or retries exhausted / conditions for retry not met.");
                // Perform a final update in case dimensions changed slightly during the last timeout
                // without triggering a retry but before this 'else' block.
                if (retries < 5) { // Only call if at least one retry attempt happened or was considered
                     updateNavButtonStates();
                }
            }
        };

        const horizontalContainer = horizontalTimelineWrapper.closest('.experience-horizontal-container');
        if (horizontalContainer && window.getComputedStyle(horizontalContainer).display !== 'none') {
             requestAnimationFrame(() => { // Use requestAnimationFrame for initial call after layout
                attemptInitialUpdate();
            });
        } else {
            // If starting hidden (e.g. on mobile), still set initial button states correctly.
            updateNavButtonStates();
        }
         // Fallback: A simple call for very initial state, might be overridden by attemptInitialUpdate
        setTimeout(updateNavButtonStates, 50);
    }

    // --- Horizontal Timeline Item Entrance Animation ---
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

    // --- ARIA Management for Responsive Timelines ---
    const verticalContainerForAria = document.querySelector('.experience-vertical-container');
    const horizontalContainerForAria = document.querySelector('.experience-horizontal-container');

    function manageTimelineAriaStates() {
        if (!verticalContainerForAria || !horizontalContainerForAria) {
            // console.warn("Timeline containers for ARIA management not found.");
            return;
        }
        // Check the media query that also controls display in CSS
        const isMobileView = window.matchMedia('(max-width: 992px)').matches;

        if (isMobileView) {
            verticalContainerForAria.removeAttribute('aria-hidden');
            horizontalContainerForAria.setAttribute('aria-hidden', 'true');
            // console.log("ARIA: Vertical active, Horizontal hidden");
        } else {
            horizontalContainerForAria.removeAttribute('aria-hidden');
            verticalContainerForAria.setAttribute('aria-hidden', 'true');
            // console.log("ARIA: Horizontal active, Vertical hidden");
        }
    }

    // Initial call to set ARIA states on page load
    manageTimelineAriaStates();

    // Update ARIA states on window resize (debounced)
    // Assumes 'debounce' function is defined earlier in script.js (it was with horizontal nav logic)
    // Making sure debounce is available or providing a fallback.
    let debounceFunc;
    if (typeof debounce === 'function') { // Check if debounce from nav logic is available
        debounceFunc = debounce;
    } else { 
        // Fallback basic debounce if 'debounce' from nav logic is somehow not in scope
        // console.warn("Debounce function not found, using basic fallback for ARIA resize listener.");
        debounceFunc = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        };
    }
    window.addEventListener('resize', debounceFunc(manageTimelineAriaStates, 200));
    
});

const themeToggleButton = document.getElementById('theme-toggle');
const bodyElement = document.body;
const applyTheme = (theme) => {
    if (theme === 'light') {
        bodyElement.classList.add('light-mode');
    } else {
        bodyElement.classList.remove('light-mode');
    }
};
let currentTheme = localStorage.getItem('theme') || 'dark';
applyTheme(currentTheme);
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        bodyElement.classList.toggle('light-mode');
        if (bodyElement.classList.contains('light-mode')) {
            currentTheme = 'light';
        } else {
            currentTheme = 'dark';
        }
        localStorage.setItem('theme', currentTheme);
    });
}
