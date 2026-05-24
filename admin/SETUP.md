# Admin workflow — Download & FTP upload

The admin panel edits content in your browser and gives you back a JSON file.
You then upload that JSON file to your server via FTP. No server-side scripting,
no PHP, no write permissions to worry about.

---

## What you need

- Access to the admin panel (URL + password)
- An FTP client (FileZilla, Cyberduck, or your hosting's File Manager)

---

## The workflow

1. Open `https://shmuthecannaprophet.com/admin/`
2. Enter the admin password (default: `B6CpsYvuoBOmuohEJ0OU`)
3. Pick the mode at the top — **Menu** or **Announcements**
4. Make your edits
5. (Optional) Click **Save Preview** to test in your own browser before
   downloading — your changes show up on the live menu/announcements pages
   *for you only*, until you click Clear Preview or close the tab
6. Click **Download JSON**
7. The browser saves `menu.json` (or `announcements.json`) to your Downloads
   folder
8. Open FTP, navigate to `assets/data/` on the server
9. Upload the downloaded file, overwriting the existing one
10. Hard-refresh the live site (Ctrl+F5 / Cmd+Shift+R) to see the change

---

## Server layout

```
public_html/
├── index.html
├── about.html
├── announcements.html
├── community.html
├── gallery.html
├── admin/
│   ├── index.html
│   ├── .htaccess         ← optional Basic Auth layer
│   ├── .htpasswd
│   └── README.txt
├── assets/
│   ├── css/
│   ├── data/
│   │   ├── menu.json              ← upload here
│   │   └── announcements.json     ← upload here
│   ├── img/
│   └── js/
└── menu/
    └── (flower.html, etc.)
```

The admin folder only needs `index.html` (and optionally `.htaccess` /
`.htpasswd` for Basic Auth). No PHP file required.

---

## Rotating the admin password

1. Pick a new strong password
2. Compute its SHA-256:
   - macOS / Linux: `printf "%s" "newpassword" | sha256sum`
   - Or use https://emn178.github.io/online-tools/sha256.html
3. Open `admin/index.html`, find `ADMIN_HASH = '...'` (near the top of the
   script), replace with the new hash
4. If you also use the `.htaccess` Basic Auth layer, regenerate
   `admin/.htpasswd` for the new password too
5. Re-upload `admin/index.html` (and `.htpasswd` if changed) via FTP

---

## Tips

- **Save Preview is your friend.** It saves your changes into your browser's
  storage, and the live pages (e.g. `/announcements.html`) will render the
  preview version for you. Use this to double-check everything before
  downloading and uploading.
- **Clear Preview** removes that browser override so you see the actual
  live server data again.
- If you ever upload the wrong JSON, you can re-upload an older copy.
  Consider keeping a local folder of previous `menu.json` / `announcements.json`
  files for rollback.
