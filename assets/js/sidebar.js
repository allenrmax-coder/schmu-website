/* Sidebar toggle */
(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('sidebarToggle');
        var wrapper = document.getElementById('wrapper');
        if (toggle && wrapper) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                wrapper.classList.toggle('toggled');
            });
        }
    });
})();
