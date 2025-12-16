# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Whiskerknots Crochet application.

## Prerequisites

- A Google account
- Firebase project (free tier is sufficient)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `whiskerknots-crochet` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web** icon (`</>`)
2. Register your app with a nickname: `Whiskerknots Web App`
3. **Don't** check "Set up Firebase Hosting" (unless you want to use it)
4. Click "Register app"
5. Copy the `firebaseConfig` object - you'll need these values

## Step 3: Enable Authentication

1. In the Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 4: Set Up Firestore Database

1. In the Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll set rules later)
4. Select your preferred location (choose closest to your users)
5. Click "Enable"

## Step 5: Configure Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Users collection - users can only read/write their own data
match /users/{userId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}

    // Add more collections as needed
    match /{document=**} {
      allow read, write: if false; // Deny all other access by default
    }

}
}
\`\`\`

3. Click "Publish"

## Step 6: Add Firebase Config to Your Project

1. Create a `.env.local` file in your project root (copy from `env.example`)
2. Add your Firebase configuration values:

\`\`\`env
GEMINI_API_KEY=your_gemini_key_here

# Firebase Configuration

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
\`\`\`

**Where to find these values:**

- Go to Project Settings (gear icon) → General
- Scroll down to "Your apps" section
- Copy each value from the `firebaseConfig` object

## Step 7: Test Your Setup

1. Install dependencies (if not already done):
   \`\`\`bash
   npm install
   \`\`\`

2. Run your development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Navigate to `http://localhost:3000/signup`
4. Create a test account
5. Check Firebase Console → Authentication to see your new user

## Features Implemented

### Authentication

- ✅ Email/Password sign up
- ✅ Email/Password login
- ✅ User profile management
- ✅ Secure logout
- ✅ Protected routes (checkout requires login)
- ✅ Auth state persistence

### Data Synchronization

- ✅ Cart items sync to Firebase when user logs in
- ✅ Favorites sync to Firebase when user logs in
- ✅ Local data preserved and merged with Firebase data
- ✅ Real-time sync on cart/favorites changes

### User Experience

- ✅ Redirect to login when accessing checkout without auth
- ✅ Return to intended page after login
- ✅ Pre-filled email on checkout
- ✅ User menu in navbar with profile access
- ✅ Responsive design matching site theme

## File Structure

\`\`\`
lib/
firebase.ts # Firebase initialization
context/
AuthContext.tsx # Authentication state management
CartContext.tsx # Cart with Firebase sync
components/
FavoritesSyncProvider.tsx # Favorites sync with Firebase
Navbar.tsx # Updated with auth UI
app/
login/
page.tsx # Login page
signup/
page.tsx # Signup page
profile/
page.tsx # User profile page
checkout/
page.tsx # Protected checkout page
utils/
favoritesSync.ts # Favorites sync utilities
\`\`\`

## Troubleshooting

### Firebase Not Initializing

- Verify all environment variables are set correctly
- Check that `.env.local` is in the project root
- Restart the development server after adding env variables

### Authentication Errors

- Check that Email/Password is enabled in Firebase Console
- Verify Firestore security rules are published
- Check browser console for detailed error messages

### Data Not Syncing

- Verify user is logged in (check Firebase Console → Authentication)
- Check Firestore security rules allow user to access their document
- Check browser console for Firebase errors

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use Firestore security rules** - Always validate on the server side
3. **Rotate API keys** if they are exposed
4. **Enable App Check** for production (optional but recommended)
5. **Set up password policies** in Firebase Console

## Next Steps

- Add password reset functionality
- Implement email verification
- Add OAuth providers (Google, Facebook, etc.)
- Create order history in Firestore
- Add user address book
- Implement wishlist feature

## Support

For Firebase-specific issues:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For project-specific issues, check the main README.md file.
