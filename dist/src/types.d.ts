export type ToolCall = {
    name: string;
    input: unknown;
    timestamp: string;
};
export type SessionError = {
    content: string;
    tool_use_id: string;
    timestamp: string;
};
export type SubagentRef = {
    agentId: string;
    promptId: string;
};
export type SessionSummary = {
    sessionId: string;
    projectSlug: string;
    cwd: string;
    timestamp: string;
    version: string;
    slug?: string;
    entryCount: number;
    subagents: SubagentRef[];
    toolCalls: number;
    errors: number;
    toolCallsList: ToolCall[];
    errorsList: SessionError[];
};
export type ContentBlock = {
    type: 'text' | 'tool_use' | 'tool_result' | string;
    text?: string;
    id?: string;
    name?: string;
    input?: unknown;
    content?: string;
};
export type SessionEntry = {
    uuid: string;
    timestamp: string;
    type: string;
    isSidechain: boolean;
    parentUuid: string | null;
    message?: {
        role: string;
        content: string | ContentBlock[];
    };
    data?: Record<string, unknown>;
};
//# sourceMappingURL=types.d.ts.map