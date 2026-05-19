SHMU ADMIN — SECURITY MODEL
============================

There are TWO independent layers of protection on this folder:

1) SERVER-LEVEL: Apache Basic Auth via .htaccess + .htpasswd
   Apache will prompt for username/password BEFORE serving any file
   here. Open the .htaccess file and follow the comments to point
   AuthUserFile at the correct absolute path for your hosting account.

   Default credentials:
     Username: admin
     Password: B6CpsYvuoBOmuohEJ0OU

   To change the password:
     - Generate a new hash:  htpasswd -nB admin NEW_PASSWORD
       (or use https://hostingcanada.org/htpasswd-generator/)
     - Replace the line in .htpasswd with the new hash.

2) CLIENT-LEVEL: JavaScript SHA-256 login inside admin/index.html
   Even if someone gets past the server-level prompt, they still see
   a second login form. The password is the same by default. To rotate
   it, change ADMIN_HASH inside admin/index.html (script at the bottom
   of the page).

HOSTING NOTES
-------------
- .htaccess only works on Apache. If you host on Nginx, GitHub Pages,
  Netlify, or Vercel, the .htaccess file is ignored — only the JS
  layer protects the page.
- For real production security on a static site, the standard answer
  is to put the admin behind your CDN's access control (e.g., Cloudflare
  Access) or move it to a separate authenticated subdomain.

WHY TWO LAYERS?
---------------
- Browsing the source of admin/index.html reveals the SHA-256 hash of
  the admin password. A 20-character random password is uncrackable in
  practice (≈ 119 bits of entropy, longer than the age of the universe
  at billions of guesses/sec), so this is fine for casual protection.
- The .htaccess layer stops anyone — even with the page source —
  from reaching the page at all, since Apache rejects unauthorized
  requests before any HTML is sent.
