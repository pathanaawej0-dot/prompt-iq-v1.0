#!/bin/bash

echo "🚀 Setting up Vercel Environment Variables for Prompt IQ..."

# Firebase Configuration (Client-side)
echo "Adding Firebase client configuration..."
echo "AIzaSyBSRxBESDVf2b77qS6fZuSg6upHBxG3Jtk" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo "prompt-iq-latest.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo "prompt-iq-latest" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo "prompt-iq-latest.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo "97427812353" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo "1:97427812353:web:444bbfd793e6342c1dd000" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
echo "G-YK0GYZJQL9" | vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production

# Firebase Admin (Server-side)
echo "Adding Firebase admin configuration..."
echo "firebase-adminsdk-fbsvc@prompt-iq-latest.iam.gserviceaccount.com" | vercel env add FIREBASE_CLIENT_EMAIL production
echo "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/Uqe9TqJYCyEm\nj7mJWn19tqPDBvVpEu/OHbOXD752uGv9pQe3nM6RTXIEjz1WOqx6NutqbSvfYAbA\nGpt4QUpFGvLGZyChkcIThkeQAO4uZcClwFW3zDHnRl+zN3+5c7e1Gs2MTMhk1f3T\nWmfOuKWLbWqjhGFv/IDH5g9vulEetqB6nsGE2BuxHAVkpgi4ZYVBNH+csAyYP6mb\nK5x74Y6tWGJFtWsnCGeDUVtRPSKO+2dpCSH3LKWdue1GtLj+9n8wWGj5EqM5YF5Q\nRPe0apZBKE/8TL+tEwVMkHZnIfXoAmFxi4I7ea5bbFdtvpTm8aGNgK5rx6oz/wgQ\nlb5anSvXAgMBAAECggEAEZfdseRJvHPljAC6bH2EPauuWnBI3+0sXRVRHuqFNrCV\nyaDD2WgTfLwU6INtfgDuPFzRgBti5esUI9Uuh7vlQv6L5Z+1GfZn1NjLutvDC0Qz\nF2rc1wZxblWD1lybo6eW9JHu5eBnqxIcgbN2CUXkfzJEFJ5HQX+ELh2jPMBy1jKH\nDI/XB0t1t47dsP3oIE8Uw+b9hkKSVPbBUt+lfYqYiRRzm6Nx3MfAiv8VIPvyLi0M\ndj81vFGxQXU3N5hV+w1CVfxtUi6BwMzoNjw0OO4iL65ghHS1moeeEhpQHgpu6xsz\nEx6t3/8reZmkNUDeGC5pE4d7m7RriKz5u1lhexVeWQKBgQD4fL8+FJBDwqNVCaja\nR5I9BcyeYNcjZ2w/VgU/jQzCVQFhfCUFmDutzypGbi45R2VtJlnZwpQrJ+63z2GW\ngzBoWnwZvdMgM7lJJkZeeMklplOtUPIh6UC5RiN5q8Fs+O4uFhpeg4LLac1jHkCK\nzPW+/Fa6wyvEZoBP+bpxGYELXwKBgQDFG3bnqYWLNq6rTnQYtBpz4UaO4KQFRJMs\nsPaEIhQcJ98u1LD6ZRSWExEX5m6hfB9ppjSwMWQ519YuqADkXNa+6iIW67wQKrrm\nDHmkFKQXAMyDdFAOxTFRftvZJAWnF6QyaLoj1qzDAmUrc+o4BO9y70YRLHEGstw4\nK8tF7Z+qiQKBgDV46tKaLD1YqjtHe92VH0QgdlryrflBbUrn4PM/ECrVjhmDVJgy\nnU0W0psbZLkQwyPM5/Lza10qF7XYW8C+9HDQX/pOHhvE5a93HBeCWI7Qjxsx2xkv\nD62PCV1Kd7JSkza5rOz/0eqiFv+oZ+02k/+IX8WK8GUwRZZwQA3MljdzAoGBAJmi\nAJotDgQmiRrJOcCPkRbFfoObIP1iJ/zrqhnvnhEcGt+btJ5W7ybSkb45Q/3mi22D\nuQmkVeSoES+oj5lvq4p/YDbRY3KOe8MX8jAsToIHg2Dq5gO9O+WzpZSoeSd2S+tm\nqb+JcntFgKnP3b3wStshGVIFe8um2fOGXxiQUKVRAoGBAKemqHOKsINx4GAxDNqW\nKw0F6x4mNe3FdqOFlKIuZIfpLTP2P9LRJBLVmxsdTI50eEHdUDZ2JIZ4voc8Bv1L\nq4egDANw+U8X3WFHH2C6p7SkAt1vZRdhv3GYbfE1faXiCu9jdvoArfuHECzim9aD\nBuvY9JFrDZyT2eeyuh0W2e+R\n-----END PRIVATE KEY-----\n" | vercel env add FIREBASE_PRIVATE_KEY production

# Google Gemini AI
echo "Adding Gemini AI configuration..."
echo "AIzaSyCx7mGbQzdBZBSEQUGCPG-ni7pt9rGGjgo" | vercel env add GEMINI_API_KEY production

# Razorpay Configuration (placeholder values for now)
echo "Adding Razorpay configuration..."
echo "rzp_test_placeholder" | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
echo "razorpay_secret_placeholder" | vercel env add RAZORPAY_KEY_SECRET production

# Next.js Configuration
echo "Adding NextJS configuration..."
echo "https://prompt-fox79ri22-aawejs-projects-fb319899.vercel.app" | vercel env add NEXTAUTH_URL production
echo "prompt-iq-super-secret-key-2024-production-ready" | vercel env add NEXTAUTH_SECRET production

echo "✅ All environment variables have been added to Vercel!"
echo "🚀 Ready to deploy!"
