/**
 * @deprecated Use runAutomaticClientRecovery from clientRecovery.ts
 * Kept as a thin alias so main.tsx / older imports keep working.
 */
export { CLIENT_REVISION, runAutomaticClientRecovery as ensureFreshClient } from './clientRecovery';
