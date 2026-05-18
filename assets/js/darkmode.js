/* Dark mode toggle — persists via localStorage */
(function () {
    'use strict';

    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.documentElement.classList.add('dark-mode-pre');
        document.addEventListener('DOMContentLoaded', function () {
            document.body.classList.add('dark-mode');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('darkModeToggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem(
                'dark-mode',
                document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
            );
        });
    });
})();
