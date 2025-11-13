# Neon Postgres Migration Guide

This document outlines the migration from Firebase/Firestore to Neon Postgres for the Prompt IQ application.

## Overview

The migration maintains all existing functionality while switching the database backend from Firestore to Neon Postgres. Firebase Auth continues to be used for authentication.

## Migration Components

### 1. Database Schema (`migrations/001_initial_schema.sql`)

The PostgreSQL schema includes:
- **users**: User profiles and subscription data
- **prompts**: Prompt enhancement history
- **library**: User's saved prompt library
- **folders**: Organization folders for library
- **history**: User activity history
- **playground**: Playground session data
- **payments**: Payment and subscription records
- **feedback**: User feedback submissions
- **email_subscriptions**: Email subscription management

### 2. Database Connection (`lib/neon-db.js`)

- Connection pooling for optimal performance
- Transaction support for data consistency
- Error handling and logging
- SSL configuration for Neon

### 3. API Routes

New Neon-compatible API routes created alongside existing Firestore routes:
- `/api/user/profile-neon` - User profile management
- `/api/credits/deduct-neon` - Credit deduction with history
- `/api/enhance-neon` - Prompt enhancement with Neon storage
- `/api/library-neon` - Library management (CRUD operations)
- `/api/payment/verify-neon` - Payment verification and subscription updates

### 4. API Client (`lib/api-client.js`)

Unified API client that automatically routes to correct endpoints based on configuration:
- Environment-based switching (`USE_NEON_DB`)
- Development toggle for testing
- Consistent interface for all API operations

## Environment Variables

Add to your `.env.local`:

```bash
# Database Configuration
USE_NEON_DB=false  # Set to true to use Neon Postgres
MIGRATION_SECRET=your_migration_secret_here

# Neon Postgres Database
NEON_DATABASE_URL=postgresql://neondb_owner:npg_XncYxRgVAW71@ep-empty-darkness-ad2aji66-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Migration Steps

### Step 1: Install Dependencies

```bash
npm install pg @types/pg
```

### Step 2: Set Up Environment Variables

1. Copy the Neon connection string to your `.env.local`
2. Set `USE_NEON_DB=false` initially
3. Add `MIGRATION_SECRET` for secure migration endpoint access

### Step 3: Run Database Migration

```bash
# Check migration status
curl http://localhost:3000/api/migrate

# Run migration (with secret in production)
curl -X POST http://localhost:3000/api/migrate?secret=your_migration_secret
```

### Step 4: Test the Migration

1. Keep `USE_NEON_DB=false` and test existing functionality
2. Set `USE_NEON_DB=true` to test Neon endpoints
3. Verify all features work correctly:
   - User registration/login
   - Prompt enhancement
   - Credit system
   - Library management
   - Payment processing

### Step 5: Data Migration (if needed)

If you have existing data in Firestore that needs to be migrated:

1. Create a data export from Firestore
2. Transform the data to match PostgreSQL schema
3. Import using SQL INSERT statements
4. Verify data integrity

## API Endpoint Mapping

| Feature | Firestore Endpoint | Neon Endpoint |
|---------|-------------------|---------------|
| User Profile | `/api/user/profile` | `/api/user/profile-neon` |
| Credits | `/api/credits/deduct` | `/api/credits/deduct-neon` |
| Enhancement | `/api/enhance` | `/api/enhance-neon` |
| Library | `/api/library` | `/api/library-neon` |
| Payments | `/api/payment/verify` | `/api/payment/verify-neon` |

## Key Features Maintained

✅ **Firebase Authentication**: Continues to use Firebase Auth for user management  
✅ **Credit System**: Full credit tracking and subscription management  
✅ **Prompt Enhancement**: AI-powered prompt enhancement with Gemini  
✅ **Library Management**: Save, organize, and manage prompts  
✅ **Payment Processing**: Razorpay integration for subscriptions  
✅ **History Tracking**: Complete audit trail of user actions  
✅ **Pagination & Search**: Efficient data retrieval with filtering  

## Database Schema Highlights

### Users Table
- Maps Firebase UID to internal user ID
- Supports both old and new subscription structures
- Tracks credits, subscriptions, and billing cycles

### Prompts Table
- Stores enhancement history with metadata
- Links to users via both UUID and Firebase UID
- Tracks credit usage per enhancement

### Library Table
- User's personal prompt collection
- Supports categorization and favorites
- Usage tracking and ordering

## Performance Considerations

- **Connection Pooling**: Configured for optimal concurrent connections
- **Indexes**: Strategic indexes on frequently queried columns
- **Transactions**: Atomic operations for data consistency
- **SSL**: Secure connections to Neon database

## Rollback Plan

If issues arise:

1. Set `USE_NEON_DB=false` in environment
2. Application immediately reverts to Firestore
3. No data loss as Firestore remains intact
4. Debug and fix issues before re-enabling Neon

## Monitoring

Monitor the following during and after migration:

- Database connection pool metrics
- Query performance and response times
- Error rates and types
- Credit system accuracy
- Payment processing success rates

## Security

- Firebase Auth tokens continue to be verified
- Database connections use SSL/TLS
- SQL injection protection via parameterized queries
- Environment variables for sensitive configuration

## Support

For issues during migration:
1. Check application logs for detailed error messages
2. Verify environment variables are correctly set
3. Test database connectivity using the migration endpoint
4. Ensure Neon database is accessible and properly configured

## Testing Checklist

Before going live:

- [ ] User registration and login
- [ ] Prompt enhancement with credit deduction
- [ ] Library CRUD operations
- [ ] Payment processing and subscription updates
- [ ] Error handling and edge cases
- [ ] Performance under load
- [ ] Database connection stability

## Notes

- The migration is designed to be non-destructive
- Both database systems can run in parallel during testing
- Firebase Auth remains unchanged
- All existing API contracts are maintained
- Frontend changes are minimal and backward-compatible
