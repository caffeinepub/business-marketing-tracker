import { useMemo } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useAdminTokenActor } from './useAdminTokenActor';
import { useAnonymousActor } from './useAnonymousActor';

export type AuthMode = 'initializing' | 'anonymous' | 'authenticated' | 'admin-token';

export interface AuthorizedActorState {
  /** The backend actor, available in all modes including anonymous */
  actor: ReturnType<typeof useActor>['actor'];
  
  /** Current authentication mode */
  authMode: AuthMode;
  
  /** True while identity or actor is still initializing */
  isInitializing: boolean;
  
  /** True when queries should be enabled (all modes including anonymous) */
  isReadyForQueries: boolean;
  
  /** Stable key for React Query to track auth context changes */
  authContextKey: string;
}

/**
 * Authorized actor hook that provides backend access in all modes.
 * 
 * This hook ensures that:
 * 1. Queries don't fire while Internet Identity is initializing
 * 2. Queries don't fire while the actor is being created
 * 3. Anonymous users get a usable anonymous actor
 * 4. Identity changes properly reset React Query cache via authContextKey
 * 5. Admin token access is detected and enabled with proper initialization
 */
export function useAuthorizedActor(): AuthorizedActorState {
  const { identity, isInitializing: isIdentityInitializing } = useInternetIdentity();
  const { actor: authenticatedActor, isFetching: isAuthenticatedActorFetching } = useActor();
  const { actor: adminTokenActor, isFetching: isAdminTokenActorFetching, hasAdminToken, isReady: isAdminTokenActorReady } = useAdminTokenActor();
  const { actor: anonymousActor, isFetching: isAnonymousActorFetching, isReady: isAnonymousActorReady } = useAnonymousActor();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  // Determine auth mode
  const authMode: AuthMode = useMemo(() => {
    // If identity is still initializing, we're in initializing state
    if (isIdentityInitializing) {
      return 'initializing';
    }
    
    // If we have an admin token, use admin-token mode
    if (hasAdminToken) {
      // Still initializing if the admin token actor is being fetched
      if (isAdminTokenActorFetching) {
        return 'initializing';
      }
      return 'admin-token';
    }
    
    // If authenticated, use authenticated mode
    if (isAuthenticated) {
      // Still initializing if the authenticated actor is being fetched
      if (isAuthenticatedActorFetching) {
        return 'initializing';
      }
      return 'authenticated';
    }
    
    // Otherwise, anonymous (but wait for anonymous actor to be ready)
    if (isAnonymousActorFetching) {
      return 'initializing';
    }
    return 'anonymous';
  }, [isIdentityInitializing, hasAdminToken, isAdminTokenActorFetching, isAuthenticated, isAuthenticatedActorFetching, isAnonymousActorFetching]);
  
  // Select the correct actor based on auth mode
  const actor = useMemo(() => {
    if (authMode === 'admin-token') {
      return adminTokenActor;
    }
    if (authMode === 'authenticated') {
      return authenticatedActor;
    }
    if (authMode === 'anonymous') {
      return anonymousActor;
    }
    return null;
  }, [authMode, adminTokenActor, authenticatedActor, anonymousActor]);
  
  // Queries should run when we have a valid actor ready for the current mode
  const isReadyForQueries = useMemo(() => {
    if (authMode === 'admin-token') {
      return isAdminTokenActorReady && !!adminTokenActor;
    }
    if (authMode === 'authenticated') {
      return !isAuthenticatedActorFetching && !!authenticatedActor;
    }
    if (authMode === 'anonymous') {
      return isAnonymousActorReady && !!anonymousActor;
    }
    return false;
  }, [authMode, isAdminTokenActorReady, adminTokenActor, isAuthenticatedActorFetching, authenticatedActor, isAnonymousActorReady, anonymousActor]);
  
  // Create a stable auth context key that changes when identity or admin token changes
  // This ensures React Query invalidates stale data when auth context switches
  const authContextKey = useMemo(() => {
    if (authMode === 'admin-token') {
      return `admin-token:${hasAdminToken}`;
    }
    if (authMode === 'authenticated' && identity) {
      return `authenticated:${identity.getPrincipal().toString()}`;
    }
    return `anonymous`;
  }, [authMode, hasAdminToken, identity]);
  
  return {
    actor,
    authMode,
    isInitializing: authMode === 'initializing',
    isReadyForQueries,
    authContextKey,
  };
}
