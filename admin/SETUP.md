# Setting up the "Publish to Site" button

The admin panel can write your menu/announcement changes directly to the
server so the public site updates instantly for everyone. This requires
~3 minutes of one-time setup on your hosting account. After that, every
content update is a one-click action.

---

## What you need

- Apache hosting with **PHP enabled** (yours already has it — `password.php`
  works on the live site, which proves PHP runs)
- Access to your hosting's **File Manager** (cPanel, Plesk, DirectAdmin —
  any of them work) **or** an FTP client like FileZilla / Cyberduck
- About 3 minutes

---

## Step 1 — Upload the site

Take the whole **`schmu-website`** folder and upload its **contents** to your
`public_html/` (also called `htdocs/` on some hosts).

You only do this **once**. Future content edits go through the admin panel,
not through file uploads.

Final layout on your server should look like:

```
public_html/
├── index.html
├── about.html
├── announcements.html
├── community.html
├── gallery.html
├── admin/
│   ├── index.html
│   ├── save.php          ← critical
│   ├── .htaccess         ← critical (see Step 2)
│   ├── .htpasswd
│   ├── backups/
│   └── README.txt
├── assets/
│   ├── css/
│   ├── data/
│   │   ├── menu.json     ← will be overwritten by Publish
│   │   └── announcements.json   ← will be overwritten by Publish
│   ├── img/
│   └── js/
└── menu/
    └── (flower.html, etc.)
```

**Important:** make sure hidden files (`.htaccess`, `.htpasswd`, `.gitignore`)
came along. In cPanel File Manager, go to **Settings → Show Hidden Files**
before uploading.

---

## Step 2 — Configure the .htaccess auth path

Open **`admin/.htaccess`** in File Manager's editor. Find this line near the
bottom:

```apache
AuthUserFile "/home/REPLACE_WITH_YOUR_USERNAME/public_html/admin/.htpasswd"
```

Replace `REPLACE_WITH_YOUR_USERNAME` with your actual cPanel username. To find
your username:

- **cPanel**: top-right of dashboard, or look at the URL bar after login
- Most cPanel hosts use `/home/USERNAME/public_html/...`
- Plesk uses `/var/www/vhosts/yourdomain.com/httpdocs/...`

Save the file.

> **If you don't want server-level Basic Auth**, you can delete the entire
> `admin/.htaccess` file. The admin still requires the JS password before
> you can do anything. It's still secure, just one fewer layer.

---

## Step 3 — Make the data folder writable by PHP

The Publish button needs PHP to write to `assets/data/menu.json` and
`assets/data/announcements.json`. On most shared hosts these are already
writable, but if Publish fails with a "permissions" error, do this:

### In cPanel File Manager:

1. Navigate to `assets/data/`
2. Right-click the folder → **Change Permissions**
3. Set to **755** (rwxr-xr-x)
4. Click each JSON file → **Change Permissions** → **644** (rw-r--r--)

Repeat for `admin/backups/` (set folder to 755).

### Via FTP / SSH:

```bash
chmod 755 public_html/assets/data
chmod 644 public_html/assets/data/*.json
chmod 755 public_html/admin/backups
```

---

## Step 4 — Test it

1. Visit `https://shmuthecannaprophet.com/admin/`
2. (If `.htaccess` is set up) browser asks for username/password:
   - Username: `admin`
   - Password: `B6CpsYvuoBOmuohEJ0OU`
3. JS login appears — same password: `B6CpsYvuoBOmuohEJ0OU`
4. Click the **Announcements** tab
5. Edit any announcement's title (add "TEST" at the end)
6. Click **Publish to Site**
7. Confirm the warning
8. Should see a green toast: *"Published — announcements.json is live for everyone"*
9. Open `https://shmuthecannaprophet.com/announcements.html` in a different
   browser (or incognito tab) — your TEST edit should be there
10. Go back to admin, remove the "TEST" text, Publish again. Done.

---

## Troubleshooting

| Error / symptom | What it means | Fix |
|---|---|---|
| `save.php not found` (404) | File didn't upload, or admin/ folder isn't where expected | Verify `admin/save.php` exists in File Manager; re-upload if missing |
| `Wrong admin password` (403) | Password mismatch between JS and PHP hashes | Make sure you typed `B6CpsYvuoBOmuohEJ0OU` exactly (no spaces) |
| `Could not write file` (500) | Folder/file isn't writable | Re-do Step 3 (`chmod 755` on `assets/data/`, `chmod 644` on JSON files) |
| Browser prompts for password but rejects correct one | Wrong `AuthUserFile` path in `.htaccess` | Re-do Step 2 with correct cPanel username |
| Publish works in admin but live site still shows old content | Browser caching the JSON | Hard-refresh the live site (Ctrl+F5 / Cmd+Shift+R), or just wait 1 minute |

---

## Rotating the admin password

To change the password (do this if anyone else ever sees the current one):

1. Pick a new strong password
2. Compute its SHA-256: `printf "%s" "newpassword" | sha256sum`
   (or use https://emn178.github.io/online-tools/sha256.html)
3. Open `admin/index.html`, find `ADMIN_HASH = '...'` (around line 522), replace
4. Open `admin/save.php`, find `$ADMIN_SHA256 = '...'` (around line 25), replace with the **same** new hash
5. Open `admin/.htpasswd`, regenerate the line:
   - `admin:{SHA}` + base64(sha1(newpassword))
   - Or generate at https://hostingcanada.org/htpasswd-generator/ (pick SHA1 or bcrypt)
6. Save all three files. Done.

---

## Restoring from a backup

Every time you Publish, the old `menu.json` / `announcements.json` is copied to
`admin/backups/{target}-YYYYMMDD-HHMMSS.json`.

To roll back:

1. Open File Manager → `admin/backups/`
2. Find the timestamp you want (e.g., `menu-20251231-204500.json`)
3. Right-click → **Copy** → paste to `assets/data/` and rename to `menu.json`
4. Overwrite when prompted. Done.
