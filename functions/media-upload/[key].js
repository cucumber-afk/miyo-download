import { error } from '../_lib/response.js';

// Reserved for a future R2 media migration. Static Pages media is the active runtime.
export function onRequest() { return error('R2 media uploads are disabled in static media mode.', 410); }
