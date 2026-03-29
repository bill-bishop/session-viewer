/**
 * Extract error blocks from session entries
 * Errors are in message.content[0].is_error (tool_result blocks)
 */
import type { SessionError } from '../types';
export declare function extractErrors(entries: any[]): SessionError[];
//# sourceMappingURL=errors.d.ts.map