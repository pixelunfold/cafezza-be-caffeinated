/* --------------------------------------------------
       INTERACTIVE SCRIPTS BLOCK
       -------------------------------------------------- */
    $(document).ready(function () {

      // 1. MOBILE DRAWER NAVIGATION
      const $menuTrigger = $('#menuTrigger');
      const $mobileNav = $('#mobileNav');
      const $mobileOverlay = $('#mobileOverlay');
      const $mobileLinks = $('.mobile-nav-item');
      const $mobileNavClose = $('#mobileNavClose');

      function toggleMobileMenu() {
        $menuTrigger.toggleClass('open');
        $mobileNav.toggleClass('open');
        $mobileOverlay.toggleClass('visible');
        $('body').toggleClass('no-scroll');
      }

      $menuTrigger.on('click', toggleMobileMenu);
      $mobileOverlay.on('click', toggleMobileMenu);
      $mobileNavClose.on('click', toggleMobileMenu);
      $mobileLinks.on('click', function () {
        if ($mobileNav.hasClass('open')) {
          toggleMobileMenu();
        }
      });


      // 2. HEADER SHRINK & BLUR EFFECT ON SCROLL
      const $header = $('#mainHeader');
      $(window).on('scroll', function () {
        if ($(window).scrollTop() > 50) {
          $header.addClass('scrolled');
        } else {
          $header.removeClass('scrolled');
        }
      });


      // 3. SMOOTH SCROLLING NAV INTERACTION & ACTIVE STATE HIGHLIGHT
      const sections = $('section, header, footer');
      const navItems = $('.nav-item');

      $(window).on('scroll', function () {
        const scrollPos = $(window).scrollTop() + 120; // offset for sticky header

        sections.each(function () {
          const top = $(this).offset().top;
          const bottom = top + $(this).outerHeight();
          const id = $(this).attr('id');

          if (id && scrollPos >= top && scrollPos <= bottom) {
            const $targetItem = $(`.nav-item[href="#${id}"]`);
            if ($targetItem.length) {
              navItems.removeClass('active');
              $targetItem.addClass('active');
            }
          }
        });
      });


      // 4. SIGNATURE MENU TAB SWITCHING
      $('.tab-btn').on('click', function () {
        const targetGridId = $(this).data('target');

        // Remove active class from buttons & grids
        $('.tab-btn').removeClass('active');
        $('.menu-grid').removeClass('active');

        // Add active state to clicked elements
        $(this).addClass('active');
        $(`#${targetGridId}`).addClass('active');
      });


      // 5. TESTIMONIALS CAROUSEL SLIDER LOGIC
      const $track = $('#reviewsTrack');
      const $slides = $('.review-slide');
      const $dotsContainer = $('#carouselDots');
      let currentSlideIndex = 0;
      const totalSlides = $slides.length;
      let autoSlideTimer;

      // Render indicator dots dynamically based on slide count
      $slides.each(function (index) {
        $dotsContainer.append(`<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`);
      });

      const $dots = $('.dot');

      function updateCarouselPosition() {
        const offset = -currentSlideIndex * 100;
        $track.css('transform', `translateX(${offset}%)`);

        // Update active slide class for scaling and opacity animations
        $slides.removeClass('active-slide');
        $slides.eq(currentSlideIndex).addClass('active-slide');

        // Update active dot indicators
        $dots.removeClass('active');
        $dots.eq(currentSlideIndex).addClass('active');
      }

      function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateCarouselPosition();
      }

      function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
        updateCarouselPosition();
      }

      // Action triggers
      $('#nextBtn').on('click', function () {
        nextSlide();
        resetAutoSlide();
      });

      $('#prevBtn').on('click', function () {
        prevSlide();
        resetAutoSlide();
      });

      $dots.on('click', function () {
        currentSlideIndex = $(this).data('index');
        updateCarouselPosition();
        resetAutoSlide();
      });

      // Auto-slide loops
      function startAutoSlide() {
        autoSlideTimer = setInterval(nextSlide, 6000);
      }

      // Reset auto-slide timer
      function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        startAutoSlide();
      }

      // Initialize slide state
      updateCarouselPosition();
      startAutoSlide();


      // 6. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            $(entry.target).addClass('active');
            observer.unobserve(entry.target); // Stop observing after animated
          }
        });
      }, observerOptions);

      $('.reveal').each(function () {
        observer.observe(this);
      });


      // 7. RESERVATION FORM HANDLING & WHATSAPP BUILDER
      const $form = $('#reservationForm');
      const $overlay = $('#successOverlay');
      const $successMessage = $('#successMessage');

      // Helper function to sanitize user input to prevent XSS script injection
      function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function (match) {
          const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
          };
          return map[match];
        });
      }

      // Date constraints - restrict booking to today or future dates
      const today = new Date().toISOString().split('T')[0];
      $('#reserveDate').attr('min', today);

      // Submit Form (Merges validation, WhatsApp redirection, and visual success confirmation)
      $form.on('submit', function (e) {
        e.preventDefault();

        const name = $('#fullName').val();
        const phone = $('#phoneNumber').val();
        const date = $('#reserveDate').val();
        const time = $('#reserveTime').val();
        const guests = $('#guestCount').val();
        const request = $('#specialRequest').val() || "None";

        const escapedName = escapeHTML(name);
        const escapedGuests = escapeHTML(guests);
        const escapedDate = escapeHTML(date);
        const escapedTime = escapeHTML(time);

        // Display summary text inside success modal (Safely escaped parameters)
        $successMessage.html(`Thank you, <strong>${escapedName}</strong>! We have initiated your WhatsApp booking request for <strong>${escapedGuests}</strong> on <strong>${escapedDate}</strong> at <strong>${escapedTime}</strong>.<br><br>If the WhatsApp chat window did not open automatically, you can also reach us directly at <strong>+91 98790 00097</strong>.`);

        // Show success modal overlay
        $overlay.addClass('visible');

        // Formulate WhatsApp message text
        let waText = `Hi Cafezza! I'd like to book a table:\n\n`;
        waText += `• Name: ${name}\n`;
        waText += `• Phone: ${phone}\n`;
        waText += `• Date: ${date}\n`;
        waText += `• Time: ${time}\n`;
        waText += `• Guests: ${guests}\n`;
        if (request && request !== "None") {
          waText += `• Special Request: ${request}\n`;
        }

        const encodedText = encodeURIComponent(waText);

        // Open WhatsApp chat in a new tab after a brief delay
        setTimeout(function () {
          window.open(`https://wa.me/919879000097?text=${encodedText}`, '_blank');
        }, 300);

        // Reset the form input fields
        $form[0].reset();
      });

      // Close modal popup trigger
      $('#closeSuccessBtn').on('click', function () {
        $overlay.removeClass('visible');
      });

    });
