import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../lib/firebase-admin';
import admin from 'firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    
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

    // Get all folders for user
    const foldersSnapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('folders')
      .orderBy('createdAt', 'asc')
      .get();

    const folders = foldersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));

    // If no folders exist, create a default "Personal" folder
    if (folders.length === 0) {
      const defaultFolder = {
        name: 'Personal',
        description: 'Your personal prompt collection',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        promptCount: 0
      };

      const docRef = await adminDb
        .collection('users')
        .doc(userId)
        .collection('folders')
        .add(defaultFolder);

      folders.push({
        id: docRef.id,
        ...defaultFolder,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ folders });

  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, token, name, description } = await request.json();
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
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

    // Create new folder
    const folderData = {
      name: name.trim(),
      description: description?.trim() || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      promptCount: 0
    };

    const docRef = await adminDb
      .collection('users')
      .doc(userId)
      .collection('folders')
      .add(folderData);

    return NextResponse.json({ 
      success: true, 
      folder: {
        id: docRef.id,
        ...folderData,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, token, folderId, name, description, decrementCount, incrementCount } = await request.json();
    
    if (!token || !userId || !folderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!decrementCount && !incrementCount && (!name || name.trim().length === 0)) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
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

    // Update folder
    const folderRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('folders')
      .doc(folderId);

    if (decrementCount) {
      // Just decrement the prompt count
      await folderRef.update({
        promptCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (incrementCount) {
      // Just increment the prompt count
      await folderRef.update({
        promptCount: admin.firestore.FieldValue.increment(incrementCount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update folder name and description
      await folderRef.update({
        name: name.trim(),
        description: description?.trim() || '',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    const folderId = searchParams.get('folderId');
    
    if (!token || !userId || !folderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Check if folder has prompts
    const promptsSnapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('library')
      .where('folderId', '==', folderId)
      .limit(1)
      .get();

    if (!promptsSnapshot.empty) {
      return NextResponse.json({ 
        error: 'Cannot delete folder with prompts. Please move or delete prompts first.' 
      }, { status: 400 });
    }

    // Delete folder
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('folders')
      .doc(folderId)
      .delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
