/* ============================================
   MENU RENDERER
   Reads menu.json (with localStorage override)
   and renders the menu sections for a given category.
   Used by all menu pages.
   ============================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'shmu_menu_override';

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function strainClass(strain) {
        if (!strain) return '';
        var s = String(strain).toUpperCase();
        if (s === 'S') return 'strain-s';
        if (s === 'I') return 'strain-i';
        if (s === 'H') return 'strain-h';
        return '';
    }

    // Lookup tables populated from menu.json legend
    var LEGEND_LOOKUP = {};

    function buildLegendLookup(legend) {
        LEGEND_LOOKUP = {};
        if (!legend) return;
        ['growing', 'tier', 'strain'].forEach(function (group) {
            (legend[group] || []).forEach(function (entry) {
                LEGEND_LOOKUP[String(entry.key).toUpperCase()] = entry.desc;
            });
        });
    }

    function explain(key) {
        if (!key) return '';
        var desc = LEGEND_LOOKUP[String(key).toUpperCase()];
        return desc ? key + ' — ' + desc : key;
    }

    function renderStrainTag(strain) {
        if (!strain) return '';
        return '<span class="strain-tag ' + strainClass(strain) + '" title="' + escapeHtml(explain(strain)) + '">' + escapeHtml(strain) + '</span>';
    }

    function renderTags(tags) {
        if (!tags || !tags.length) return '';
        return tags.map(function (t) {
            return '<span class="grow-tag" title="' + escapeHtml(explain(t)) + '">' + escapeHtml(t) + '</span>';
        }).join('');
    }

    function renderTopLegend(legend) {
        if (!legend) return '';
        function group(label, items) {
            if (!items || !items.length) return '';
            var keys = items.map(function (e) {
                var cls = (label === 'Strain') ? ('strain-tag ' + strainClass(e.key)) : 'grow-tag';
                return '<span class="menu-legend-key">' +
                    '<span class="' + cls + '">' + escapeHtml(e.key) + '</span>' +
                    '<span class="menu-legend-key-desc">' + escapeHtml(e.desc) + '</span>' +
                    '</span>';
            }).join('');
            return '<div class="menu-legend-group">' +
                '<div class="menu-legend-group-label">' + escapeHtml(label) + '</div>' +
                '<div class="menu-legend-items">' + keys + '</div>' +
                '</div>';
        }
        return '<details class="menu-legend-full" open>' +
            '<summary>Menu Key — what the symbols mean</summary>' +
            group('Growing', legend.growing) +
            group('Tier', legend.tier) +
            group('Strain', legend.strain) +
            '<p class="menu-legend-note">Sativa / Indica may indicate as little as 60% in one direction. Use Google, Leafly, AllBud, or Seedfinder for full strain details.</p>' +
            '</details>';
    }

    function renderPriceChip(price) {
        if (price.tier === 'ask' || price.amount === '—') {
            return '<span class="price-text">Ask for price</span>';
        }
        return '<span class="price-chip">' +
            '<span class="price-tier">' + escapeHtml(price.tier) + '</span>' +
            '<span class="price-amount">' + escapeHtml(price.amount) + '</span>' +
            '</span>';
    }

    function renderItem(item) {
        var nameParts = ['<span class="menu-row-product">' + escapeHtml(item.name) + '</span>'];
        if (item.tags && item.tags.length) {
            nameParts.push(renderTags(item.tags));
        }
        if (item.strain) {
            nameParts.push(renderStrainTag(item.strain));
        }
        if (item.detail) {
            nameParts.push('<span class="menu-row-detail">' + escapeHtml(item.detail) + '</span>');
        }
        var priceHtml = (item.prices || []).map(renderPriceChip).join('');
        return '<div class="menu-row">' +
            '<div class="menu-row-name">' + nameParts.join(' ') + '</div>' +
            '<div class="menu-row-prices">' + priceHtml + '</div>' +
            '</div>';
    }

    function renderSection(section) {
        var html = '<div class="menu-section">';
        html += '<h3>' + escapeHtml(section.title) + '</h3>';
        if (section.description) {
            html += '<p class="menu-section-description">' + escapeHtml(section.description) + '</p>';
        }
        html += (section.items || []).map(renderItem).join('');
        if (section.addOn) {
            html += '<div class="menu-section-addon"><strong>ADD-ON:</strong> ' + escapeHtml(section.addOn) + '</div>';
        }
        if (section.note) {
            html += '<div class="menu-section-note">' + escapeHtml(section.note) + '</div>';
        }
        html += '</div>';
        return html;
    }

    function renderLegend() {
        return '<div class="strain-legend">' +
            '<span class="strain-legend-item"><span class="strain-tag strain-s">S</span> Sativa</span>' +
            '<span class="strain-legend-item"><span class="strain-tag strain-i">I</span> Indica</span>' +
            '<span class="strain-legend-item"><span class="strain-tag strain-h">H</span> Hybrid</span>' +
            '</div>';
    }

    function renderFooterNotes(notes) {
        if (!notes || !notes.length) return '';
        return '<div class="menu-footer-notes">' +
            notes.map(function (n) {
                return '<p>' + escapeHtml(n) + '</p>';
            }).join('') +
            '</div>';
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

    function loadMenu(assetPath) {
        // Check for override first
        var override = getOverride();
        if (override && override.categories) {
            return Promise.resolve(override);
        }
        return fetch(assetPath + 'data/menu.json', { cache: 'no-cache' })
            .then(function (r) {
                if (!r.ok) throw new Error('Failed to load menu.json');
                return r.json();
            });
    }

    function renderCategory(categoryId, options) {
        options = options || {};
        var assetPath = options.assetPath || 'assets/';
        var titleEl = document.getElementById('page-title');
        var subtitleEl = document.getElementById('page-subtitle');
        var sectionsEl = document.getElementById('menu-sections');
        var legendEl = document.getElementById('strain-legend');
        var menuLegendEl = document.getElementById('menu-legend');
        var notesEl = document.getElementById('menu-footer-notes');

        if (!sectionsEl) {
            console.error('menu-render: missing #menu-sections element on page');
            return;
        }

        sectionsEl.innerHTML = '<p class="menu-loading">Loading menu…</p>';

        loadMenu(assetPath)
            .then(function (data) {
                buildLegendLookup(data.legend);

                var category = data.categories && data.categories[categoryId];
                if (!category) {
                    sectionsEl.innerHTML = '<p class="menu-error">Category not found.</p>';
                    return;
                }
                if (titleEl && category.title) titleEl.textContent = category.title;
                if (subtitleEl && category.subtitle) subtitleEl.textContent = category.subtitle;
                if (document.title.indexOf('Shmu') !== -1) {
                    document.title = category.title + ' — Shmu The Cannaprophet';
                }

                if (menuLegendEl) {
                    menuLegendEl.innerHTML = renderTopLegend(data.legend);
                }

                var html = (category.sections || []).map(renderSection).join('');
                sectionsEl.innerHTML = html;

                if (notesEl && category.footerNotes && category.footerNotes.length) {
                    notesEl.innerHTML = renderFooterNotes(category.footerNotes);
                } else if (notesEl) {
                    notesEl.innerHTML = '';
                }

                if (legendEl) {
                    legendEl.innerHTML = renderLegend();
                }
            })
            .catch(function (err) {
                sectionsEl.innerHTML = '<p class="menu-error">Could not load menu: ' + escapeHtml(err.message) + '</p>';
            });
    }

    // Expose globally for inline scripts on menu pages
    window.ShmuMenu = {
        render: renderCategory,
        STORAGE_KEY: STORAGE_KEY,
        loadMenu: loadMenu,
        getOverride: getOverride
    };
})();
