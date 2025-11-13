import { NextResponse } from 'next/server';
import { runMigrations, checkTablesExist } from '../../../lib/migrate.js';

export async function GET(request) {
  try {
    // Check if tables already exist
    const tablesStatus = await checkTablesExist();
    
    return NextResponse.json({
      success: true,
      tablesExist: tablesStatus.allExist,
      existing: tablesStatus.existing,
      missing: tablesStatus.missing,
      message: tablesStatus.allExist ? 'All tables exist' : 'Some tables are missing'
    });
  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication (optional - you might want to protect this endpoint)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Simple secret check - in production, use proper authentication
    if (secret !== process.env.MIGRATION_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if tables already exist
    const tablesStatus = await checkTablesExist();
    
    if (tablesStatus.allExist) {
      return NextResponse.json({
        success: true,
        message: 'Database tables already exist, no migration needed',
        existing: tablesStatus.existing
      });
    }
    
    // Run migrations
    const result = await runMigrations();
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      result
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}
