/* ============================================
   PASSWORD GATE
   Matches live site style — purple bg, cream box, green button.
   Password is SHA-256 hashed.
   Current password: 4204ever
   ============================================ */
(function () {
    'use strict';

    var COOKIE_NAME = 'shmu_access';
    var COOKIE_DAYS = 30;
    var PASSWORD_HASH = 'fff47eba0ab3e3040a2d8be202f4a2934feb1950244a2b228436c4eeb1449f29';

    // Determine asset path relative to current page
    var ASSET_PATH = (function () {
        var path = location.pathname;
        // If inside /menu/ or any subfolder of project root, use ../assets/
        if (/\/menu\//.test(path)) return '../assets/';
        return 'assets/';
    })();

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

        var wrap = document.getElementById('wrapper');
        if (wrap) wrap.style.display = 'none';

        var shell = document.createElement('div');
        shell.className = 'gate-shell';
        shell.innerHTML =
            '<img src="' + ASSET_PATH + 'img/shmu_logo.png" alt="Shmu The Cannaprophet" class="gate-logo" />' +
            '<div class="gate-card">' +
                '<h2 class="gate-title">Enter Password</h2>' +
                '<form id="gate-form" autocomplete="off">' +
                    '<input type="password" id="gate-password" class="gate-input" placeholder="Password" autofocus />' +
                    '<button type="submit" class="gate-submit">Submit</button>' +
                    '<div class="gate-error" id="gate-error"></div>' +
                '</form>' +
            '</div>' +
            '<div class="gate-contact">' +
                '<div class="gate-contact-heading">Reach out to us for access!</div>' +
                '<div class="gate-contact-list">' +
                    '<a href="https://t.me/shmuthecannaprophet" target="_blank" rel="noopener" class="gate-contact-item">' +
                        '<img src="' + ASSET_PATH + 'img/telegram.png" alt="Telegram" class="gate-contact-icon" />' +
                        '@ShmuTheCannaProphet' +
                    '</a>' +
                    '<a href="https://signal.me/#eu/69vs4yBJVlFLkDdItViVK-9OfVjF9jSCcQD2yyIJr19NPF3KSQFAH6oNxHPXYKQB" target="_blank" rel="noopener" class="gate-contact-item">' +
                        '<img src="' + ASSET_PATH + 'img/signal.png" alt="Signal" class="gate-contact-icon" />' +
                        'CannaProphet.420' +
                    '</a>' +
                    '<a href="sms:+12679006604" class="gate-contact-item">' +
                        '<img src="' + ASSET_PATH + 'img/phone.png" alt="Phone" class="gate-contact-icon" />' +
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
        if (getCookie(COOKIE_NAME) === '1') return;
        buildGate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
