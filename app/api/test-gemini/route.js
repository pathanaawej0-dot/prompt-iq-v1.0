import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names to see which one works
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.0-pro',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];

    const results = [];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, respond with just "OK"');
        const text = result.response.text();
        
        results.push({
          model: modelName,
          status: 'SUCCESS',
          response: text
        });
        
        // If we find a working model, break
        break;
        
      } catch (error) {
        results.push({
          model: modelName,
          status: 'ERROR',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Gemini model test results',
      results,
      workingModel: results.find(r => r.status === 'SUCCESS')?.model || null
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
