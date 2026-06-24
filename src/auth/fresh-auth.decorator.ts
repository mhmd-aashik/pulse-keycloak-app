import { SetMetadata } from '@nestjs/common';

export const REQUIRE_FRESH_AUTH_KEY = 'requireFreshAuth';
export const RequireFreshAuth = () => SetMetadata(REQUIRE_FRESH_AUTH_KEY, true);
