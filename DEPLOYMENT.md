# Deployment Guide for Prompt IQ

This guide will help you deploy Prompt IQ to production.

## 🚀 Quick Deploy to Vercel

### 1. Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy!

### 3. Environment Variables for Production

Add these in your Vercel dashboard under Settings > Environment Variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_with_newlines

# Google Gemini AI
GEMINI_API_KEY=your_production_gemini_api_key

# Razorpay (Production Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret

# Next.js
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secure_random_string
```

## 🔧 Pre-Deployment Checklist

### Firebase Configuration

- [ ] Enable Authentication (Email/Password + Google)
- [ ] Set up Firestore database
- [ ] Deploy Firestore security rules
- [ ] Add production domain to authorized domains
- [ ] Generate and configure service account key

### Google Gemini API

- [ ] Create production API key
- [ ] Set up billing (if required)
- [ ] Configure API quotas and limits

### Razorpay Setup

- [ ] Switch to live mode in Razorpay dashboard
- [ ] Get production API keys
- [ ] Configure webhooks (optional)
- [ ] Set up payment methods

### Domain & SSL

- [ ] Configure custom domain (optional)
- [ ] SSL certificate (automatic with Vercel)
- [ ] Update Firebase authorized domains

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different API keys for development and production
- Regularly rotate sensitive keys

### Firebase Security
- Review and test Firestore security rules
- Enable App Check for additional security
- Monitor usage and set up alerts

### Payment Security
- Use Razorpay's live keys only in production
- Implement proper webhook verification
- Monitor transactions for anomalies

## 📊 Monitoring & Analytics

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user analytics

### Performance Monitoring
- Vercel Analytics (built-in)
- Core Web Vitals monitoring
- Firebase Performance Monitoring

## 🚀 Post-Deployment Steps

### 1. Test All Features
- [ ] User registration and login
- [ ] Prompt enhancement functionality
- [ ] Payment processing
- [ ] Credit system
- [ ] History page

### 2. Set Up Monitoring
- [ ] Configure error alerts
- [ ] Set up uptime monitoring
- [ ] Monitor API usage and costs

### 3. Performance Optimization
- [ ] Enable Vercel Edge Functions (if needed)
- [ ] Optimize images and assets
- [ ] Set up CDN for static assets

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Review build logs for specific errors

2. **Authentication Issues**
   - Verify Firebase configuration
   - Check authorized domains
   - Ensure service account key is valid

3. **Payment Issues**
   - Confirm Razorpay keys are for live mode
   - Check webhook configurations
   - Verify currency and amount formats

4. **API Errors**
   - Monitor Gemini API quotas
   - Check Firebase usage limits
   - Review error logs in Vercel dashboard

### Getting Help

- Check Vercel deployment logs
- Review Firebase console for errors
- Monitor Razorpay dashboard for payment issues
- Contact support if needed

## 📈 Scaling Considerations

### Database
- Monitor Firestore usage and costs
- Implement proper indexing
- Consider data archiving strategies

### API Limits
- Monitor Gemini API usage
- Implement rate limiting
- Consider caching strategies

### Performance
- Use Vercel Edge Functions for global performance
- Implement proper caching headers
- Optimize bundle size

---

**Your Prompt IQ app is now ready for the world! 🎉**
