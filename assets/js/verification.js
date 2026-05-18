/* ============================================
   PASSWORD GATE
   Hides page content until correct password entered.
   Password is hashed (SHA-256) so plaintext isn't exposed in source.
   Current password: 4204ever
   ============================================ */
(function () {
    'use strict';

    var COOKIE_NAME = 'shmu_access';
    var COOKIE_DAYS = 30;
    // SHA-256 hash of "4204ever"
    var PASSWORD_HASH = 'fff47eba0ab3e3040a2d8be202f4a2934feb1950244a2b228436c4eeb1449f29';

    function getCookie(name) {
        var nameEQ = name + '=';
        var parts = document.cookie.split(';');
        for (var i = 0; i < parts.length; i++) {
            var c = parts[i].trim();
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
    }

    async function sha256(text) {
        var buffer = new TextEncoder().encode(text);
        var hash = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hash))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
    }

    function buildGate() {
        document.body.classList.add('gate-active');

        // Hide any existing site content
        var wrap = document.getElementById('wrapper');
        if (wrap) wrap.style.display = 'none';

        var shell = document.createElement('div');
        shell.className = 'gate-shell';
        shell.innerHTML =
            '<img src="assets/img/shmu_logo.png" alt="Shmu The Cannaprophet" class="gate-logo" />' +
            '<div class="gate-card">' +
                '<h2 class="gate-title">Enter Password</h2>' +
                '<form id="gate-form" autocomplete="off">' +
                    '<input type="password" id="gate-password" class="gate-input" placeholder="Password" autofocus />' +
                    '<button type="submit" class="gate-submit">Unlock</button>' +
                    '<div class="gate-error" id="gate-error"></div>' +
                '</form>' +
            '</div>' +
            '<div class="gate-contact">' +
                '<div class="gate-contact-heading">Reach out for access</div>' +
                '<div class="gate-contact-list">' +
                    '<a href="https://t.me/shmuthecannaprophet" target="_blank" rel="noopener" class="gate-contact-item">' +
                        '<svg class="gate-contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.939z"/></svg>' +
                        '@ShmuTheCannaProphet' +
                    '</a>' +
                    '<a href="https://signal.me/#eu/69vs4yBJVlFLkDdItViVK-9OfVjF9jSCcQD2yyIJr19NPF3KSQFAH6oNxHPXYKQB" target="_blank" rel="noopener" class="gate-contact-item">' +
                        '<svg class="gate-contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.547 4.103 1.508 5.832L0 24l6.305-1.477A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>' +
                        'CannaProphet.420' +
                    '</a>' +
                    '<a href="tel:267-900-6604" class="gate-contact-item">' +
                        '<svg class="gate-contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2a15.07 15.07 0 01-6.59-6.58l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>' +
                        '267-900-6604' +
                    '</a>' +
                '</div>' +
            '</div>';

        document.body.appendChild(shell);

        var form = document.getElementById('gate-form');
        var input = document.getElementById('gate-password');
        var errorEl = document.getElementById('gate-error');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            errorEl.textContent = '';
            var val = input.value.trim();
            if (!val) return;
            try {
                var hash = await sha256(val);
                if (hash === PASSWORD_HASH) {
                    setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
                    location.reload();
                } else {
                    errorEl.textContent = 'Incorrect password. Try again.';
                    input.value = '';
                    input.focus();
                }
            } catch (err) {
                errorEl.textContent = 'Browser does not support secure hashing.';
            }
        });
    }

    function init() {
        if (getCookie(COOKIE_NAME) === '1') return; // authenticated, do nothing
        buildGate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
