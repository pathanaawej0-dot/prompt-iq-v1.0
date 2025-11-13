import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'GEMINI_API_KEY environment variable not set',
        solution: 'Add GEMINI_API_KEY to your .env.local file'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Validate API key format
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Invalid API key format',
        keyPreview: `${apiKey.substring(0, 8)}...`,
        solution: 'Gemini API keys should start with "AIza". Check your Google AI Studio API key.'
      });
    }

    // Try to list available models
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Try a direct API call to list models
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      const data = await response.json();
      
      if (!response.ok) {
        return NextResponse.json({
          status: 'ERROR',
          message: 'API key validation failed',
          error: data.error?.message || 'Unknown error',
          solution: 'Check if your API key is valid and has proper permissions'
        });
      }

      // Extract available models
      const availableModels = data.models?.map(model => ({
        name: model.name,
        displayName: model.displayName,
        supportedMethods: model.supportedGenerationMethods
      })) || [];

      return NextResponse.json({
        status: 'SUCCESS',
        message: 'API key is valid',
        keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
        availableModels,
        recommendedModel: availableModels.find(m => 
          m.name.includes('gemini') && 
          m.supportedMethods?.includes('generateContent')
        )?.name || null
      });

    } catch (error) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Failed to validate API key',
        error: error.message,
        solution: 'Check your internet connection and API key validity'
      });
    }

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Validation failed',
      error: error.message
    }, { status: 500 });
  }
}
