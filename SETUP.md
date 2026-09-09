# Calorie Reminder — real background push setup

This build uses:
- Netlify static hosting
- Netlify Functions
- Netlify Blobs for device schedules/subscriptions
- Netlify Scheduled Functions every minute
- Web Push + VAPID
- iPhone Home Screen PWA notifications

## Recommended deploy: GitHub → Netlify

### 1. Put this project on GitHub
Create a new GitHub repository, then upload ALL files/folders from this project.
Important: keep both the `public` folder and `netlify/functions` folder structure.

### 2. Connect the repo to Netlify
In Netlify:
1. Add new project
2. Import an existing project
3. Choose GitHub
4. Choose your new repository
5. Deploy

The included `netlify.toml` tells Netlify where the functions are and schedules `push-reminders` every minute.

### 3. Generate VAPID keys
On a computer with Node.js installed, open Terminal/Command Prompt inside this project and run:

    npm install
    npx web-push generate-vapid-keys

It prints a Public Key and Private Key.

### 4. Add Netlify environment variables
In Netlify Project configuration / Environment variables, add:

VAPID_PUBLIC_KEY = the generated public key
VAPID_PRIVATE_KEY = the generated private key
VAPID_SUBJECT = mailto:YOUR_EMAIL_ADDRESS

Do not put the private key in index.html or GitHub.

After adding/changing environment variables, trigger a new production deploy.

### 5. Verify Netlify Functions
In Netlify, open Functions.
You should see:
- public-key
- save-subscription
- test-push
- push-reminders

`push-reminders` should show as Scheduled.

### 6. Reinstall the iPhone PWA
Because this version changes the service worker:
1. Delete the old Calorie Reminder Home Screen icon.
2. Open your normal Netlify URL in Safari.
3. Share → Add to Home Screen.
4. Launch from the new Home Screen icon.

### 7. Enable and test
1. Complete profile
2. Build schedule
3. Change meal times if needed
4. Tap Save Updated Time
5. Tap Enable Push Notifications
6. Allow notifications
7. Tap Send Test Push
8. Switch to another app or lock the phone

The test notification should arrive as a real push.

For a schedule test, set a meal 2–3 minutes in the future, tap Save Updated Time, lock the phone, and wait. The scheduled function runs once per minute, so delivery may be slightly after the exact minute.

## Notes
- On iPhone, Web Push requires the site to be installed to the Home Screen.
- Scheduled functions run on published production deploys.
- Netlify scheduled functions use UTC internally, but this app stores each phone's IANA time zone and converts it before matching meal times.
- If a push subscription expires (404/410), the scheduled function removes it automatically.


The website itself is in `public/`. The backend source stays outside the public web folder.
