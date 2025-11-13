# Neon Postgres Migration - Deployment Checklist

## Pre-Migration Setup

### 1. Environment Configuration
- [ ] Add `NEON_DATABASE_URL` to `.env.local`
- [ ] Set `USE_NEON_DB=false` initially
- [ ] Add `MIGRATION_SECRET` for secure migration endpoint
- [ ] Verify all existing environment variables are present

### 2. Dependencies
- [ ] Install new dependencies: `npm install`
- [ ] Verify `pg` and `@types/pg` are installed
- [ ] Test that the app still runs with existing Firestore setup

### 3. Database Connection Test
```bash
# Test Neon connection
npm run test:neon
```
- [ ] Connection to Neon database successful
- [ ] SSL connection working
- [ ] Basic queries execute without errors

## Migration Process

### 4. Run Database Migration
```bash
# Check migration status
npm run migrate:check

# Run migration (add secret parameter for production)
npm run migrate:run
```
- [ ] All tables created successfully
- [ ] Indexes and constraints applied
- [ ] Triggers for updated_at columns working

### 5. API Testing (Firestore Mode)
With `USE_NEON_DB=false`:
- [ ] User registration/login works
- [ ] Prompt enhancement works
- [ ] Credit system functions correctly
- [ ] Library operations work
- [ ] Payment processing works
- [ ] All existing functionality intact

### 6. API Testing (Neon Mode)
Set `USE_NEON_DB=true` and test:
- [ ] User profile creation/retrieval
- [ ] Prompt enhancement with credit deduction
- [ ] Library CRUD operations
- [ ] Payment verification and subscription updates
- [ ] Error handling works correctly

## Data Migration (If Needed)

### 7. Export Existing Data
If you have production data in Firestore:
- [ ] Export user data from Firestore
- [ ] Export prompt history
- [ ] Export library data
- [ ] Export payment records

### 8. Import to Neon
- [ ] Transform data to match PostgreSQL schema
- [ ] Import users with proper Firebase UID mapping
- [ ] Import prompts with user relationships
- [ ] Import library items
- [ ] Verify data integrity

## Testing Phase

### 9. Functional Testing
- [ ] User registration creates proper database records
- [ ] Firebase Auth integration works seamlessly
- [ ] Credit system accurately tracks usage
- [ ] Subscription upgrades update database correctly
- [ ] Library management (create, read, update, delete)
- [ ] Search and filtering work correctly
- [ ] Pagination functions properly

### 10. Performance Testing
- [ ] Database connection pool handles concurrent requests
- [ ] Query performance is acceptable
- [ ] No connection leaks under load
- [ ] Memory usage is stable

### 11. Error Handling
- [ ] Database connection failures are handled gracefully
- [ ] Invalid queries return proper error messages
- [ ] Transaction rollbacks work correctly
- [ ] Fallback mechanisms function as expected

## Production Deployment

### 12. Environment Variables
Production `.env.local` should have:
```bash
USE_NEON_DB=true
NEON_DATABASE_URL=your_production_neon_url
MIGRATION_SECRET=secure_random_string
# All other existing variables...
```

### 13. Security Checklist
- [ ] Neon database has proper access controls
- [ ] SSL/TLS encryption is enabled
- [ ] Database credentials are secure
- [ ] Migration endpoint is protected with secret
- [ ] No sensitive data in logs

### 14. Monitoring Setup
- [ ] Database connection monitoring
- [ ] Query performance monitoring
- [ ] Error rate monitoring
- [ ] Credit system accuracy monitoring
- [ ] Payment processing monitoring

## Post-Deployment

### 15. Verification
- [ ] All user accounts accessible
- [ ] Credit balances are correct
- [ ] Payment history is accurate
- [ ] Library data is intact
- [ ] New registrations work correctly

### 16. Performance Monitoring
- [ ] Response times are acceptable
- [ ] Database connections are stable
- [ ] No memory leaks detected
- [ ] Error rates are normal

### 17. Rollback Plan
If issues occur:
- [ ] Set `USE_NEON_DB=false` to revert to Firestore
- [ ] Verify Firestore data is still intact
- [ ] Monitor for any data inconsistencies
- [ ] Fix issues before re-enabling Neon

## Maintenance

### 18. Ongoing Tasks
- [ ] Regular database backups
- [ ] Monitor connection pool metrics
- [ ] Update dependencies as needed
- [ ] Performance optimization as required

## Emergency Contacts

- **Database Issues**: Neon support
- **Application Issues**: Development team
- **Payment Issues**: Razorpay support

## Notes

- Keep Firestore running in parallel during initial deployment
- Monitor closely for the first 24-48 hours
- Have rollback plan ready at all times
- Document any issues encountered for future reference

---

## Quick Commands Reference

```bash
# Test Neon connection
npm run test:neon

# Check migration status
npm run migrate:check

# Run migration
npm run migrate:run

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Toggle (Development)

For testing, you can toggle between databases:
- Set `USE_NEON_DB=true` in `.env.local` for Neon
- Set `USE_NEON_DB=false` in `.env.local` for Firestore
- Restart the development server after changes
