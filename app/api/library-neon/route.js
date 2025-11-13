import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';
import { query, transaction } from '../../../lib/neon-db.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    const category = searchParams.get('category');
    
    // Verify authentication
    if (!token || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Build query
    let queryText = `
      SELECT l.*, u.firebase_uid 
      FROM library l
      JOIN users u ON l.user_id = u.id
      WHERE u.firebase_uid = $1
    `;
    let queryParams = [userId];

    // Filter by category if provided
    if (category && category !== 'all') {
      queryText += ' AND l.category = $2';
      queryParams.push(category);
    }

    queryText += ' ORDER BY l.order_index ASC, l.created_at DESC';

    const result = await query(queryText, queryParams);
    
    const prompts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      order: row.order_index,
      isFavorite: row.is_favorite,
      usageCount: row.usage_count,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString()
    }));

    // Get categories for filtering
    const categoriesResult = await query(`
      SELECT DISTINCT l.category 
      FROM library l
      JOIN users u ON l.user_id = u.id
      WHERE u.firebase_uid = $1 AND l.category IS NOT NULL
      ORDER BY l.category
    `, [userId]);
    
    const categories = categoriesResult.rows.map(row => row.category);

    return NextResponse.json({
      prompts,
      categories,
      total: prompts.length
    });

  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch library',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { userId, token, promptId, updates } = await request.json();
    
    // Verify authentication
    if (!token || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!promptId || !updates) {
      return NextResponse.json({ error: 'Missing promptId or updates' }, { status: 400 });
    }

    // Update the prompt
    const allowedUpdates = ['isFavorite', 'usageCount'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        // Map camelCase to snake_case
        if (key === 'isFavorite') {
          filteredUpdates['is_favorite'] = updates[key];
        } else if (key === 'usageCount') {
          filteredUpdates['usage_count'] = updates[key];
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Build update query
    const updateFields = Object.keys(filteredUpdates).map((key, index) => `${key} = $${index + 3}`).join(', ');
    const updateValues = Object.values(filteredUpdates);

    await query(`
      UPDATE library 
      SET ${updateFields}, updated_at = NOW()
      FROM users u
      WHERE library.user_id = u.id 
        AND u.firebase_uid = $1 
        AND library.id = $2
    `, [userId, promptId, ...updateValues]);

    return NextResponse.json({ 
      success: true,
      message: 'Prompt updated successfully'
    });

  } catch (error) {
    console.error('Library update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update prompt',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, token, title, content, category } = await request.json();
    
    // Verify authentication
    if (!token || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get the next order index
    const orderResult = await query(`
      SELECT COALESCE(MAX(l.order_index), 0) + 1 as next_order
      FROM library l
      JOIN users u ON l.user_id = u.id
      WHERE u.firebase_uid = $1
    `, [userId]);

    const nextOrder = orderResult.rows[0]?.next_order || 1;

    // Insert new library item
    const result = await query(`
      INSERT INTO library (user_id, firebase_uid, title, content, category, order_index, created_at)
      SELECT u.id, u.firebase_uid, $2, $3, $4, $5, NOW()
      FROM users u
      WHERE u.firebase_uid = $1
      RETURNING *
    `, [userId, title, content, category, nextOrder]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create library item' }, { status: 500 });
    }

    const newItem = result.rows[0];

    return NextResponse.json({
      success: true,
      item: {
        id: newItem.id,
        title: newItem.title,
        content: newItem.content,
        category: newItem.category,
        order: newItem.order_index,
        isFavorite: newItem.is_favorite,
        usageCount: newItem.usage_count,
        createdAt: newItem.created_at?.toISOString(),
        updatedAt: newItem.updated_at?.toISOString()
      }
    });

  } catch (error) {
    console.error('Library create error:', error);
    return NextResponse.json({ 
      error: 'Failed to create library item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    const promptId = searchParams.get('promptId');
    
    // Verify authentication
    if (!token || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Delete the library item
    const result = await query(`
      DELETE FROM library 
      USING users u
      WHERE library.user_id = u.id 
        AND u.firebase_uid = $1 
        AND library.id = $2
    `, [userId, promptId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Library item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Library item deleted successfully'
    });

  } catch (error) {
    console.error('Library delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete library item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
