export async function countToolCalls(entries) {
    return entries.filter(entry => {
        if (entry.type === 'assistant' && entry.message?.content) {
            const content = entry.message.content;
            if (Array.isArray(content)) {
                return content.some((block) => block.type === 'tool_use');
            }
        }
        return false;
    }).length;
}
export async function countErrors(entries) {
    return entries.filter(entry => {
        if (entry.data?.type === 'error')
            return true;
        if (entry.type === 'error')
            return true;
        return false;
    }).length;
}
//# sourceMappingURL=analyzers.js.map