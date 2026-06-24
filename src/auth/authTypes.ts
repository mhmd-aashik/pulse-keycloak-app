export interface KeycloakTokenPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  realm_access?: {
    roles?: string[];
  };
}

export interface AuthenticatedUser {
  keycloakId: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  roles: string[];
}
