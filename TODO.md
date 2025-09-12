# Fix Session Persistence on Page Refresh

## Tasks
- [x] Update Supabase client configuration in src/lib/supabase.ts to explicitly enable session persistence
- [x] Fix TypeScript errors in src/lib/supabase.ts
- [ ] Test session persistence by logging in and refreshing the page

## Details
The issue is that user sessions expire on page refresh. This is likely due to the Supabase client not being configured to properly persist sessions in localStorage. By updating the client creation to include auth options with persistSession: true and storage: window.localStorage, the session should be saved and restored correctly on page refresh.

Fixed TypeScript errors:
- Removed withTimeout wrapper from Supabase queries that were causing type mismatches
- Fixed status comparison in updateSafetyStatus (removed incorrect 'help_needed' check)
- Fixed coordinate access in updateSafetyStatus (used status.coordinates instead of status.latitude/longitude)
