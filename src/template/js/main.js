/* ===================================================================
 * Mueller 1.0.0 - Main JS
 *
 * ------------------------------------------------------------------- */

(function(html) {

    'use strict';

    const cfg = {
        
        // MailChimp URL
        mailChimpURL : 'https://facebook.us1.list-manage.com/subscribe/post?u=1abf75f6981256963a47d197a&amp;id=37c6d8f4d6' 

    };


   /* preloader
    * -------------------------------------------------- */
    const ssPreloader = function() {

        const siteBody = document.querySelector('body');
        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        html.classList.add('ss-preload');
        
        window.addEventListener('load', function() {
            html.classList.remove('ss-preload');
            html.classList.add('ss-loaded');

            preloader.addEventListener('transitionend', function afterTransition(e) {
                if (e.target.matches('#preloader'))  {
                    siteBody.classList.add('ss-show');
                    e.target.style.display = 'none';
                    preloader.removeEventListener(e.type, afterTransition);
                }
            });
        });

        // window.addEventListener('beforeunload' , function() {
        //     siteBody.classList.remove('ss-show');
        // });

    }; // end ssPreloader


   /* move header
    * -------------------------------------------------- */
    const ssMoveHeader = function () {

        const hdr = document.querySelector('.s-header');
        const hero = document.querySelector('#intro');
        let triggerHeight;

        if (!(hdr && hero)) return;

        setTimeout(function() {
            triggerHeight = hero.offsetHeight - 170;
        }, 300);

        window.addEventListener('scroll', function () {

            let loc = window.scrollY;

            if (loc > triggerHeight) {
                hdr.classList.add('sticky');
            } else {
                hdr.classList.remove('sticky');
            }

            if (loc > triggerHeight + 20) {
                hdr.classList.add('offset');
            } else {
                hdr.classList.remove('offset');
            }

            if (loc > triggerHeight + 150) {
                hdr.classList.add('scrolling');
            } else {
                hdr.classList.remove('scrolling');
            }

        });

    }; // end ssMoveHeader


   /* mobile menu
    * ---------------------------------------------------- */ 
    const ssMobileMenu = function() {

        const toggleButton = document.querySelector('.s-header__menu-toggle');
        const mainNavWrap = document.querySelector('.s-header__nav');
        const siteBody = document.querySelector('body');

        if (!(toggleButton && mainNavWrap)) return;

        toggleButton.addEventListener('click', function(event) {
            event.preventDefault();
            toggleButton.classList.toggle('is-clicked');
            siteBody.classList.toggle('menu-is-open');
        });

        mainNavWrap.querySelectorAll('.s-header__nav a').forEach(function(link) {

            link.addEventListener("click", function(event) {

                // at 800px and below
                if (window.matchMedia('(max-width: 800px)').matches) {
                    toggleButton.classList.toggle('is-clicked');
                    siteBody.classList.toggle('menu-is-open');
                }
            });
        });

        window.addEventListener('resize', function() {

            // above 800px
            if (window.matchMedia('(min-width: 801px)').matches) {
                if (siteBody.classList.contains('menu-is-open')) siteBody.classList.remove('menu-is-open');
                if (toggleButton.classList.contains('is-clicked')) toggleButton.classList.remove('is-clicked');
            }
        });

    }; // end ssMobileMenu


    /* highlight active menu link on pagescroll
    * ------------------------------------------------------ */
    const ssScrollSpy = function() {

        const sections = document.querySelectorAll('.target-section');

        // Add an event listener listening for scroll
        window.addEventListener('scroll', navHighlight);

        function navHighlight() {
        
            // Get current scroll position
            let scrollY = window.pageYOffset;
        
            // Loop through sections to get height(including padding and border), 
            // top and ID values for each
            sections.forEach(function(current) {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 50;
                const sectionId = current.getAttribute('id');

               /* If our current scroll position enters the space where current section
                * on screen is, add .current class to parent element(li) of the thecorresponding
                * navigation link, else remove it. To know which link is active, we use
                * sectionId variable we are getting while looping through sections as
                * an selector
                */
                const navLink = document.querySelector('.s-header__nav a[href*=' + sectionId + ']');
                if (!navLink) return;

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.parentNode.classList.add('current');
                } else {
                    navLink.parentNode.classList.remove('current');
                }
            });
        }

    }; // end ssScrollSpy


   /* masonry
    * ------------------------------------------------------ */
     const ssMasonry = function() {

        const containerBricks = document.querySelector('.bricks-wrapper');
        if (!containerBricks) return;

        imagesLoaded(containerBricks, function() {

            const msnry = new Masonry(containerBricks, {
                itemSelector: '.entry',
                columnWidth: '.grid-sizer',
                percentPosition: true,
                resize: true
            });

        });

    }; // end ssMasonry


   /* swiper
    * ------------------------------------------------------ */ 
    const ssSwiper = function() {

        const testimonialsSwiper = new Swiper('.s-testimonials__slider', {

            slidesPerView: 1,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                // when window width is > 400px
                401: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                // when window width is > 800px
                801: {
                    slidesPerView: 2,
                    spaceBetween: 50
                },
                // when window width is > 1180px
                1181: {
                    slidesPerView: 2,
                    spaceBetween: 100
                }
            }
        });

    }; // end ssSwiper


   /* mailchimp form
    * ---------------------------------------------------- */ 
    const ssMailChimpForm = function() {

        const mcForm = document.querySelector('#mc-form');

        if (!mcForm) return;

        // Add novalidate attribute
        mcForm.setAttribute('novalidate', true);

        // Field validation
        function hasError(field) {

            // Don't validate submits, buttons, file and reset inputs, and disabled fields
            if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

            // Get validity
            let validity = field.validity;

            // If valid, return null
            if (validity.valid) return;

            // If field is required and empty
            if (validity.valueMissing) return 'Please enter an email address.';

            // If not the right type
            if (validity.typeMismatch) {
                if (field.type === 'email') return 'Please enter a valid email address.';
            }

            // If pattern doesn't match
            if (validity.patternMismatch) {

                // If pattern info is included, return custom error
                if (field.hasAttribute('title')) return field.getAttribute('title');

                // Otherwise, generic error
                return 'Please match the requested format.';
            }

            // If all else fails, return a generic catchall error
            return 'The value you entered for this field is invalid.';

        };

        // Show error message
        function showError(field, error) {

            // Get field id or name
            let id = field.id || field.name;
            if (!id) return;

            let errorMessage = field.form.querySelector('.mc-status');

            // Update error message
            errorMessage.classList.remove('success-message');
            errorMessage.classList.add('error-message');
            errorMessage.innerHTML = error;

        };

        // Display form status (callback function for JSONP)
        window.displayMailChimpStatus = function (data) {

            // Make sure the data is in the right format and that there's a status container
            if (!data.result || !data.msg || !mcStatus ) return;

            // Update our status message
            mcStatus.innerHTML = data.msg;

            // If error, add error class
            if (data.result === 'error') {
                mcStatus.classList.remove('success-message');
                mcStatus.classList.add('error-message');
                return;
            }

            // Otherwise, add success class
            mcStatus.classList.remove('error-message');
            mcStatus.classList.add('success-message');
        };

        // Submit the form 
        function submitMailChimpForm(form) {

            let url = cfg.mailChimpURL;
            let emailField = form.querySelector('#mce-EMAIL');
            let serialize = '&' + encodeURIComponent(emailField.name) + '=' + encodeURIComponent(emailField.value);

            if (url == '') return;

            url = url.replace('/post?u=', '/post-json?u=');
            url += serialize + '&c=displayMailChimpStatus';

            // Create script with url and callback (if specified)
            var ref = window.document.getElementsByTagName( 'script' )[ 0 ];
            var script = window.document.createElement( 'script' );
            script.src = url;

            // Create global variable for the status container
            window.mcStatus = form.querySelector('.mc-status');
            window.mcStatus.classList.remove('error-message', 'success-message')
            window.mcStatus.innerText = 'Submitting...';

            // Insert script tag into the DOM
            ref.parentNode.insertBefore( script, ref );

            // After the script is loaded (and executed), remove it
            script.onload = function () {
                this.remove();
            };

        };

        // Check email field on submit
        mcForm.addEventListener('submit', function (event) {

            event.preventDefault();

            let emailField = event.target.querySelector('#mce-EMAIL');
            let error = hasError(emailField);

            if (error) {
                showError(emailField, error);
                emailField.focus();
                return;
            }

            submitMailChimpForm(this);

        }, false);

    }; // end ssMailChimpForm


   /* Lightbox
    * ------------------------------------------------------ */
    const ssLightbox = function() {

        // video lightbox
        const videoLightbox = function() {

            const videoLink = document.querySelector('.s-intro__content-video-btn');
            if (!videoLink) return;
    
            videoLink.addEventListener('click', function(event) {
    
                const vLink = this.getAttribute('href');
                const iframe = "<iframe src='" + vLink + "' frameborder='0'></iframe>";
    
                event.preventDefault();
    
                const instance = basicLightbox.create(iframe);
                instance.show()
    
            });
    
        };

        // portfolio lightbox
        const folioLightbox = function() {

            const folioLinks = document.querySelectorAll('.brick .entry__link');
            const modals = [];
    
            folioLinks.forEach(function(link) {
                let modalbox = link.getAttribute('href');
                let instance = basicLightbox.create(
                    document.querySelector(modalbox),
                    {
                        onShow: function(instance) {
                            //detect Escape key press
                            document.addEventListener("keydown", function(event) {
                                event = event || window.event;
                                if (event.key === "Escape") {
                                    instance.close();
                                }
                            });
                        }
                    }
                )
                modals.push(instance);
            });
    
            folioLinks.forEach(function(link, index) {
                link.addEventListener("click", function(event) {
                    event.preventDefault();
                    modals[index].show();
                });
            });
    
        };

        videoLightbox();
        folioLightbox();

    }; // ssLightbox


   /* alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');
  
        boxes.forEach(function(box){

            box.addEventListener('click', function(event) {
                if (event.target.matches('.alert-box__close')) {
                    event.stopPropagation();
                    event.target.parentElement.classList.add('hideit');

                    setTimeout(function(){
                        box.style.display = 'none';
                    }, 500)
                }
            });
        })

    }; // end ssAlertBoxes


   /* visit form
    * ------------------------------------------------------ */
    const ssVisitForm = function() {

        const form = document.querySelector('#visit-form');
        if (!form) return;

        const dateSelect = form.querySelector('#visit-date');
        const timeSelect = form.querySelector('#visit-time');
        const statusBox = form.querySelector('.s-footer__visit-status');
        const submitButton = form.querySelector('button[type="submit"]');
        const nameInput = form.querySelector('#visit-name');
        const phoneInput = form.querySelector('#visit-phone');
        const noteInput = form.querySelector('#visit-note');
        const headquarterSelect = form.querySelector('#visit-headquarter');
        const API_BASE = '/api/calendar';
        const HEADQUARTER_ID = 1;
        const AVAILABILITY_USER_ID = 'landing-page-admin'; // ajuste para um usuário Admin ou Manager
        let slots = [];

        if (!(dateSelect && timeSelect && submitButton && nameInput && phoneInput && headquarterSelect)) return;

        const setStatus = function(message, type = 'info') {
            if (!statusBox) return;
            statusBox.textContent = message || '';
            statusBox.classList.remove('is-success', 'is-error');
            if (type === 'success') statusBox.classList.add('is-success');
            if (type === 'error') statusBox.classList.add('is-error');
        };

        const setLoading = function(isLoading) {
            if (!submitButton) return;
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Enviando...' : 'Enviar';
        };

        const buildOption = function(value, label, placeholder = false) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            if (placeholder) {
                option.disabled = true;
                option.selected = true;
                option.hidden = true;
            }
            return option;
        };

        const populateDates = function() {
            if (!dateSelect || !timeSelect) return;

            dateSelect.innerHTML = '';
            dateSelect.append(buildOption('', 'Selecione a data', true));

            const uniqueDates = [...new Set(slots.map((slot) => slot.date))];
            uniqueDates.forEach(function(dateValue) {
                const label = new Intl.DateTimeFormat('pt-BR', {
                    weekday : 'short',
                    day     : '2-digit',
                    month   : 'short'
                }).format(new Date(dateValue));
                dateSelect.append(buildOption(dateValue, label));
            });

            dateSelect.disabled = uniqueDates.length === 0;

            timeSelect.innerHTML = '';
            timeSelect.append(buildOption('', 'Selecione a data', true));
            timeSelect.disabled = true;

            if (!uniqueDates.length) {
                dateSelect.firstElementChild.textContent = 'Sem datas disponiveis no momento';
            }
        };

        const populateTimes = function(selectedDate) {
            if (!timeSelect) return;

            timeSelect.innerHTML = '';
            timeSelect.append(buildOption('', 'Selecione o horario', true));

            const timesForDate = slots.filter(function(slot) {
                return slot.date === selectedDate;
            });

            timesForDate.forEach(function(slot) {
                timeSelect.append(buildOption(slot.time, slot.time));
            });

            timeSelect.disabled = !timesForDate.length;

            if (!timesForDate.length) {
                timeSelect.firstElementChild.textContent = 'Sem horarios livres nessa data';
            }
        };

        const fetchAvailability = async function() {
            if (!dateSelect || !timeSelect) return;

            setStatus('Buscando horários disponíveis...');
            const selectedHeadquarter = Number((headquarterSelect && headquarterSelect.value) || HEADQUARTER_ID);

            try {
                const params = new URLSearchParams({
                    headquarterId : selectedHeadquarter
                });

                const response = await fetch(`${API_BASE}/availability?${params.toString()}`, {
                    headers : {
                        'x-user-id' : AVAILABILITY_USER_ID
                    }
                });

                if (!response.ok) throw new Error('Erro ao carregar disponibilidade');

                const data = await response.json();
                slots = Array.isArray(data.slots) ? data.slots : [];

                populateDates();

                if (!slots.length) {
                    setStatus('Sem datas disponíveis nos próximos dias. Tente novamente mais tarde.', 'error');
                } else {
                    setStatus('Datas carregadas. Escolha a que preferir.');
                }

            } catch (error) {
                setStatus('Não foi possível carregar os horários. Tente novamente em instantes.', 'error');
            }
        };

        dateSelect.addEventListener('change', function(event) {
            populateTimes(event.target.value);
        });

        headquarterSelect.addEventListener('change', function() {
            fetchAvailability();
        });

        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (!dateSelect.value || !timeSelect.value) {
                setStatus('Escolha uma data e horário para agendar.', 'error');
                return;
            }

            const payload = {
                nome       : nameInput ? nameInput.value.trim() : '',
                observacao : noteInput ? noteInput.value.trim() : '',
                data       : dateSelect.value,
                hora       : timeSelect.value,
                celular    : phoneInput ? phoneInput.value.trim() : '',
                sedeId     : Number((headquarterSelect && headquarterSelect.value) || HEADQUARTER_ID)
            };

            if (!payload.nome || !payload.celular) {
                setStatus('Preencha nome e celular para continuarmos.', 'error');
                return;
            }

            try {
                setLoading(true);
                setStatus('Enviando seu pedido...');

                const response = await fetch(`${API_BASE}/commitments-landing-page`, {
                    method  : 'POST',
                    headers : {
                        'Content-Type' : 'application/json',
                        'x-user-id'    : AVAILABILITY_USER_ID
                    },
                    body : JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Falha ao enviar');

                setStatus('Pedido de visita enviado com sucesso! Em breve entraremos em contato para confirmar.', 'success');
                form.reset();
                populateDates();
            } catch (error) {
                setStatus('Não foi possível enviar agora. Confira os dados ou tente novamente.', 'error');
            } finally {
                setLoading(false);
            }
        });

        fetchAvailability();

    }; // end ssVisitForm


   /* Back to Top
    * ------------------------------------------------------ */
    const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        // Show or hide the button
        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    }; // end ssBackToTop


   /* smoothscroll
    * ------------------------------------------------------ */
    const ssMoveTo = function(){

        const easeFunctions = {
            easeInQuad: function (t, b, c, d) {
                t /= d;
                return c * t * t + b;
            },
            easeOutQuad: function (t, b, c, d) {
                t /= d;
                return -c * t* (t - 2) + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
        }

        const triggers = document.querySelectorAll('.smoothscroll');
        
        const moveTo = new MoveTo({
            tolerance: 0,
            duration: 1200,
            easing: 'easeInOutCubic',
            container: window
        }, easeFunctions);

        triggers.forEach(function(trigger) {
            moveTo.registerTrigger(trigger);
        });

    }; // end ssMoveTo


   /* Initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        ssPreloader();
        ssMoveHeader();
        ssMobileMenu();
        ssScrollSpy();
        ssMasonry();
        ssSwiper();
        ssMailChimpForm();
        ssLightbox();
        ssAlertBoxes();
        ssVisitForm();
        ssBackToTop();
        ssMoveTo();

    })();

})(document.documentElement);
