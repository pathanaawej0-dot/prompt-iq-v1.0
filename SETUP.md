# Quick Setup Guide for Prompt IQ

Follow these steps to get Prompt IQ running locally in under 10 minutes.

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values (see detailed setup below).

### 3. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 🔑 Getting Your API Keys

### Firebase Setup (5 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it "prompt-iq" or similar
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (add your email as test user)

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode
   - Choose your region

4. **Get Configuration**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web app" icon
   - Register app as "Prompt IQ"
   - Copy the config values to your `.env.local`

5. **Generate Service Account**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy `client_email` and `private_key` to `.env.local`

### Google Gemini API (2 minutes)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to `GEMINI_API_KEY` in `.env.local`

### Razorpay Setup (3 minutes)

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings > API Keys
3. Generate Test Keys
4. Copy Key ID and Key Secret to `.env.local`

## 📝 Environment Variables Template

Your `.env.local` should look like this:

```env
# Firebase - Get from Firebase Console > Project Settings
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prompt-iq-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-iq-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prompt-iq-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin - Get from Service Account JSON
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@prompt-iq-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Google Gemini - Get from AI Studio
GEMINI_API_KEY=AIzaSyD...

# Razorpay - Get from Dashboard > Settings > API Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_key

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 🔧 Deploy Firestore Rules

After setting up Firestore, deploy the security rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (choose Firestore only)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## ✅ Test Your Setup

1. **Start the app**: `npm run dev`
2. **Test signup**: Create an account with email/password
3. **Test Google login**: Sign in with Google
4. **Test enhancement**: Try enhancing a prompt
5. **Check credits**: Verify credit deduction works
6. **Test payment**: Try the payment flow (test mode)

## 🚨 Common Issues & Solutions

### Firebase Issues
- **"Firebase config not found"**: Check your environment variables are correct
- **"Auth domain not authorized"**: Add `localhost:3000` to Firebase authorized domains
- **"Firestore permission denied"**: Deploy the firestore rules

### Gemini API Issues
- **"API key invalid"**: Make sure you copied the full key
- **"Quota exceeded"**: Gemini has free tier limits, check your usage

### Razorpay Issues
- **"Key ID invalid"**: Make sure you're using test keys for development
- **"Payment failed"**: Check if test mode is enabled

### General Issues
- **Build errors**: Run `npm install` again
- **Port already in use**: Kill the process or use `npm run dev -- -p 3001`
- **Environment variables not loading**: Restart the dev server

## 🎯 Next Steps

Once everything is working:

1. **Customize the app**: Update branding, colors, copy
2. **Add features**: Implement additional functionality
3. **Deploy**: Follow the deployment guide
4. **Monitor**: Set up analytics and error tracking

## 🆘 Need Help?

- Check the full README.md for detailed documentation
- Review the DEPLOYMENT.md for production setup
- Create an issue on GitHub if you're stuck

---

**You're all set! Start building amazing AI prompts! 🚀**
