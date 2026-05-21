/* ============================================
   ANNOUNCEMENTS RENDERER
   Reads announcements.json (with localStorage override) and renders
   the cards. Mirrors the menu-render.js pattern so the admin page
   can use the same localStorage override key to push edits.
   ============================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'shmu_announcements_override';

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getOverride() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function loadData(assetPath) {
        var override = getOverride();
        if (override && override.announcements) {
            return Promise.resolve(override);
        }
        return fetch(assetPath + 'data/announcements.json', { cache: 'no-cache' })
            .then(function (r) {
                if (!r.ok) throw new Error('Failed to load announcements.json');
                return r.json();
            });
    }

    function renderButton(btn, assetPath) {
        // assetPath is 'assets/' on root pages, '../assets/' inside subfolders.
        // Buttons in JSON store paths relative to the SITE ROOT (e.g. menu/flower.html).
        // We don't rewrite — the JSON-stored paths are already site-root-relative,
        // which works from announcements.html (a root page). If announcements ever
        // moves to a subfolder we'd prefix here.
        return '<a href="' + escapeHtml(btn.href) + '" class="btn btn-primary">' + escapeHtml(btn.text) + '</a>';
    }

    function renderCard(item, assetPath) {
        var btnHtml = (item.buttons || []).map(function (b) { return renderButton(b, assetPath); }).join('');
        var introHtml = item.intro ? '<p class="card-text">' + escapeHtml(item.intro) + '</p>' : '';
        // body is HTML — not escaped (admin trusted)
        var bodyHtml = item.body || '';
        return '<div class="card w-75 mb-3" data-ann-id="' + escapeHtml(item.id) + '">' +
                '<h5 class="card-header">' + escapeHtml(item.date) + '</h5>' +
                '<div class="card-body">' +
                    '<h5 class="card-title">' + escapeHtml(item.title) + '</h5>' +
                    introHtml +
                    bodyHtml +
                    btnHtml +
                '</div>' +
            '</div>';
    }

    function renderAll(options) {
        options = options || {};
        var assetPath = options.assetPath || 'assets/';
        var subtitleEl = document.getElementById('announcements-subtitle');
        var listEl = document.getElementById('announcements-list');
        var footerNoteEl = document.getElementById('announcements-footer-note');

        if (!listEl) {
            console.error('announcements-render: missing #announcements-list element');
            return;
        }

        listEl.innerHTML = '<p class="menu-loading">Loading announcements…</p>';

        loadData(assetPath)
            .then(function (data) {
                if (subtitleEl && data.subtitle) subtitleEl.textContent = data.subtitle;
                if (footerNoteEl && data.footerNote) footerNoteEl.textContent = data.footerNote;

                var items = data.announcements || [];
                if (!items.length) {
                    listEl.innerHTML = '<p class="menu-loading">No announcements yet.</p>';
                    return;
                }
                listEl.innerHTML = items.map(function (item) { return renderCard(item, assetPath); }).join('');
            })
            .catch(function (err) {
                listEl.innerHTML = '<p class="menu-error">Could not load announcements: ' + escapeHtml(err.message) + '</p>';
            });
    }

    window.ShmuAnnouncements = {
        render: renderAll,
        STORAGE_KEY: STORAGE_KEY,
        loadData: loadData,
        getOverride: getOverride
    };
})();
