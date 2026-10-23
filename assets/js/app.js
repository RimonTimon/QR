(function() {
      'use strict';

      // ============================ State ============================
      var currentType = 'url';
      var qrCodeInstance = null;
      var currentPayload = '';
      var contentDirty = false;
      var currentLogoDataUrl = '';
      var selectedThemeId = null; // null = no illustration selected
      var designRenderTimer = null;
      var heroInitialized = false;

      var TEXT_MAX = 150; // keep QR density low enough to scan reliably

      // ============================ Theme SVGs ============================
      var creativeThemes = [
        // ===== Animals =====
        { id: 'cat', name: 'Cat', category: 'Animals',
          svg: '<circle cx="32" cy="36" r="20" fill="#f5a623"/><path d="M12 22 L14 10 L24 20 Z" fill="#f5a623"/><path d="M52 22 L50 10 L40 20 Z" fill="#f5a623"/><circle cx="25" cy="34" r="2.5" fill="#1a1a1a"/><circle cx="39" cy="34" r="2.5" fill="#1a1a1a"/><path d="M28 42 Q32 45 36 42" stroke="#1a1a1a" stroke-width="1.5" fill="none" stroke-linecap="round"/>' },
        { id: 'dog', name: 'Dog', category: 'Animals',
          svg: '<circle cx="32" cy="36" r="20" fill="#c08552"/><ellipse cx="12" cy="34" rx="6" ry="11" fill="#8b5e42"/><ellipse cx="52" cy="34" rx="6" ry="11" fill="#8b5e42"/><circle cx="25" cy="34" r="2.5" fill="#1a1a1a"/><circle cx="39" cy="34" r="2.5" fill="#1a1a1a"/><ellipse cx="32" cy="44" rx="4" ry="3" fill="#3a2a1a"/>' },
        { id: 'rabbit', name: 'Rabbit', category: 'Animals',
          svg: '<ellipse cx="23" cy="18" rx="5" ry="14" fill="#f0e0e8"/><ellipse cx="41" cy="18" rx="5" ry="14" fill="#f0e0e8"/><ellipse cx="23" cy="18" rx="2.5" ry="10" fill="#f5c0d0"/><ellipse cx="41" cy="18" rx="2.5" ry="10" fill="#f5c0d0"/><circle cx="32" cy="42" r="16" fill="#f0e0e8"/><circle cx="26" cy="40" r="2" fill="#1a1a1a"/><circle cx="38" cy="40" r="2" fill="#1a1a1a"/><path d="M29 46 Q32 49 35 46" stroke="#1a1a1a" stroke-width="1.5" fill="none" stroke-linecap="round"/>' },
        { id: 'panda', name: 'Panda', category: 'Animals',
          svg: '<circle cx="32" cy="36" r="20" fill="#ffffff"/><circle cx="14" cy="20" r="7" fill="#1a1a1a"/><circle cx="50" cy="20" r="7" fill="#1a1a1a"/><ellipse cx="24" cy="34" rx="6" ry="7" fill="#1a1a1a"/><ellipse cx="40" cy="34" rx="6" ry="7" fill="#1a1a1a"/><circle cx="24" cy="34" r="2" fill="#ffffff"/><circle cx="40" cy="34" r="2" fill="#ffffff"/><ellipse cx="32" cy="44" rx="3" ry="2" fill="#1a1a1a"/>' },
        { id: 'fox', name: 'Fox', category: 'Animals',
          svg: '<path d="M32 14 L10 24 L16 42 L32 54 L48 42 L54 24 Z" fill="#e87a2a"/><path d="M32 14 L10 24 L16 42 L32 54 Z" fill="#d96a1a" opacity="0.6"/><circle cx="24" cy="34" r="2.5" fill="#1a1a1a"/><circle cx="40" cy="34" r="2.5" fill="#1a1a1a"/><ellipse cx="32" cy="44" rx="3" ry="2" fill="#1a1a1a"/>' },
        { id: 'owl', name: 'Owl', category: 'Animals',
          svg: '<ellipse cx="32" cy="36" rx="18" ry="20" fill="#8b6b4a"/><circle cx="24" cy="30" r="7" fill="#fff"/><circle cx="40" cy="30" r="7" fill="#fff"/><circle cx="24" cy="30" r="3" fill="#1a1a1a"/><circle cx="40" cy="30" r="3" fill="#1a1a1a"/><path d="M29 38 L32 44 L35 38 Z" fill="#f5a623"/>' },
        { id: 'bear', name: 'Bear', category: 'Animals',
          svg: '<circle cx="32" cy="36" r="20" fill="#8b5e42"/><circle cx="14" cy="20" r="8" fill="#8b5e42"/><circle cx="50" cy="20" r="8" fill="#8b5e42"/><circle cx="14" cy="20" r="4" fill="#c08552"/><circle cx="50" cy="20" r="4" fill="#c08552"/><circle cx="25" cy="34" r="2.5" fill="#1a1a1a"/><circle cx="39" cy="34" r="2.5" fill="#1a1a1a"/><ellipse cx="32" cy="44" rx="5" ry="3.5" fill="#c08552"/>' },
        { id: 'penguin', name: 'Penguin', category: 'Animals',
          svg: '<ellipse cx="32" cy="38" rx="16" ry="20" fill="#1a1a1a"/><ellipse cx="32" cy="40" rx="10" ry="14" fill="#ffffff"/><circle cx="26" cy="30" r="2" fill="#1a1a1a"/><circle cx="38" cy="30" r="2" fill="#1a1a1a"/><path d="M28 36 L32 40 L36 36 Z" fill="#f5a623"/>' },
        // ===== Fruits =====
        { id: 'strawberry', name: 'Strawberry', category: 'Fruits',
          svg: '<path d="M32 16 Q14 24 14 40 Q14 54 32 58 Q50 54 50 40 Q50 24 32 16 Z" fill="#e84a5f"/><path d="M22 20 Q28 16 32 18 Q36 16 42 20 Q38 24 32 22 Q26 24 22 20 Z" fill="#4a9c3f"/><circle cx="24" cy="32" r="1.5" fill="#fff" opacity="0.85"/><circle cx="40" cy="32" r="1.5" fill="#fff" opacity="0.85"/><circle cx="32" cy="40" r="1.5" fill="#fff" opacity="0.85"/><circle cx="26" cy="46" r="1.5" fill="#fff" opacity="0.85"/><circle cx="38" cy="46" r="1.5" fill="#fff" opacity="0.85"/>' },
        { id: 'orange', name: 'Orange', category: 'Fruits',
          svg: '<circle cx="32" cy="38" r="20" fill="#f5a623"/><path d="M32 18 Q38 14 42 16 Q40 20 34 20" fill="#4a9c3f"/><line x1="32" y1="18" x2="32" y2="24" stroke="#4a9c3f" stroke-width="2"/>' },
        { id: 'watermelon', name: 'Melon', category: 'Fruits',
          svg: '<path d="M8 32 A24 24 0 0 1 56 32 Z" fill="#4a9c3f"/><path d="M12 32 A20 20 0 0 1 52 32 Z" fill="#ff6b7a"/><circle cx="24" cy="24" r="1.5" fill="#1a1a1a"/><circle cx="40" cy="24" r="1.5" fill="#1a1a1a"/><circle cx="32" cy="20" r="1.5" fill="#1a1a1a"/>' },
        { id: 'apple', name: 'Apple', category: 'Fruits',
          svg: '<path d="M32 22 Q20 20 16 32 Q14 44 22 50 Q28 56 32 50 Q36 56 42 50 Q50 44 48 32 Q44 20 32 22 Z" fill="#e84a5f"/><path d="M32 22 Q34 14 40 12" stroke="#4a9c3f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M40 12 Q46 12 48 18 Q42 20 40 12 Z" fill="#4a9c3f"/>' },
        { id: 'cherry', name: 'Cherry', category: 'Fruits',
          svg: '<circle cx="24" cy="44" r="12" fill="#e84a5f"/><circle cx="42" cy="44" r="12" fill="#d93a4f"/><path d="M24 32 Q28 16 32 14 Q36 16 42 32" stroke="#4a9c3f" stroke-width="2.5" fill="none"/><path d="M32 14 Q38 10 44 12" stroke="#4a9c3f" stroke-width="2" fill="none" stroke-linecap="round"/>' },
        { id: 'lemon', name: 'Lemon', category: 'Fruits',
          svg: '<ellipse cx="32" cy="36" rx="18" ry="24" fill="#f5d94a" transform="rotate(-20 32 36)"/><path d="M44 16 Q48 12 52 14" stroke="#4a9c3f" stroke-width="2" fill="none" stroke-linecap="round"/>' },
        // ===== Flowers =====
        { id: 'sunflower', name: 'Sunflower', category: 'Flowers',
          svg: '<g fill="#ffcc00"><ellipse cx="32" cy="12" rx="4" ry="8"/><ellipse cx="32" cy="52" rx="4" ry="8"/><ellipse cx="12" cy="32" rx="8" ry="4"/><ellipse cx="52" cy="32" rx="8" ry="4"/><ellipse cx="18" cy="18" rx="4" ry="8" transform="rotate(-45 18 18)"/><ellipse cx="46" cy="18" rx="4" ry="8" transform="rotate(45 46 18)"/><ellipse cx="18" cy="46" rx="4" ry="8" transform="rotate(45 18 46)"/><ellipse cx="46" cy="46" rx="4" ry="8" transform="rotate(-45 46 46)"/></g><circle cx="32" cy="32" r="12" fill="#5a3a1a"/>' },
        { id: 'rose', name: 'Rose', category: 'Flowers',
          svg: '<circle cx="32" cy="32" r="22" fill="#e84a5f"/><path d="M32 20 Q42 22 42 32 Q42 42 32 44 Q22 42 22 32 Q22 24 28 22" fill="none" stroke="#ffd0d8" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#ffd0d8"/>' },
        { id: 'tulip', name: 'Tulip', category: 'Flowers',
          svg: '<path d="M20 30 Q20 14 32 14 Q44 14 44 30 Q44 40 32 42 Q20 40 20 30 Z" fill="#e84a7a"/><path d="M32 42 L32 54" stroke="#4a9c3f" stroke-width="2.5"/><path d="M32 48 Q24 44 20 48" stroke="#4a9c3f" stroke-width="2" fill="none" stroke-linecap="round"/>' },
        { id: 'daisy', name: 'Daisy', category: 'Flowers',
          svg: '<g fill="#ffffff"><ellipse cx="32" cy="16" rx="6" ry="10"/><ellipse cx="48" cy="32" rx="10" ry="6"/><ellipse cx="32" cy="48" rx="6" ry="10"/><ellipse cx="16" cy="32" rx="10" ry="6"/><ellipse cx="44" cy="20" rx="6" ry="10" transform="rotate(45 44 20)"/><ellipse cx="44" cy="44" rx="6" ry="10" transform="rotate(-45 44 44)"/><ellipse cx="20" cy="44" rx="6" ry="10" transform="rotate(45 20 44)"/><ellipse cx="20" cy="20" rx="6" ry="10" transform="rotate(-45 20 20)"/></g><circle cx="32" cy="32" r="10" fill="#f5a623"/>' },
        // ===== Nature =====
        { id: 'butterfly', name: 'Butterfly', category: 'Nature',
          svg: '<ellipse cx="20" cy="24" rx="12" ry="14" fill="#9b6bd4"/><ellipse cx="44" cy="24" rx="12" ry="14" fill="#9b6bd4"/><ellipse cx="22" cy="42" rx="9" ry="11" fill="#b794e6"/><ellipse cx="42" cy="42" rx="9" ry="11" fill="#b794e6"/><ellipse cx="32" cy="34" rx="3" ry="16" fill="#4a3560"/><path d="M32 18 Q28 12 24 12" stroke="#4a3560" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M32 18 Q36 12 40 12" stroke="#4a3560" stroke-width="1.5" fill="none" stroke-linecap="round"/>' },
        { id: 'leaf', name: 'Leaf', category: 'Nature',
          svg: '<path d="M16 48 Q16 20 40 16 Q52 16 50 28 Q48 40 32 46 Q24 48 16 48 Z" fill="#4a9c3f"/><path d="M16 48 Q28 32 44 22" stroke="#2a6c1f" stroke-width="2" fill="none"/>' },
        { id: 'tree', name: 'Tree', category: 'Nature',
          svg: '<rect x="28" y="36" width="8" height="20" fill="#8b5e42" rx="1"/><circle cx="32" cy="26" r="18" fill="#4a9c3f"/><circle cx="20" cy="32" r="12" fill="#3d8a34"/><circle cx="44" cy="32" r="12" fill="#3d8a34"/>' },
        { id: 'cloud', name: 'Cloud', category: 'Nature',
          svg: '<path d="M20 40 Q12 40 12 32 Q12 24 20 22 Q22 14 32 14 Q42 14 44 22 Q52 24 52 32 Q52 40 44 40 Z" fill="#a8d8f0"/>' },
        { id: 'star', name: 'Star', category: 'Nature',
          svg: '<path d="M32 6 L38 22 L56 22 L42 34 L48 52 L32 42 L16 52 L22 34 L8 22 L26 22 Z" fill="#f5d94a"/>' },
        // ===== Minimal =====
        { id: 'mark', name: 'Mark', category: 'Minimal',
          svg: '<path d="M32 8 L36 28 L56 32 L36 36 L32 56 L28 36 L8 32 L28 28 Z" fill="#6554c0"/>' },
        { id: 'orbit', name: 'Orbit', category: 'Minimal',
          svg: '<circle cx="32" cy="32" r="20" fill="none" stroke="#6554c0" stroke-width="2.5"/><circle cx="32" cy="32" r="8" fill="#6554c0"/><circle cx="46" cy="20" r="4" fill="#a78bfa"/>' },
        { id: 'square', name: 'Square', category: 'Minimal',
          svg: '<rect x="14" y="14" width="36" height="36" rx="8" fill="none" stroke="#6554c0" stroke-width="3"/><rect x="24" y="24" width="16" height="16" rx="4" fill="#6554c0"/>' },
        { id: 'circle', name: 'Circle', category: 'Minimal',
          svg: '<circle cx="32" cy="32" r="22" fill="none" stroke="#6554c0" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="#6554c0"/>' },
        // ===== Cute & Pastel =====
        { id: 'bow', name: 'Bow', category: 'Cute & Pastel',
          svg: '<path d="M32 30 Q20 18 12 24 Q8 30 16 36 Q24 40 32 36 Z" fill="#f06292"/><path d="M32 30 Q44 18 52 24 Q56 30 48 36 Q40 40 32 36 Z" fill="#f06292"/><ellipse cx="32" cy="32" rx="5" ry="7" fill="#e84a7a"/><path d="M28 38 L24 52" stroke="#f06292" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 38 L40 52" stroke="#f06292" stroke-width="3" fill="none" stroke-linecap="round"/>' },
        { id: 'heart', name: 'Heart', category: 'Cute & Pastel',
          svg: '<path d="M32 50 Q12 36 12 24 Q12 16 20 16 Q28 16 32 24 Q36 16 44 16 Q52 16 52 24 Q52 36 32 50 Z" fill="#e84a5f"/>' },
        { id: 'moon', name: 'Moon', category: 'Cute & Pastel',
          svg: '<path d="M38 10 Q20 14 16 32 Q12 50 30 54 Q22 48 22 32 Q22 16 38 10 Z" fill="#f5d94a"/><circle cx="44" cy="18" r="2" fill="#f5d94a"/><circle cx="50" cy="30" r="1.5" fill="#f5d94a"/><circle cx="46" cy="42" r="1.5" fill="#f5d94a"/>' },
        { id: 'rainbow', name: 'Rainbow', category: 'Cute & Pastel',
          svg: '<path d="M8 44 A24 24 0 0 1 56 44" fill="none" stroke="#e84a5f" stroke-width="5"/><path d="M14 44 A18 18 0 0 1 50 44" fill="none" stroke="#f5a623" stroke-width="5"/><path d="M20 44 A12 12 0 0 1 44 44" fill="none" stroke="#f5d94a" stroke-width="5"/><path d="M26 44 A6 6 0 0 1 38 44" fill="none" stroke="#4a9c3f" stroke-width="5"/>' },
        { id: 'icecream', name: 'Ice Cream', category: 'Cute & Pastel',
          svg: '<path d="M22 36 L32 56 L42 36 Z" fill="#c08552"/><circle cx="32" cy="28" r="14" fill="#f5c0d0"/><circle cx="24" cy="22" r="8" fill="#a8d8f0"/><circle cx="40" cy="22" r="8" fill="#f5d94a"/><circle cx="32" cy="14" r="3" fill="#e84a5f"/>' }
      ];

      var colorThemePresets = {
        bw: { foreground: '#17181d', background: '#ffffff' },
        pastel: { foreground: '#6b4a7d', background: '#fff7fb' },
        lavender: { foreground: '#5744a2', background: '#f6f2ff' },
        ocean: { foreground: '#075b75', background: '#effaff' },
        forest: { foreground: '#24583d', background: '#f2f8f1' },
        sunset: { foreground: '#9a3f36', background: '#fff4ed' }
      };

      var MARGIN_SCALES = { standard: 0.16, generous: 0.20, print: 0.24 };
      var PREVIEW_CAP = 512;

      // ============================ DOM refs ============================
      var qrPreviewEl = document.getElementById('qrPreview');
      var btnDownloadPng = document.getElementById('btnDownloadPng');
      var btnDownloadSvg = document.getElementById('btnDownloadSvg');
      var btnCopy = document.getElementById('btnCopy');
      var scanWarning = document.getElementById('scanWarning');
      var previewStatus = document.getElementById('previewStatus');
      var previewStatusText = previewStatus.querySelector('.status-text');

      var inputUrl = document.getElementById('inputUrl');
      var inputPhone = document.getElementById('inputPhone');
      var inputText = document.getElementById('inputText');
      var textCounter = document.getElementById('textCounter');
      var inputEmail = document.getElementById('inputEmail');
      var inputEmailSubject = document.getElementById('inputEmailSubject');
      var inputEmailBody = document.getElementById('inputEmailBody');
      var inputWifiSsid = document.getElementById('inputWifiSsid');
      var inputWifiPassword = document.getElementById('inputWifiPassword');
      var selectWifiSecurity = document.getElementById('selectWifiSecurity');

      var colorForeground = document.getElementById('colorForeground');
      var colorBackground = document.getElementById('colorBackground');
      var selectDesignStyle = document.getElementById('selectDesignStyle');
      var selectColorTheme = document.getElementById('selectColorTheme');
      var selectDotStyle = document.getElementById('selectDotStyle');
      var selectCornerStyle = document.getElementById('selectCornerStyle');
      var selectSize = document.getElementById('selectSize');
      var selectEcc = document.getElementById('selectEcc');
      var eccNote = document.getElementById('eccNote');
      var selectQuietZone = document.getElementById('selectQuietZone');
      var selectThemeCategory = document.getElementById('selectThemeCategory');
      var themeScrollEl = document.getElementById('themeScroll');
      var customColorDetails = document.getElementById('customColorDetails');
      var inputLogo = document.getElementById('inputLogo');
      var btnRemoveLogo = document.getElementById('btnRemoveLogo');

      var errorUrl = document.getElementById('errorUrl');
      var errorPhone = document.getElementById('errorPhone');
      var errorText = document.getElementById('errorText');
      var errorEmail = document.getElementById('errorEmail');
      var errorWifiSsid = document.getElementById('errorWifiSsid');
      var errorWifiPassword = document.getElementById('errorWifiPassword');

      // ============================ Utilities ============================
      var toastTimer = null;
      function showToast(message, type) {
        var toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast-cute show' + (type ? ' ' + type : '');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 3200);
      }
      window.showToast = showToast;

      function setStatus(state, text) {
        previewStatus.className = 'preview-status ' + state;
        previewStatusText.textContent = text;
      }

      function clearAllErrors() {
        [errorUrl, errorPhone, errorText, errorEmail, errorWifiSsid, errorWifiPassword].forEach(function(el) {
          if (el) el.textContent = '';
        });
      }

      function escapeWifi(str) {
        if (!str) return '';
        return String(str).replace(/([\\;,":])/g, '\\$1');
      }

      function getExportSize() {
        var n = parseInt(selectSize.value, 10);
        return isNaN(n) ? 512 : n;
      }
      function getPreviewSize() { return Math.min(getExportSize(), PREVIEW_CAP); }
      function getMargin(size) {
        var scale = MARGIN_SCALES[selectQuietZone.value] || MARGIN_SCALES.standard;
        return Math.max(12, Math.round(size * scale));
      }

      function luminance(hex) {
        var c = hex.replace('#', '');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var r = parseInt(c.substring(0, 2), 16) / 255;
        var g = parseInt(c.substring(2, 4), 16) / 255;
        var b = parseInt(c.substring(4, 6), 16) / 255;
        function ch(v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
        return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
      }

      // ============================ Mobile menu ============================
      var mobileMenuBtn = document.getElementById('mobileMenuBtn');
      var mobileMenu = document.getElementById('mobileMenu');
      function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Open menu');
      }
      mobileMenuBtn.addEventListener('click', function() {
        var isOpen = mobileMenu.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      });
      mobileMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', closeMobileMenu);
      });
      window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) closeMobileMenu();
      });

      // ============================ Accordion + hash navigation ============================
      // Opens the right accordion when a link points at content inside it
      // (e.g. footer links to #privacy-policy, #terms-of-use, #contact).
      function openAccordionForHash() {
        var raw = location.hash ? location.hash.slice(1) : '';
        if (!raw) return;
        var id;
        try { id = decodeURIComponent(raw); } catch (e) { id = raw; }
        var target = document.getElementById(id);
        if (!target) return;
        var panel = target.tagName === 'DETAILS' ? target : target.closest('details');
        if (panel && !panel.open) {
          panel.open = true;
          setTimeout(function() {
            target.scrollIntoView({ block: 'start' });
          }, 0);
        }
      }
      window.addEventListener('load', openAccordionForHash);
      window.addEventListener('hashchange', openAccordionForHash);

      // ============================ Content type ============================
      var inputGroups = document.querySelectorAll('.input-group');
      var contentRadios = document.querySelectorAll('input[name="contentType"]');

      function setContentType(type) {
        currentType = type;
        var radio = document.querySelector('input[name="contentType"][value="' + type + '"]');
        if (radio && !radio.checked) radio.checked = true;
        inputGroups.forEach(function(group) {
          group.classList.toggle('hidden', group.dataset.group !== type);
        });
        clearAllErrors();
        markContentDirty();
      }

      contentRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
          if (!this.checked) return;
          setContentType(this.value);
        });
      });

      // ============================ Text counter ============================
      function updateTextCounter() {
        var len = inputText.value.length;
        textCounter.textContent = len + ' / ' + TEXT_MAX;
        textCounter.style.color = len >= TEXT_MAX ? 'var(--warning)' : 'var(--ink-mute)';
      }
      inputText.addEventListener('input', updateTextCounter);
      updateTextCounter();

      // ============================ Payload builder ============================
      function setFieldError(el, msg, show) {
        if (show && el) el.textContent = msg;
      }

      function buildPayload(showErrors) {
        clearAllErrors();
        var payload = '';
        var valid = true;

        if (currentType === 'url') {
          var url = inputUrl.value.trim();
          if (!url) {
            setFieldError(errorUrl, 'Please enter a URL.', showErrors);
            valid = false;
          } else if (!/^https?:\/\//i.test(url) && !/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}/i.test(url)) {
            setFieldError(errorUrl, 'Please enter a valid URL (e.g. https://example.com).', showErrors);
            valid = false;
          } else {
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            payload = url;
          }
        } else if (currentType === 'phone') {
          var phone = inputPhone.value.trim();
          if (!phone) {
            setFieldError(errorPhone, 'Please enter a phone number.', showErrors);
            valid = false;
          } else {
            var cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
            if (!/^\+?\d{6,15}$/.test(cleaned)) {
              setFieldError(errorPhone, 'Please enter a valid phone number.', showErrors);
              valid = false;
            } else {
              payload = 'tel:' + cleaned;
            }
          }
        } else if (currentType === 'text') {
          // Validate using trim(), but encode the original value so line breaks and spacing are preserved.
          var text = inputText.value;
          if (!text.trim()) {
            setFieldError(errorText, 'Please enter a message.', showErrors);
            valid = false;
          } else if (text.length > TEXT_MAX) {
            setFieldError(errorText, 'Keep your message under ' + TEXT_MAX + ' characters so the QR stays easy to scan.', showErrors);
            valid = false;
          } else {
            payload = text;
          }
        } else if (currentType === 'email') {
          var email = inputEmail.value.trim();
          if (!email) {
            setFieldError(errorEmail, 'Please enter an email address.', showErrors);
            valid = false;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError(errorEmail, 'Please enter a valid email address.', showErrors);
            valid = false;
          } else {
            payload = 'mailto:' + email;
            var params = [];
            var subject = inputEmailSubject.value.trim();
            var body = inputEmailBody.value.trim();
            if (subject) params.push('subject=' + encodeURIComponent(subject));
            if (body) params.push('body=' + encodeURIComponent(body));
            if (params.length) payload += '?' + params.join('&');
          }
        } else if (currentType === 'wifi') {
          var ssid = inputWifiSsid.value;
          var password = inputWifiPassword.value;
          var security = selectWifiSecurity.value;

          if (!ssid || !ssid.trim()) {
            setFieldError(errorWifiSsid, 'Please enter the network name.', showErrors);
            valid = false;
          }
          if (security !== 'nopass' && !password) {
            setFieldError(errorWifiPassword, 'Password is required for secured networks.', showErrors);
            valid = false;
          }
          if (security === 'WPA' && password && (password.length < 8 || password.length > 63)) {
            setFieldError(errorWifiPassword, 'WPA password must be 8–63 characters.', showErrors);
            valid = false;
          }
          if (valid) {
            payload = 'WIFI:T:' + security + ';S:' + escapeWifi(ssid) + ';';
            if (security !== 'nopass') payload += 'P:' + escapeWifi(password) + ';';
            payload += ';';
          }
        }

        return valid ? payload : null;
      }

      // ============================ Themes ============================
      function themeSvgInline(theme, size) {
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true">' +
          '<circle cx="32" cy="32" r="31" fill="#ffffff" stroke="#eceaf3" stroke-width="2"/>' +
          theme.svg +
          '</svg>';
      }

      function themeImageData(theme) {
        if (!theme) return '';
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64">' +
          '<circle cx="32" cy="32" r="31" fill="#ffffff" stroke="#eceaf3" stroke-width="2"/>' +
          theme.svg +
          '</svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      }

      function renderThemeOptions() {
        var category = selectThemeCategory.value;
        var matching = creativeThemes.filter(function(t) { return t.category === category; });
        themeScrollEl.textContent = '';
        matching.forEach(function(theme) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'theme-card';
          btn.setAttribute('aria-label', theme.name + ' illustration');
          var isSelected = theme.id === selectedThemeId;
          btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
          // Theme artwork is bundled trusted SVG; keep labels as text to avoid HTML injection.
          var artwork = document.createElement('span');
          artwork.innerHTML = themeSvgInline(theme, 26);
          var themeLabel = document.createElement('span');
          themeLabel.className = 'theme-name';
          themeLabel.textContent = theme.name;
          btn.appendChild(artwork.firstElementChild);
          btn.appendChild(themeLabel);
          btn.addEventListener('click', function() {
            if (selectedThemeId === theme.id) {
              // Click again to remove the illustration
              selectedThemeId = null;
            } else {
              selectedThemeId = theme.id;
              selectDesignStyle.value = 'creative';
              selectDotStyle.value = 'rounded';
              selectCornerStyle.value = 'extra-rounded';
              selectEcc.value = 'H';
            }
            updateEccLock();
            renderThemeOptions();
            onDesignChange();
          });
          themeScrollEl.appendChild(btn);
        });
      }

      function updateEccLock() {
        var hasLogo = !!currentLogoDataUrl;
        var usesTheme = selectDesignStyle.value === 'creative' && !hasLogo && selectedThemeId;
        var locked = hasLogo || usesTheme;
        if (locked) selectEcc.value = 'H';
        selectEcc.disabled = locked;
        eccNote.classList.toggle('hidden', !locked);
      }

      selectThemeCategory.addEventListener('change', function() {
        renderThemeOptions();
        if (selectDesignStyle.value === 'creative') onDesignChange();
      });
      renderThemeOptions();

      // ============================ Build options ============================
      function buildQrOptions(payload, size) {
        var hasLogo = !!currentLogoDataUrl;
        var usesThemeArt = selectDesignStyle.value === 'creative' && !hasLogo && selectedThemeId;
        var activeTheme = selectedThemeId ? creativeThemes.find(function(t) { return t.id === selectedThemeId; }) : null;
        var ecc = (hasLogo || usesThemeArt) ? 'H' : selectEcc.value;

        var options = {
          width: size,
          height: size,
          data: payload,
          margin: getMargin(size),
          qrOptions: { errorCorrectionLevel: ecc },
          dotsOptions: {
            color: colorForeground.value,
            type: selectDotStyle.value
          },
          backgroundOptions: { color: colorBackground.value },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: hasLogo ? 0.18 : 0.15,
            margin: 8,
            crossOrigin: 'anonymous',
            saveAsBlob: true
          },
          cornersSquareOptions: {
            color: colorForeground.value,
            type: selectCornerStyle.value
          },
          cornersDotOptions: {
            color: colorForeground.value,
            type: selectCornerStyle.value === 'dot' ? 'dot' : 'square'
          }
        };

        if (hasLogo) {
          options.image = currentLogoDataUrl;
        } else if (usesThemeArt && activeTheme) {
          options.image = themeImageData(activeTheme);
        }
        return options;
      }

      // ============================ Empty & render ============================
      function showEmptyPreview(message) {
        qrCodeInstance = null;
        qrPreviewEl.textContent = '';
        var emptyState = document.createElement('div');
        emptyState.className = 'qr-empty';
        emptyState.innerHTML =
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cfc9e6" stroke-width="1.5" aria-hidden="true">' +
            '<rect x="3" y="3" width="7" height="7" rx="1"/>' +
            '<rect x="14" y="3" width="7" height="7" rx="1"/>' +
            '<rect x="3" y="14" width="7" height="7" rx="1"/>' +
            '<rect x="14" y="14" width="3" height="3" rx="0.5"/>' +
            '<rect x="18" y="18" width="3" height="3" rx="0.5"/>' +
          '</svg>';
        var emptyMessage = document.createElement('span');
        emptyMessage.textContent = String(message || 'Enter content and tap Generate');
        emptyState.appendChild(emptyMessage);
        qrPreviewEl.appendChild(emptyState);
        btnDownloadPng.disabled = true;
        btnDownloadSvg.disabled = true;
        btnCopy.disabled = true;
        scanWarning.classList.add('hidden');
      }

      function generateFromInputs() {
        if (designRenderTimer) { clearTimeout(designRenderTimer); designRenderTimer = null; }
        var payload = buildPayload(true);
        if (!payload) {
          currentPayload = '';
          contentDirty = false;
          showEmptyPreview('Check your content and try again');
          setStatus('error', 'Check your content');
          return;
        }
        currentPayload = payload;
        contentDirty = false;
        renderQR();
      }

      function renderQR() {
        if (!currentPayload) {
          showEmptyPreview('Enter content and tap Generate');
          setStatus('waiting', 'Waiting for content');
          return;
        }

        if (typeof QRCodeStyling === 'undefined') {
          showEmptyPreview('QR library failed to load. Refresh the page.');
          setStatus('error', 'QR library unavailable');
          showToast('QR library unavailable. Check connection.', 'error');
          return;
        }

        var previewSize = getPreviewSize();
        var exportSize = getExportSize();
        var fg = colorForeground.value;
        var bg = colorBackground.value;
        var hasLogo = !!currentLogoDataUrl;
        var usesThemeArt = selectDesignStyle.value === 'creative' && !hasLogo && selectedThemeId;

        var options = buildQrOptions(currentPayload, previewSize);

        qrPreviewEl.innerHTML = '';
        qrCodeInstance = null;

        try {
          qrCodeInstance = new QRCodeStyling(options);
          qrCodeInstance.append(qrPreviewEl);

          btnDownloadPng.disabled = false;
          btnDownloadSvg.disabled = false;
          btnCopy.disabled = false;

          if (contentDirty) {
            setStatus('waiting', 'Content changed — tap Generate');
          } else {
            setStatus('ready', 'Ready · exports at ' + exportSize + ' px');
          }

          var fgLum = luminance(fg);
          var bgLum = luminance(bg);
          var contrast = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
          var inverted = fgLum > bgLum;
          scanWarning.classList.toggle('hidden', !(hasLogo || usesThemeArt || contrast < 4.5 || inverted));
        } catch (err) {
          console.error('QR generation error:', err);
          showEmptyPreview('Failed to generate QR. Try different settings.');
          setStatus('error', 'Could not render');
          showToast('QR generation failed. Try adjusting settings.', 'error');
        }
      }

      function onDesignChange() {
        if (!currentPayload) return;
        renderQR();
      }

      function scheduleDesignRender() {
        if (!currentPayload) return;
        if (designRenderTimer) clearTimeout(designRenderTimer);
        designRenderTimer = setTimeout(renderQR, 120);
      }

      function markContentDirty() {
        if (currentPayload) {
          contentDirty = true;
          setStatus('waiting', 'Content changed — tap Generate');
        }
      }

      // ============================ Buttons ============================
      document.getElementById('btnGenerate').addEventListener('click', generateFromInputs);

      document.getElementById('btnClear').addEventListener('click', function() {
        inputUrl.value = '';
        inputPhone.value = '';
        inputText.value = '';
        updateTextCounter();
        inputEmail.value = '';
        inputEmailSubject.value = '';
        inputEmailBody.value = '';
        inputWifiSsid.value = '';
        inputWifiPassword.value = '';
        currentLogoDataUrl = '';
        inputLogo.value = '';
        btnRemoveLogo.classList.add('hidden');
        updateEccLock();
        clearAllErrors();
        currentPayload = '';
        contentDirty = false;
        showEmptyPreview('Enter content and tap Generate');
        setStatus('waiting', 'Waiting for content');
        showToast('Cleared.', 'success');
      });

      document.getElementById('btnResetCustom').addEventListener('click', function() {
        selectDesignStyle.value = 'classic';
        selectColorTheme.value = 'bw';
        colorForeground.value = '#17181d';
        colorBackground.value = '#ffffff';
        selectDotStyle.value = 'square';
        selectCornerStyle.value = 'square';
        selectSize.value = '512';
        selectEcc.value = 'H';
        selectQuietZone.value = 'standard';
        selectThemeCategory.value = 'Animals';
        selectedThemeId = null;
        customColorDetails.open = false;
        currentLogoDataUrl = '';
        inputLogo.value = '';
        btnRemoveLogo.classList.add('hidden');
        updateEccLock();
        renderThemeOptions();
        onDesignChange();
        showToast('Design reset.', 'success');
      });

      // ============================ Design controls ============================
      selectColorTheme.addEventListener('change', function() {
        if (this.value === 'custom') {
          customColorDetails.open = true;
          return;
        }
        var palette = colorThemePresets[this.value];
        if (palette) {
          colorForeground.value = palette.foreground;
          colorBackground.value = palette.background;
          customColorDetails.open = false;
          onDesignChange();
        }
      });

      selectDesignStyle.addEventListener('change', function() {
        var styles = {
          classic: { module: 'square', corner: 'square' },
          rounded: { module: 'rounded', corner: 'extra-rounded' },
          dots: { module: 'dots', corner: 'dot' },
          creative: { module: 'rounded', corner: 'extra-rounded' }
        };
        var style = styles[this.value] || styles.classic;
        selectDotStyle.value = style.module;
        selectCornerStyle.value = style.corner;
        updateEccLock();
        onDesignChange();
      });

      selectDotStyle.addEventListener('change', onDesignChange);

      [colorForeground, colorBackground].forEach(function(input) {
        input.addEventListener('input', function() {
          selectColorTheme.value = 'custom';
          scheduleDesignRender();
        });
      });

      [selectSize, selectQuietZone, selectCornerStyle].forEach(function(sel) {
        sel.addEventListener('change', onDesignChange);
      });

      selectEcc.addEventListener('change', onDesignChange);

      // ============================ Content inputs (no auto-render) ============================
      [inputUrl, inputPhone, inputText, inputEmail, inputEmailSubject, inputEmailBody,
       inputWifiSsid, inputWifiPassword].forEach(function(input) {
        input.addEventListener('input', markContentDirty);
      });
      selectWifiSecurity.addEventListener('change', markContentDirty);

      // ============================ Logo upload ============================
      inputLogo.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!/^(image\/png|image\/jpeg|image\/webp)$/.test(file.type)) {
          showToast('Choose a PNG, JPEG, or WebP logo.', 'error');
          inputLogo.value = '';
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          showToast('Logo must be 2 MB or smaller.', 'error');
          inputLogo.value = '';
          return;
        }
        var reader = new FileReader();
        reader.onload = function(ev) {
          currentLogoDataUrl = ev.target.result;
          btnRemoveLogo.classList.remove('hidden');
          updateEccLock();
          onDesignChange();
        };
        reader.onerror = function() {
          showToast('Could not read that logo. Try another image.', 'error');
          inputLogo.value = '';
        };
        reader.readAsDataURL(file);
      });

      btnRemoveLogo.addEventListener('click', function() {
        currentLogoDataUrl = '';
        inputLogo.value = '';
        btnRemoveLogo.classList.add('hidden');
        updateEccLock();
        onDesignChange();
      });

      // ============================ Downloads ============================
      async function downloadQR(extension) {
        if (!qrCodeInstance || !currentPayload) {
          showToast('Generate a QR code first.', 'error');
          return;
        }
        var exportSize = getExportSize();
        var previewSize = getPreviewSize();
        var needsResize = exportSize !== previewSize;

        try {
          if (needsResize) {
            await qrCodeInstance.update({
              width: exportSize,
              height: exportSize,
              margin: getMargin(exportSize)
            });
          }
          await qrCodeInstance.download({ name: 'cuteqr-code', extension: extension });
          showToast(extension.toUpperCase() + ' download started.', 'success');
        } catch (err) {
          console.error('Download error:', err);
          showToast('Download failed. Please try again.', 'error');
        } finally {
          if (needsResize) {
            try {
              await qrCodeInstance.update({
                width: previewSize,
                height: previewSize,
                margin: getMargin(previewSize)
              });
            } catch (e) { /* ignore */ }
          }
        }
      }

      btnDownloadPng.addEventListener('click', function() { downloadQR('png'); });
      btnDownloadSvg.addEventListener('click', function() { downloadQR('svg'); });

      // ============================ Copy ============================
      btnCopy.addEventListener('click', function() {
        if (!currentPayload) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(currentPayload)
            .then(function() { showToast('Content copied to clipboard.', 'success'); })
            .catch(function() { fallbackCopy(currentPayload); });
        } else {
          fallbackCopy(currentPayload);
        }
      });

      function fallbackCopy(text) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('Content copied to clipboard.', 'success');
        } catch (err) {
          console.error('Fallback copy error:', err);
          showToast('Copy failed. Please copy manually.', 'error');
        }
      }

      // ============================ Hero visual ============================
      function initHeroVisual() {
        if (heroInitialized) return;
        if (typeof QRCodeStyling === 'undefined') return;
        heroInitialized = true;

        var samples = [
          { el: 'heroQrMain', data: 'https://example.com', themeId: 'cat', size: 160, fg: '#6554c0', bg: '#ffffff' },
          { el: 'heroQrA', data: 'Hello from CuteQR!', themeId: 'heart', size: 90, fg: '#be185d', bg: '#fdf2f8' },
          { el: 'heroQrB', data: 'WIFI:T:WPA;S:MyNetwork;P:password;;', themeId: 'leaf', size: 90, fg: '#0f766e', bg: '#f0fdfa' }
        ];

        samples.forEach(function(sample) {
          var el = document.getElementById(sample.el);
          if (!el) return;
          var theme = creativeThemes.find(function(t) { return t.id === sample.themeId; });
          try {
            var qr = new QRCodeStyling({
              width: sample.size,
              height: sample.size,
              data: sample.data,
              margin: 10,
              qrOptions: { errorCorrectionLevel: 'H' },
              dotsOptions: { color: sample.fg, type: 'rounded' },
              backgroundOptions: { color: sample.bg },
              cornersSquareOptions: { color: sample.fg, type: 'extra-rounded' },
              cornersDotOptions: { color: sample.fg, type: 'dot' },
              image: theme ? themeImageData(theme) : undefined,
              imageOptions: { hideBackgroundDots: true, imageSize: 0.18, margin: 6 }
            });
            qr.append(el);
          } catch (e) {
            // Silent fail — decorative only
          }
        });
      }

      // ============================ Init ============================
      showEmptyPreview('Enter content and tap Generate');
      setStatus('waiting', 'Waiting for content');
      updateEccLock();
      renderThemeOptions();

      window.addEventListener('load', function() {
        if (typeof QRCodeStyling !== 'undefined') {
          initHeroVisual();
        } else {
          setStatus('error', 'QR library unavailable');
          showToast('QR library failed to load. Check your internet connection or allow unpkg.com.', 'error');
        }
      });
    })();
