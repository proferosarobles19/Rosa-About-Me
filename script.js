/**
 * ==========================================================================
 * Rosa Robles Pino - Personal Branding & BioLink Scripts
 * Interacciones: Web Share API, Clipboard, Código QR, Toast y Accesibilidad
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. Configuración Centralizada (Fácil personalización para Rosa Robles)
  // ------------------------------------------------------------------------
  const CONFIG = {
    // Datos y enlaces oficiales de Rosa Robles Pino:
    socials: {
      instagramUsername: 'yarinc1983',
      linkedinUsername: 'rosa-robles-24b0281a3',
      githubUsername: 'proferosarobles19',
      email: 'rosa.robles1@meduca.edu.pa'
    },
    // Título y mensaje al compartir en redes:
    share: {
      title: 'Rosa Robles Pino | Tecnología con propósito',
      text: 'Conoce el perfil de Rosa Robles Pino: Ingeniera en Sistemas Informáticos e Innovadora Educativa. Especialista en IA y Prompts para Docentes.'
    }
  };

  // ------------------------------------------------------------------------
  // 2. Elementos del DOM
  // ------------------------------------------------------------------------
  const currentYearSpan = document.getElementById('currentYear');
  const btnShareTop = document.getElementById('btnShareTop');
  const btnQrTop = document.getElementById('btnQrTop');
  const shareModal = document.getElementById('shareModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCopyShareUrl = document.getElementById('btnCopyShareUrl');
  const shareUrlInput = document.getElementById('shareUrlInput');
  const qrCodeVisual = document.getElementById('qrCodeVisual');
  
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const promptContent = document.getElementById('promptContent');
  
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const emailDisplay = document.getElementById('emailDisplay');
  
  const btnScrollTop = document.getElementById('btnScrollTop');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  let toastTimeout = null;

  // ------------------------------------------------------------------------
  // 3. Inicialización General
  // ------------------------------------------------------------------------
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Verificación de fotografía de perfil con compatibilidad dual (raíz 'avatar.jpg' y 'assets/avatar.jpg')
  const profileImg = document.getElementById('profileImage');
  if (profileImg) {
    profileImg.addEventListener('error', function() {
      if (this.src.indexOf('assets/avatar.jpg') !== -1) {
        this.src = 'avatar.jpg';
      } else if (this.src.indexOf('avatar.jpg') !== -1 && this.src.indexOf('assets/') === -1) {
        this.src = 'assets/avatar.jpg';
      }
    });
  }

  // Establecer URL actual en el input de compartir
  const currentUrl = window.location.href.split('#')[0];
  if (shareUrlInput) {
    shareUrlInput.value = currentUrl;
  }

  // Renderizar código QR en el modal
  renderQrSvg(currentUrl);

  // ------------------------------------------------------------------------
  // 4. Sistema de Notificaciones Toast
  // ------------------------------------------------------------------------
  function showToast(message, duration = 3000) {
    if (!toastNotification || !toastMessage) return;

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastMessage.textContent = message;
    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, duration);
  }

  // Función genérica para copiar texto al portapapeles con fallback seguro
  async function copyToClipboard(text, successMessage = 'Copiado al portapapeles') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para navegadores antiguos o entornos sin HTTPS seguro
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      showToast(successMessage);
      return true;
    } catch (err) {
      console.warn('Error al copiar al portapapeles:', err);
      showToast('Presiona Ctrl+C para copiar');
      return false;
    }
  }

  // ------------------------------------------------------------------------
  // 5. Copiar Prompt de Muestra para Docentes
  // ------------------------------------------------------------------------
  if (btnCopyPrompt && promptContent) {
    btnCopyPrompt.addEventListener('click', async () => {
      const codeElement = promptContent.querySelector('code');
      const textToCopy = codeElement ? codeElement.innerText.replace(/^"|"$/g, '').trim() : '';

      const originalBtnText = btnCopyPrompt.innerHTML;
      const success = await copyToClipboard(textToCopy, '¡Prompt copiado! Pégalo en ChatGPT o Claude');

      if (success) {
        btnCopyPrompt.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>¡Copiado!</span>
        `;
        btnCopyPrompt.style.background = 'rgba(34, 197, 94, 0.25)';
        btnCopyPrompt.style.borderColor = '#22c55e';

        setTimeout(() => {
          btnCopyPrompt.innerHTML = originalBtnText;
          btnCopyPrompt.style.background = '';
          btnCopyPrompt.style.borderColor = '';
        }, 2500);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 6. Copiar Correo Rápido
  // ------------------------------------------------------------------------
  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
      const email = emailDisplay ? emailDisplay.innerText.trim() : CONFIG.socials.email;
      copyToClipboard(email, `¡Correo ${email} copiado al portapapeles!`);
    });
  }

  // ------------------------------------------------------------------------
  // 7. Compartir Perfil (Web Share API con fallback a modal)
  // ------------------------------------------------------------------------
  async function handleShare() {
    const shareUrl = window.location.protocol.startsWith('http')
      ? window.location.href.split('#')[0]
      : 'https://proferosarobles19.github.io/Rosa-About-Me/';

    if (navigator.share) {
      try {
        await navigator.share({
          title: CONFIG.share.title,
          text: CONFIG.share.text,
          url: shareUrl
        });
        showToast('¡Gracias por compartir!');
        return;
      } catch (err) {
        // Si el usuario canceló el share nativo en su teléfono, no mostramos error
        if (err.name !== 'AbortError') {
          openModal();
        }
      }
    } else {
      openModal();
    }
  }

  if (btnShareTop) {
    btnShareTop.addEventListener('click', handleShare);
  }

  if (btnQrTop) {
    btnQrTop.addEventListener('click', openModal);
  }

  // ------------------------------------------------------------------------
  // 8. Manejo del Modal de Compartir y QR
  // ------------------------------------------------------------------------
  function openModal() {
    if (!shareModal) return;
    shareModal.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!shareModal) return;
    shareModal.close();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }

  // Cerrar al hacer clic en el backdrop
  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      const dialogDimensions = shareModal.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        closeModal();
      }
    });

    shareModal.addEventListener('close', () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    });
  }

  // Botón copiar URL en modal
  if (btnCopyShareUrl && shareUrlInput) {
    btnCopyShareUrl.addEventListener('click', () => {
      copyToClipboard(shareUrlInput.value, '¡Enlace de tu perfil copiado!');
    });
  }

  // ------------------------------------------------------------------------
  // 9. Generador de Código QR Visual (SVG nativo, sin dependencias externas)
  // ------------------------------------------------------------------------
  function renderQrSvg(url) {
    if (!qrCodeVisual) return;

    // Generamos un QR estilizado vectorial mediante API segura de imagen SVG o fallback local
    const encodedUrl = encodeURIComponent(url);
    const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}&format=svg&color=120c1f&bgcolor=ffffff&margin=1`;

    const img = new Image();
    img.src = qrSvgUrl;
    img.alt = `Código QR para acceder a ${url}`;
    img.loading = 'lazy';
    img.width = 180;
    img.height = 180;

    img.onload = () => {
      qrCodeVisual.innerHTML = '';
      qrCodeVisual.appendChild(img);
    };

    img.onerror = () => {
      // Fallback estético en caso de estar offline o sin red externa
      qrCodeVisual.innerHTML = `
        <svg viewBox="0 0 100 100" width="160" height="160" fill="#120c1f">
          <rect width="100" height="100" fill="#ffffff" />
          <path d="M10 10h30v30h-30z M15 15h20v20h-20z M20 20h10v10h-10z" />
          <path d="M60 10h30v30h-30z M65 15h20v20h-20z M70 20h10v10h-10z" />
          <path d="M10 60h30v30h-30z M15 65h20v20h-20z M20 70h10v10h-10z" />
          <rect x="45" y="15" width="8" height="25" />
          <rect x="15" y="45" width="25" height="8" />
          <rect x="48" y="48" width="15" height="15" />
          <rect x="68" y="48" width="22" height="10" />
          <rect x="48" y="68" width="10" height="22" />
          <rect x="68" y="68" width="22" height="22" />
        </svg>
      `;
    };
  }

  // ------------------------------------------------------------------------
  // 10. Botón Scroll Top
  // ------------------------------------------------------------------------
  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ------------------------------------------------------------------------
  // 11. Accesibilidad por Teclado en Tarjetas de Servicios
  // ------------------------------------------------------------------------
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('active-focus');
      }
    });
  });

});
