/**
 * Extract error blocks from session entries
 * Errors are in message.content[0].is_error (tool_result blocks)
 */
export function extractErrors(entries) {
    const errors = [];
    for (const entry of entries) {
        // Primary location: message.content[].is_error
        if (entry.message?.content && Array.isArray(entry.message.content)) {
            for (const block of entry.message.content) {
                if (block.is_error === true) {
                    errors.push({
                        content: block.content || '',
                        tool_use_id: block.tool_use_id || '',
                        timestamp: entry.timestamp,
                    });
                }
            }
        }
        // Secondary location: data.message.message.content[].is_error
        if (entry.data?.message?.message?.content && Array.isArray(entry.data.message.message.content)) {
            for (const block of entry.data.message.message.content) {
                if (block.is_error === true) {
                    errors.push({
                        content: block.content || '',
                        tool_use_id: block.tool_use_id || '',
                        timestamp: entry.timestamp,
                    });
                }
            }
        }
    }
    return errors;
}
//# sourceMappingURL=errors.js.map