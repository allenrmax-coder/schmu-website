/* ============================================
   Site-wide UI helpers — dark mode + copy-email
   Loaded on every page.
   ============================================ */
(function () {
    'use strict';

    // ---------- Dark mode ----------
    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.documentElement.classList.add('dark-mode-pre');
        document.addEventListener('DOMContentLoaded', function () {
            document.body.classList.add('dark-mode');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('darkModeToggle');
        if (btn) {
            btn.addEventListener('click', function () {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem(
                    'dark-mode',
                    document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
                );
            });
        }
    });

    // ---------- Copy-to-clipboard for email links ----------
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (e) {
                reject(e);
            } finally {
                document.body.removeChild(ta);
            }
        });
    }

    function showToast(message) {
        var existing = document.getElementById('shmu-toast');
        if (existing) existing.remove();
        var t = document.createElement('div');
        t.id = 'shmu-toast';
        t.className = 'shmu-toast';
        t.setAttribute('role', 'status');
        t.setAttribute('aria-live', 'polite');
        t.textContent = message;
        document.body.appendChild(t);
        // Force reflow then add 'show' for transition
        // eslint-disable-next-line
        t.offsetWidth;
        t.classList.add('show');
        clearTimeout(t._hide);
        t._hide = setTimeout(function () {
            t.classList.remove('show');
            setTimeout(function () { if (t.parentNode) t.remove(); }, 320);
        }, 2400);
    }

    document.addEventListener('click', function (e) {
        var target = e.target.closest && e.target.closest('[data-copy-email]');
        if (!target) return;
        e.preventDefault();
        var email = target.getAttribute('data-copy-email');
        if (!email) return;
        copyText(email).then(function () {
            showToast('Email copied — ' + email);
        }).catch(function () {
            showToast(email);
        });
    });

    // ---------- Hidden quad-click admin trigger ----------
    // 4 fast clicks on the SHMU brand mark opens /admin/.
    // Counter is stored in sessionStorage so it survives the navigation
    // that happens between clicks (since the brand is also a link to home).
    document.addEventListener('DOMContentLoaded', function () {
        var brand = document.querySelector('.navbar-brand');
        if (!brand) return;
        var WINDOW_MS = 1500;
        var THRESHOLD = 4;
        var KEY_COUNT = 'shmu_brand_clicks';
        var KEY_TIME = 'shmu_brand_last';

        brand.addEventListener('click', function (e) {
            var now = Date.now();
            var last = parseInt(sessionStorage.getItem(KEY_TIME) || '0', 10);
            var count = parseInt(sessionStorage.getItem(KEY_COUNT) || '0', 10);

            if (now - last > WINDOW_MS) {
                count = 1;
            } else {
                count += 1;
            }
            sessionStorage.setItem(KEY_COUNT, String(count));
            sessionStorage.setItem(KEY_TIME, String(now));

            if (count >= THRESHOLD) {
                e.preventDefault();
                sessionStorage.removeItem(KEY_COUNT);
                sessionStorage.removeItem(KEY_TIME);
                showToast('Opening admin…');
                var adminPath = location.pathname.indexOf('/menu/') !== -1 ? '../admin/' : 'admin/';
                setTimeout(function () { window.location.href = adminPath; }, 200);
            }
        });
    });
})();
