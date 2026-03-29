import { homedir } from 'os';
import { join } from 'path';
export function expandUser(path) {
    if (path.startsWith('~')) {
        return join(homedir(), path.slice(1));
    }
    return path;
}
//# sourceMappingURL=util-helpers.js.map