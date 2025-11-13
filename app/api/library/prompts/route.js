import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    const folderId = searchParams.get('folderId');
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify authentication
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Build query based on folderId
    let queryRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('library');

    if (folderId === 'null' || folderId === 'default') {
      // Fetch prompts with folderId: null (default folder)
      queryRef = queryRef.where('folderId', '==', null);
    } else if (folderId && folderId !== 'all') {
      // Fetch prompts for specific folder
      queryRef = queryRef.where('folderId', '==', folderId);
    }
    // For 'all' case, don't add any filters to get all prompts

    const snapshot = await queryRef.get();
    
    const prompts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({ prompts });

  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}
