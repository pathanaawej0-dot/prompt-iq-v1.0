import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Test environment variables
    const geminiKey = process.env.GEMINI_API_KEY;
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log('Environment check:', {
      geminiKey: geminiKey ? 'Present' : 'Missing',
      firebaseProjectId: firebaseProjectId ? 'Present' : 'Missing',
      firebaseClientEmail: firebaseClientEmail ? 'Present' : 'Missing',
      firebasePrivateKey: firebasePrivateKey ? 'Present' : 'Missing',
    });

    if (!geminiKey) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    // Test Gemini API
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: 'All systems working',
      geminiResponse: text,
      environment: {
        geminiKey: 'Present',
        firebaseProjectId: firebaseProjectId ? 'Present' : 'Missing',
        firebaseClientEmail: firebaseClientEmail ? 'Present' : 'Missing',
        firebasePrivateKey: firebasePrivateKey ? 'Present' : 'Missing',
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
