import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../lib/firebase-admin';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { userId, token, promptId, targetFolderId, sourceType = 'library' } = requestBody;
    
    if (!token || !userId || !promptId || !targetFolderId) {
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

    // Verify target folder exists
    const folderDoc = await adminDb
      .collection('users')
      .doc(userId)
      .collection('folders')
      .doc(targetFolderId)
      .get();

    if (!folderDoc.exists) {
      return NextResponse.json({ error: 'Target folder not found' }, { status: 404 });
    }

    if (sourceType === 'library') {
      // Move existing library prompt to different folder
      const promptRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('library')
        .doc(promptId);

      const promptDoc = await promptRef.get();
      if (!promptDoc.exists) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }

      const promptData = promptDoc.data();
      const oldFolderId = promptData.folderId;

      // Update prompt's folder
      await promptRef.update({
        folderId: targetFolderId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update old folder count (decrease)
      if (oldFolderId) {
        const oldFolderRef = adminDb
          .collection('users')
          .doc(userId)
          .collection('folders')
          .doc(oldFolderId);

        await oldFolderRef.update({
          promptCount: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Update new folder count (increase)
      const newFolderRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('folders')
        .doc(targetFolderId);

      await newFolderRef.update({
        promptCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } else if (sourceType === 'history') {
      // Copy prompt from history to library
      console.log('Looking for history prompt with ID:', promptId);
      
      // History prompts are stored in the main 'prompts' collection, not 'history' subcollection
      const historyRef = adminDb
        .collection('prompts')
        .doc(promptId);

      const historyDoc = await historyRef.get();
      if (!historyDoc.exists) {
        console.log('History prompt not found in prompts collection, trying to get all prompts for debugging');
        
        // Get all prompt documents for this user to see what IDs exist
        const allPromptDocs = await adminDb
          .collection('prompts')
          .where('uid', '==', userId)
          .limit(5)
          .get();
        
        console.log('Available prompt IDs:', allPromptDocs.docs.map(doc => doc.id));
        
        return NextResponse.json({ 
          error: 'History prompt not found',
          availableIds: allPromptDocs.docs.map(doc => doc.id),
          requestedId: promptId
        }, { status: 404 });
      }

      // Verify the prompt belongs to this user and get data
      const historyData = historyDoc.data();
      if (historyData.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized access to prompt' }, { status: 403 });
      }
      console.log('Found history data:', historyData);

      // Create new library prompt
      const libraryData = {
        title: historyData.title || historyData.originalPrompt?.substring(0, 50) + '...' || 'Untitled Prompt',
        prompt: historyData.enhancedPrompt || historyData.originalPrompt || historyData.prompt || 'No prompt content',
        originalPrompt: historyData.originalPrompt || historyData.prompt,
        enhancedPrompt: historyData.enhancedPrompt || null,
        category: historyData.category || 'General',
        useCase: historyData.useCase || 'Added from history',
        targetRole: historyData.targetRole || 'General',
        folderId: targetFolderId,
        usageCount: 0,
        isFavorite: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        addedFromHistory: true,
        originalHistoryId: promptId
      };

      console.log('Creating library prompt with data:', libraryData);

      await adminDb
        .collection('users')
        .doc(userId)
        .collection('library')
        .add(libraryData);

      // Update folder count for history prompts
      const historyFolderRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('folders')
        .doc(targetFolderId);

      await historyFolderRef.update({
        promptCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } else if (sourceType === 'enhanced') {
      // Add enhanced prompt to library
      const { originalPrompt, enhancedPrompt, title, category, useCase, targetRole } = requestBody;

      const libraryData = {
        title: title || 'Enhanced Prompt',
        prompt: enhancedPrompt || originalPrompt,
        originalPrompt: originalPrompt,
        enhancedPrompt: enhancedPrompt,
        category: category || 'General',
        useCase: useCase || 'Enhanced prompt from dashboard',
        targetRole: targetRole || 'General',
        folderId: targetFolderId,
        usageCount: 0,
        isFavorite: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        addedFromEnhanced: true
      };

      await adminDb
        .collection('users')
        .doc(userId)
        .collection('library')
        .add(libraryData);

      // Update folder count for enhanced prompts
      const enhancedFolderRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('folders')
        .doc(targetFolderId);

      await enhancedFolderRef.update({
        promptCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error moving prompt:', error);
    return NextResponse.json({ error: 'Failed to move prompt' }, { status: 500 });
  }
}
