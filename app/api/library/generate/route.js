import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const { userId, profile } = await request.json();
    
    if (!userId || !profile) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Check if library already exists
    const existing = await adminDb
      .collection('users')
      .doc(userId)
      .collection('library')
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ 
        error: 'Library already exists',
        redirect: '/library'
      }, { status: 400 });
    }

    // Initialize Gemini
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }
    
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // STEP 1: GENERATE THE PLAN (List of 10 prompt ideas)
    const professionsText = profile.professions.join(', ');
    const goalsText = profile.goals.join(', ');
    const industriesText = profile.industries.join(', ');

    const planPrompt = `You are an expert prompt engineer. Based on this user profile, create a LIST of exactly 10 prompt ideas that would be most valuable to them:

PROFILE:
Professions: ${professionsText}
Goals: ${goalsText}
Industries: ${industriesText}

Generate 10 prompt ideas covering:
- Strategy & Planning: 2 ideas
- Content Creation: 3 ideas
- Problem Solving: 2 ideas
- Communication: 2 ideas
- Productivity: 1 idea

For each idea, provide:
1. A clear, specific title (6-10 words)
2. Brief description of what this prompt does (1 sentence)
3. Which profession it's primarily for

Return ONLY valid JSON (no markdown, no code blocks):
[
  {
    "title": "Title here",
    "description": "What it does",
    "targetRole": "developer/freelancer/etc",
    "category": "Strategy & Planning/Content Creation/etc"
  }
]`;

    const planResult = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineer. Generate JSON arrays of prompt ideas based on user profiles."
        },
        {
          role: "user",
          content: planPrompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1500,
    });
    const planText = planResult.choices[0]?.message?.content?.trim();
    
    // Parse JSON
    let cleanText = planText.replace(/```json|```/g, '').trim();
    const jsonStart = cleanText.indexOf('[');
    const jsonEnd = cleanText.lastIndexOf(']') + 1;
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd);
    }
    
    const promptPlan = JSON.parse(cleanText);
    
    if (!Array.isArray(promptPlan) || promptPlan.length !== 10) {
      throw new Error('Invalid plan generated');
    }

    // STEP 2: GENERATE EACH PROMPT ONE BY ONE
    
    const generatedPrompts = [];

    for (let i = 0; i < promptPlan.length; i++) {
      const idea = promptPlan[i];

      // Generate detailed prompt for this idea
      const detailPrompt = `Create a detailed, professional AI prompt for this use case:

TITLE: ${idea.title}
DESCRIPTION: ${idea.description}
TARGET USER: ${idea.targetRole}
INDUSTRY: ${industriesText}

Create a complete, production-ready prompt that:
- Is 120-180 words long
- Includes clear context and background
- Specifies exact instructions and steps
- Defines output format and structure
- Includes constraints and requirements
- Is immediately usable with ChatGPT, Claude, or any AI

Return ONLY the prompt text itself, no explanations or markdown.`;

      try {
        const promptResult = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert prompt engineer. Create detailed, professional AI prompts based on requirements."
            },
            {
              role: "user",
              content: detailPrompt
            }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 800,
        });
        const promptText = promptResult.choices[0]?.message?.content?.trim();

        generatedPrompts.push({
          title: idea.title,
          prompt: promptText,
          category: idea.category,
          targetRole: idea.targetRole,
          useCase: idea.description,
          order: i
        });

        // Small delay to avoid rate limits (500ms between calls)
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error generating prompt ${i + 1}:`, error);
        // Continue with next prompt even if one fails
        generatedPrompts.push({
          title: idea.title,
          prompt: `[Prompt generation failed for: ${idea.title}. Please regenerate this prompt.]`,
          category: idea.category,
          targetRole: idea.targetRole,
          useCase: idea.description,
          order: i
        });
      }
    }

    // STEP 3: SAVE ALL PROMPTS TO DEFAULT FOLDER
    
    const batch = adminDb.batch();
    
    generatedPrompts.forEach((promptData) => {
      const docRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('library')
        .doc();
        
      batch.set(docRef, {
        ...promptData,
        folderId: null, // null = default folder
        usageCount: 0,
        isFavorite: false,
        createdAt: FieldValue.serverTimestamp()
      });
    });

    // Update user profile
    batch.set(adminDb.collection('users').doc(userId), {
      profile: {
        ...profile,
        completedOnboarding: true,
        libraryGenerated: true,
        onboardedAt: FieldValue.serverTimestamp()
      }
    }, { merge: true });

    await batch.commit();

    return NextResponse.json({ 
      success: true,
      count: generatedPrompts.length,
      message: 'Your personalized library is ready!'
    });

  } catch (error) {
    console.error('Library generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate library',
      details: error.message
    }, { status: 500 });
  }
}
