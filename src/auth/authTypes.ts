export interface KeycloakTokenPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  realm_access?: {
    roles?: string[];
  };
  roles?: string[];
  required_actions?: string[];
  acr?: string;
  amr?: string[];
  authTime?: number;
}

export interface AuthenticatedUser {
  id: string;
  keycloakId: string;
  username?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  emailVerified?: boolean;
  roles: string[];
  requiredActions?: string[];
  acr?: string;
  amr?: string[];
  auth_time?: number;
}
