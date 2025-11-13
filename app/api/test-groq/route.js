import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    console.log('Testing Groq API...');
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant."
        },
        {
          role: "user",
          content: "Say 'Groq API is working perfectly with Neon Postgres!' in a friendly way."
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = chatCompletion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      message: 'Groq API test successful!',
      response: response,
      model: 'llama-3.1-8b-instant',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Groq API test error:', error);
    return NextResponse.json(
      { 
        error: 'Groq API test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
