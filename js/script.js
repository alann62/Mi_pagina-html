(function () {
  'use strict';

  // Año dinámico en el footer
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ============================================================
  // Formulario de contacto
  // ============================================================
  var form = document.getElementById('contact-form');

  if (form) {
    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('form-submit');
    var submitLabel = document.getElementById('form-submit-label');
    var submitLabelDefault = submitLabel.textContent;
    var redirectTo = form.getAttribute('data-redirect') || '/gracias/';

    function setSubmitting(isSubmitting) {
      submitBtn.disabled = isSubmitting;
      if (isSubmitting) {
        submitLabel.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Enviando...';
      } else {
        submitLabel.textContent = submitLabelDefault;
      }
    }

    var validators = {
      nombre: function (value) {
        return value.trim().length >= 3 ? '' : 'Ingresá tu nombre completo.';
      },
      empresa: function (value) {
        return value.trim().length >= 2 ? '' : 'Ingresá el nombre de tu empresa.';
      },
      rubro: function (value) {
        return value ? '' : 'Seleccioná un rubro.';
      },
      mensaje: function (value) {
        return value.trim().length >= 10 ? '' : 'Contanos un poco más sobre tu proyecto (mínimo 10 caracteres).';
      }
    };

    function showFieldError(name, message) {
      var input = form.elements[name];
      var errorEl = document.getElementById('error-' + name);
      var row = input ? input.closest('.form-row') : null;

      if (row) row.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message;
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateForm() {
      var isValid = true;
      var firstInvalid = null;

      Object.keys(validators).forEach(function (name) {
        var input = form.elements[name];
        var message = validators[name](input ? input.value : '');
        showFieldError(name, message);
        if (message) {
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (firstInvalid) firstInvalid.focus();
      return isValid;
    }

    // Validación en vivo al salir del campo
    Object.keys(validators).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () {
        showFieldError(name, validators[name](input.value));
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!validateForm()) {
        statusEl.textContent = 'Revisá los campos marcados en rojo.';
        statusEl.setAttribute('data-state', 'error');
        return;
      }

      statusEl.textContent = '';
      statusEl.setAttribute('data-state', '');
      setSubmitting(true);

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            // Conversión de Google Ads (opcional): descomentar y completar con el ID/label real.
            // if (typeof gtag === 'function') {
            //   gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXX' });
            // }
            window.location.href = redirectTo;
          } else {
            throw new Error('Respuesta no exitosa del servidor');
          }
        })
        .catch(function () {
          statusEl.textContent =
            'No pudimos enviar el formulario. Escribinos por WhatsApp o intentá nuevamente en unos minutos.';
          statusEl.setAttribute('data-state', 'error');
          setSubmitting(false);
        });
    });
  }

  // ============================================================
  // Carrusel de logos (accesible)
  // ============================================================
  var track = document.getElementById('logos-track');
  var marquee = track ? track.closest('.logos-marquee') : null;

  if (marquee && track) {
    var prevBtn = marquee.querySelector('.marquee-prev');
    var nextBtn = marquee.querySelector('.marquee-next');
    var step = 156; // ancho aproximado de un logo + gap

    function pause() {
      track.classList.add('is-paused');
    }
    function resume() {
      track.classList.remove('is-paused');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        pause();
        track.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        pause();
        track.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    // Si el usuario prefiere menos movimiento, dejamos el carrusel quieto por defecto.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pause();
    }
  }
})();
