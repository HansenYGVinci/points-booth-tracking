# Firebase Setup Instructions

## Step-by-Step Guide to Set Up Firebase for Points & Booth Tracking App

### Prerequisites
- Make sure you're logged into Firebase with **hansenygeraldi@gmail.com**

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or "Create a project")
3. Enter project name (e.g., "points-booth-tracking")
4. Accept the Firebase terms and click **"Continue"**
5. **Disable Google Analytics** for this MVP (uncheck the box)
6. Click **"Create project"**
7. Wait for project creation to complete, then click **"Continue"**

### Step 2: Set Up Firestore Database
1. In your Firebase project dashboard, click **"Build"** in the left sidebar
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Select a location (choose closest to your users, e.g., "us-central")
5. Choose **"Start in Test Mode"** for development
6. Click **"Enable"**

### Step 3: Configure Firestore Security Rules
1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with these (for MVP testing):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**

### Step 4: Get Firebase Configuration
1. In Firebase project dashboard, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. Click the **"web"** icon (</>)
5. Enter app name (e.g., "Points Booth Tracking")
6. **Don't check** "Firebase Hosting" for now
7. Click **"Register app"**
8. Copy the **firebaseConfig** object that appears
9. Click **"Continue to console"**

### Step 5: Update app.js with Your Config
1. Open `app.js` in your code editor
2. Replace the placeholder `firebaseConfig` object with your actual config:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```
3. Save the file

### Step 6: Test the App Locally
1. Open `index.html` in your web browser
2. Test with a regular user ID (e.g., "12345678")
3. Test with admin IDs:
   - "88880001" (Booth 1 Admin)
   - "88880002" (Booth 2 Admin)
   - "88880003" (Booth 3 Admin)
   - "88889999" (Super Admin)

### Step 7: Deploy to GitHub Pages
1. Create a new GitHub repository
2. Upload `index.html`, `app.js`, and `style.css` to the repository
3. Go to repository **Settings** > **Pages**
4. Under **Source**, select **"Deploy from a branch"**
5. Choose **"main"** branch and **"/ (root)"** folder
6. Click **"Save"**
7. Wait for deployment and access your app at the provided URL

### Important Security Notes
⚠️ **The Firestore rules above allow anyone to read/write data.** For production:
- Implement proper authentication
- Restrict write access based on user roles
- Use Firebase Authentication for secure login

### Admin ID Reference
- **88880001**: Booth 1 Admin (can only toggle Booth 1)
- **88880002**: Booth 2 Admin (can only toggle Booth 2)
- **88880003**: Booth 3 Admin (can only toggle Booth 3)
- **88889999**: Super Admin (can toggle all booths + process purchases)

### Troubleshooting
- If you see "Permission denied" errors, check Firestore rules
- If data doesn't update in real-time, check browser console for errors
- Ensure you're using the correct Firebase project ID in the config