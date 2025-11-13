import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';
import { query } from '../../../lib/neon-db.js';

export async function GET(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const firebaseUid = decodedToken.uid;

    // Get user's prompt history from Neon Postgres
    const historyResult = await query(`
      SELECT 
        p.id,
        p.original_prompt,
        p.enhanced_prompt,
        p.ai_response,
        p.source,
        p.credits_used,
        p.created_at as timestamp
      FROM prompts p
      JOIN users u ON p.user_id = u.id
      WHERE u.firebase_uid = $1
      ORDER BY p.created_at DESC
      LIMIT 100
    `, [firebaseUid]);

    // Format the data to match the expected frontend structure
    const formattedHistory = historyResult.rows.map(row => ({
      id: row.id,
      uid: firebaseUid,
      originalPrompt: row.original_prompt,
      enhancedPrompt: row.enhanced_prompt,
      aiResponse: row.ai_response,
      source: row.source || 'enhance',
      creditsUsed: row.credits_used || 1,
      timestamp: row.timestamp,
    }));

    return NextResponse.json({
      success: true,
      history: formattedHistory,
    });

  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    const firebaseUid = decodedToken.uid;

    // Delete the prompt from Neon Postgres (only if it belongs to the user)
    const deleteResult = await query(`
      DELETE FROM prompts 
      WHERE id = $1 
      AND user_id = (SELECT id FROM users WHERE firebase_uid = $2)
      RETURNING id
    `, [promptId, firebaseUid]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Prompt not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    });

  } catch (error) {
    console.error('History delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
