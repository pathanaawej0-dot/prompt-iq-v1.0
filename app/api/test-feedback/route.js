import { NextResponse } from 'next/server';
import { query } from '../../../lib/neon-db.js';

export async function POST(request) {
  try {
    const { feedback, rating } = await request.json();

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Test Neon connection without authentication
    console.log('Testing Neon feedback insertion...');
    
    // Save feedback to Neon Postgres (without user authentication for testing)
    await query(`
      INSERT INTO feedback (
        firebase_uid, 
        email, 
        message, 
        rating,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [
      'test-user-id',
      'test@example.com',
      feedback.trim(),
      parseInt(rating)
    ]);

    console.log('Feedback saved successfully to Neon!');

    return NextResponse.json({
      success: true,
      message: 'Test feedback saved to Neon Postgres!',
    });

  } catch (error) {
    console.error('Test feedback submission error:', error);
    return NextResponse.json(
      { error: `Failed to submit feedback: ${error.message}` },
      { status: 500 }
    );
  }
}
