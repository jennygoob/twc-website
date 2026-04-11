/* ============================================
   THE WELLNESS CO. — Shared JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     1. MOBILE HAMBURGER MENU
     ============================================ */
  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var overlay = document.querySelector('.mobile-nav-overlay');

    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.classList.add('is-active');
      mobileNav.classList.add('is-open');
      if (overlay) {
        overlay.style.display = 'block';
        // Force reflow then transition
        overlay.offsetHeight;
        overlay.classList.add('is-visible');
      }
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('is-active');
      mobileNav.classList.remove('is-open');
      if (overlay) {
        overlay.classList.remove('is-visible');
        setTimeout(function () {
          overlay.style.display = 'none';
        }, 350);
      }
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (mobileNav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on overlay click
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Close on link click inside mobile nav
    var mobileLinks = mobileNav.querySelectorAll('a:not(.mobile-nav-toggle)');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Mobile nav accordion groups (both .mobile-nav-toggle and [data-toggle-sub])
    var toggles = mobileNav.querySelectorAll('.mobile-nav-toggle, [data-toggle-sub]');
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var group = this.closest('.mobile-nav-group');
        if (group) {
          group.classList.toggle('is-open');
        }
      });
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ============================================
     2. DROPDOWN NAVIGATION (Desktop hover / Mobile tap)
     ============================================ */
  function initDropdownNav() {
    var navItems = document.querySelectorAll('.nav-item');
    var hoverTimeout;

    navItems.forEach(function (item) {
      var dropdown = item.querySelector('.nav-dropdown, .nav-mega');
      if (!dropdown) return;

      // Desktop: hover with slight delay
      item.addEventListener('mouseenter', function () {
        clearTimeout(hoverTimeout);
        // Close all other dropdowns first
        navItems.forEach(function (other) {
          if (other !== item) other.classList.remove('is-open');
        });
        item.classList.add('is-open');
      });

      item.addEventListener('mouseleave', function () {
        hoverTimeout = setTimeout(function () {
          item.classList.remove('is-open');
        }, 150);
      });

      // Prevent the delay from closing when entering dropdown
      if (dropdown) {
        dropdown.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimeout);
        });
      }
    });

    // Close all dropdowns when clicking outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item')) {
        navItems.forEach(function (item) {
          item.classList.remove('is-open');
        });
      }
    });
  }

  /* ============================================
     3. ANIMATED COUNTERS (IntersectionObserver)
     ============================================ */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var suffix = el.getAttribute('data-counter-suffix') || '';
      var prefix = el.getAttribute('data-counter-prefix') || '';
      var duration = parseInt(el.getAttribute('data-counter-duration'), 10) || 2000;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out quad
        var eased = 1 - (1 - progress) * (1 - progress);
        var current = Math.floor(eased * (target - start) + start);
        el.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      counters.forEach(function (counter) {
        observer.observe(counter);
      });
    } else {
      // Fallback: just set the values
      counters.forEach(function (counter) {
        var target = counter.getAttribute('data-counter');
        var suffix = counter.getAttribute('data-counter-suffix') || '';
        var prefix = counter.getAttribute('data-counter-prefix') || '';
        counter.textContent = prefix + parseInt(target, 10).toLocaleString() + suffix;
      });
    }
  }

  /* ============================================
     4. SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================ */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var navHeight = document.querySelector('nav')
        ? document.querySelector('nav').offsetHeight
        : 0;

      var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth',
      });

      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  }

  /* ============================================
     5. STICKY NAV — visual change on scroll
     ============================================ */
  function initStickyNav() {
    var nav = document.querySelector('nav');
    if (!nav) return;

    var scrollThreshold = 80;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }

    // Use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Run once on load
    onScroll();
  }

  /* ============================================
     6. FAQ ACCORDION
     ============================================ */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close all others (single-open behavior)
        faqItems.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            var otherAnswer = other.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = '0';
          }
        });

        // Toggle current
        if (isOpen) {
          item.classList.remove('is-open');
          answer.style.maxHeight = '0';
        } else {
          item.classList.add('is-open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* ============================================
     7. DIFFERENTIATOR SLIDER
     ============================================ */
  function initDiffSlider() {
    var slider = document.querySelector('.diff-slider');
    if (!slider) return;

    var track = slider.querySelector('.diff-slider-track');
    var dots = slider.querySelectorAll('.diff-dot');
    var current = 0;
    var total = dots.length;
    var autoplayInterval;

    function goTo(index) {
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (dot, i) {
        if (i === current) {
          dot.classList.add('active');
          dot.style.background = '#D4BE8E';
          dot.style.width = '24px';
          dot.style.borderRadius = '3px';
          dot.style.opacity = '1';
        } else {
          dot.classList.remove('active');
          dot.style.background = 'rgba(255,255,255,0.25)';
          dot.style.opacity = '1';
          dot.style.width = '6px';
          dot.style.borderRadius = '50%';
        }
      });
    }

    // Dot clicks
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-slide'), 10);
        goTo(idx);
        resetAutoplay();
      });
    });

    // Autoplay
    function startAutoplay() {
      autoplayInterval = setInterval(function () {
        goTo((current + 1) % total);
      }, 8000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }

    // Touch/swipe support
    var startX = 0;
    var isDragging = false;

    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      isDragging = false;
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && current < total - 1) {
          goTo(current + 1);
        } else if (diff < 0 && current > 0) {
          goTo(current - 1);
        }
        resetAutoplay();
      }
    }, { passive: true });

    startAutoplay();
  }

  /* ============================================
     8. SERVICE TABS
     ============================================ */
  function initServiceTabs() {
    var tabs = document.querySelectorAll('.svc-tab');
    var panels = document.querySelectorAll('.svc-panel');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');

        // Update tab styles
        tabs.forEach(function (t) {
          t.classList.remove('active');
          t.style.background = 'transparent';
          t.style.color = '#6B6560';
          t.style.borderColor = 'rgba(0,0,0,0.1)';
        });
        this.classList.add('active');
        this.style.background = '#1A1A1A';
        this.style.color = '#FFFFFF';
        this.style.borderColor = '#C6A96C';

        // Fade out current, then swap
        var activePanel = document.querySelector('.svc-panel[style*="display: grid"], .svc-panel.active');
        if (activePanel) {
          activePanel.classList.add('fade-out');
          setTimeout(function () {
            panels.forEach(function (p) {
              if (p.getAttribute('data-panel') === target) {
                p.style.display = 'grid';
                p.classList.remove('fade-out');
              } else {
                p.style.display = 'none';
                p.classList.remove('fade-out');
              }
            });
          }, 200);
        } else {
          panels.forEach(function (p) {
            if (p.getAttribute('data-panel') === target) {
              p.style.display = 'grid';
            } else {
              p.style.display = 'none';
            }
          });
        }
      });
    });
  }

  /* ============================================
     9. PORTAL MOCKUP ANIMATIONS
     ============================================ */
  function initPortalMockup() {
    var bioAgeEl = document.getElementById('bio-age-counter');
    if (!bioAgeEl) return;

    // Scrolling number counter for biological age — slow, deliberate
    var counted = false;
    function countUp() {
      if (counted) return;
      counted = true;
      var target = 51;
      var duration = 3500;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Slow ease — accelerates then decelerates
        var eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        var current = Math.floor(eased * target);
        bioAgeEl.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          bioAgeEl.textContent = target;
        }
      }
      requestAnimationFrame(step);
    }

    // Trigger when portal mockup is well into view
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Small delay so the user has settled on the section
            setTimeout(countUp, 600);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(document.getElementById('portal-mockup'));
    } else {
      countUp();
    }

    // Protocol bar animation — cycles through states
    var protocolBar = document.getElementById('protocol-bar');
    if (protocolBar) {
      var protocolText = document.getElementById('protocol-text');
      var protocolStatus = document.getElementById('protocol-status');
      var protocolLabel = document.getElementById('protocol-status-label');
      var protocolProgress = document.getElementById('protocol-progress');

      var states = [
        { text: 'Hormone + Peptide + Nutrition', label: 'Last Updated', status: '3 days ago' },
        { text: 'New labs detected...', label: 'Status', status: 'Analyzing' },
        { text: 'Thyroid trending borderline \u2192 adjusting protocol', label: 'Status', status: 'Updating' },
        { text: 'Testosterone dosage adjusted \u2022 B12 added \u2022 Ashwagandha increased', label: 'Status', status: 'Updated just now' },
        { text: 'Hormone + Peptide + Nutrition', label: 'Last Updated', status: 'Just now' },
      ];

      var stateIndex = 0;
      var protocolStarted = false;

      function cycleProtocol() {
        if (!protocolStarted) return;
        stateIndex = (stateIndex + 1) % states.length;
        var s = states[stateIndex];

        // Fade out
        protocolText.style.opacity = '0';
        protocolStatus.style.opacity = '0';
        protocolLabel.style.opacity = '0';

        // Show progress bar during "analyzing/updating" states
        if (stateIndex === 1 || stateIndex === 2) {
          protocolProgress.style.width = '100%';
        } else {
          protocolProgress.style.transition = 'none';
          protocolProgress.style.width = '0';
          setTimeout(function () { protocolProgress.style.transition = 'width 1.5s ease-in-out'; }, 50);
        }

        setTimeout(function () {
          protocolText.textContent = s.text;
          protocolLabel.textContent = s.label;
          protocolStatus.textContent = s.status;
          protocolText.style.opacity = '1';
          protocolStatus.style.opacity = '1';
          protocolLabel.style.opacity = '1';
        }, 400);

        // Time between states: longer pause on final "settled" state
        var delay = (stateIndex === 0 || stateIndex === 4) ? 6000 : 3000;
        setTimeout(cycleProtocol, delay);
      }

      // Start when scrolled into view
      if ('IntersectionObserver' in window) {
        var protocolObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !protocolStarted) {
              protocolStarted = true;
              setTimeout(cycleProtocol, 4000);
              protocolObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        protocolObserver.observe(protocolBar);
      }
    }

    // Hover effects on biomarker cards
    var bioCards = document.querySelectorAll('.bio-card');
    bioCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        this.style.background = '#FFFFFF';
        var svg = this.querySelector('svg polyline');
        if (svg) {
          svg.setAttribute('stroke-width', '2.5');
          svg.setAttribute('opacity', '1');
        }
      });
      card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
        this.style.background = 'var(--cream)';
        var svg = this.querySelector('svg polyline');
        if (svg) {
          svg.setAttribute('stroke-width', '1.5');
          svg.setAttribute('opacity', svg.getAttribute('stroke') === '#C6A96C' ? '0.6' : '0.3');
        }
      });
    });
  }

  /* ============================================
     10. CLUB BANNER — Inject + Animate
     ============================================ */
  function initClubBanner() {
    /* If the page already has the old inline club banner (homepage), skip injection */
    var existing = document.getElementById('club-slider');
    if (existing) {
      /* Upgrade old homepage banner: use new class-based approach */
      var oldSlides = existing.querySelectorAll('.club-slide');
      var oldDots = document.querySelectorAll('.club-dot');
      if (oldSlides.length) runClubSlider(oldSlides, oldDots);
      return;
    }

    /* Find the final CTA section to insert before */
    var allSections = document.querySelectorAll('section, div[style*="padding"]');
    var finalCTA = null;
    /* Look for the last dark section before footer */
    var footer = document.querySelector('footer');
    if (!footer) return;
    var prev = footer.previousElementSibling;
    /* Walk back to find the mobile-cta-bar, then the actual final CTA */
    while (prev && (prev.classList.contains('mobile-cta-bar') || prev.tagName === 'SCRIPT')) {
      prev = prev.previousElementSibling;
    }
    if (prev) finalCTA = prev;
    if (!finalCTA) return;

    /* Build the banner */
    var banner = document.createElement('div');
    banner.className = 'club-banner reveal';
    banner.innerHTML = '<div class="container">' +
      '<div class="club-eyebrow">The Wellness Co. <em>Club</em></div>' +
      '<div class="club-slider">' +
        '<div class="club-slide is-active"><p>Smoother skin from your Botox today, <em>rejuvenated at the cellular level with weekly B12 all month.</em></p></div>' +
        '<div class="club-slide"><p>Full-body reset from your IV today, <em>deepened with 4 sauna sessions all month.</em></p></div>' +
        '<div class="club-slide"><p>Pain relief from your SoftWave today, <em>mapped by a full-body thermography scan for precision.</em></p></div>' +
        '<div class="club-slide"><p>Collagen production from your DermaPen today, <em>enhanced with red light stimulation all month.</em></p></div>' +
      '</div>' +
      '<div class="club-dots"></div>' +
      '<a href="/clarity/consultation" class="club-link">Join the Club &rarr;</a>' +
    '</div>';

    /* Create dots */
    var dotsContainer = banner.querySelector('.club-dots');
    for (var i = 0; i < 4; i++) {
      var dot = document.createElement('button');
      dot.className = 'club-dot' + (i === 0 ? ' is-active' : '');
      dotsContainer.appendChild(dot);
    }

    /* Insert before the final CTA */
    finalCTA.parentNode.insertBefore(banner, finalCTA);

    /* Init the slider */
    var slides = banner.querySelectorAll('.club-slide');
    var dots = banner.querySelectorAll('.club-dot');
    runClubSlider(slides, dots);
  }

  function runClubSlider(slides, dots) {
    if (!slides.length) return;
    var current = 0;
    var total = slides.length;

    function goTo(index) {
      current = index;
      slides.forEach(function(s, i) {
        s.style.opacity = i === current ? '1' : '0';
        if (s.classList) {
          s.classList.toggle('is-active', i === current);
          s.classList.toggle('club-slide-active', i === current);
        }
      });
      dots.forEach(function(d, i) {
        d.style.opacity = i === current ? '1' : '0.3';
        if (d.classList) {
          d.classList.toggle('is-active', i === current);
          d.classList.toggle('club-dot-active', i === current);
        }
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        goTo(i);
        clearInterval(interval);
        startAutoplay();
      });
    });

    var interval;
    function startAutoplay() {
      interval = setInterval(function() {
        goTo((current + 1) % total);
      }, 8000);
    }
    startAutoplay();
  }

  /* ============================================
     11. SCROLL REVEAL — IntersectionObserver
     ============================================ */
  function initScrollReveal() {
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      /* Fallback: show everything immediately */
      revealEls.forEach(function(el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(function(el) { observer.observe(el); });
  }

  /* ============================================
     12. PARALLAX — Lightweight scroll offset
     ============================================ */
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var scrollY = window.pageYOffset;
          els.forEach(function(el) {
            var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
            var rect = el.getBoundingClientRect();
            var center = rect.top + rect.height / 2;
            var offset = (center - window.innerHeight / 2) * speed;
            el.style.transform = 'translateY(' + offset + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================
     13. BACK TO TOP BUTTON
     ============================================ */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 800) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     PROMO BANNER — Site-wide promotional bar
     ============================================ */
  function initPromoBanner() {
    // Don't show if dismissed this session
    if (sessionStorage.getItem('promo-banner-dismissed')) return;

    var banner = document.createElement('div');
    banner.id = 'promo-banner';
    banner.innerHTML = '<div class="promo-banner-inner">' +
      '<span class="promo-banner-text">' +
        '<strong>Free Lab Review</strong> — Upload your labs and see what your doctor didn\u2019t tell you.' +
      '</span>' +
      '<a href="https://app.urwellness.co/second-opinion" class="promo-banner-cta">Get Your Free Analysis</a>' +
      '<button class="promo-banner-close" aria-label="Close">&times;</button>' +
    '</div>';

    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('has-promo-banner');

    banner.querySelector('.promo-banner-close').addEventListener('click', function () {
      banner.style.transform = 'translateY(-100%)';
      document.body.classList.remove('has-promo-banner');
      sessionStorage.setItem('promo-banner-dismissed', '1');
      setTimeout(function () { banner.remove(); }, 300);
    });
  }

  /* ============================================
     INIT — Run on DOMContentLoaded
     ============================================ */
  function init() {
    initPromoBanner();
    initMobileNav();
    initDropdownNav();
    initCounters();
    initSmoothScroll();
    initStickyNav();
    initFaqAccordion();
    initDiffSlider();
    initServiceTabs();
    initPortalMockup();
    initClubBanner();
    initScrollReveal();
    initParallax();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
