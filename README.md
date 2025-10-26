# Prompt IQ - AI Prompt Enhancement Tool

Transform your basic prompts into detailed, effective instructions that get better results from ChatGPT, Claude, Gemini, and other AI models.

## 🚀 Features

- **AI-Powered Enhancement**: Transform basic prompts using Google Gemini 2.5 Flash
- **Authentication**: Firebase Auth with Google Sign-In and Email/Password
- **Credits System**: Flexible pricing with free tier and paid plans
- **Payment Integration**: Secure payments with Razorpay
- **Prompt History**: Save and manage all your enhanced prompts
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Live credit tracking and instant enhancements

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI**: Google Gemini 2.5 Flash API
- **Payments**: Razorpay
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project with Firestore and Authentication enabled
- A Google Gemini API key
- A Razorpay account for payments

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd prompt-iq
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add your environment variables:

```bash
# Copy from env.example
cp env.example .env.local
```

Fill in your actual values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Firebase Admin (Server-side)
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore

2. **Configure Authentication**:
   - Enable Email/Password and Google sign-in methods
   - Add your domain to authorized domains

3. **Set up Firestore**:
   - Create a Firestore database
   - Deploy the security rules from `firestore.rules`

4. **Generate Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Use the credentials in your environment variables

### 5. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

### 6. Razorpay Setup

1. Create a [Razorpay account](https://razorpay.com/)
2. Get your Key ID and Key Secret from the dashboard
3. Add them to your environment variables

### 7. Deploy Firestore Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
prompt-iq/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── enhance/              # Gemini AI integration
│   │   ├── credits/              # Credits management
│   │   ├── payment/              # Razorpay integration
│   │   └── user/                 # User management
│   ├── dashboard/                # Main dashboard
│   ├── history/                  # Prompt history
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── pricing/                  # Pricing and payments
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Homepage
│   ├── loading.js                # Loading UI
│   ├── error.js                  # Error UI
│   └── not-found.js              # 404 page
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   ├── Navbar.js                 # Navigation
│   └── PaymentModal.js           # Payment interface
├── contexts/                     # React contexts
│   └── AuthContext.js            # Authentication state
├── lib/                          # Utility libraries
│   ├── firebase.js               # Firebase client config
│   └── firebase-admin.js         # Firebase admin config
├── firestore.rules               # Firestore security rules
├── middleware.js                 # Next.js middleware
└── env.example                   # Environment template
```

## 🔒 Security Features

- **Firestore Security Rules**: Protect user data and ensure proper access control
- **Server-side Validation**: All API routes validate Firebase tokens
- **Payment Security**: Razorpay signature verification
- **Input Sanitization**: Proper validation of all user inputs
- **Rate Limiting**: Built-in protection against abuse

## 💳 Pricing Plans

- **Free**: 3 total prompt enhancements
- **Starter**: ₹99/month - 50 enhancements
- **Pro**: ₹299/month - 200 enhancements  
- **Ultimate**: ₹999/month - Unlimited enhancements

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Email**: support@promptiq.com
- **Documentation**: [docs.promptiq.com](https://docs.promptiq.com)
- **Issues**: Create an issue on GitHub

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Firebase for backend services
- Razorpay for payment processing
- Vercel for hosting platform
- All the amazing open-source libraries used

---

**Built with ❤️ for the AI community**
