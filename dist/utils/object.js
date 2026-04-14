"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueByPath = void 0;
const getValueByPath = (payload, path) => {
    if (!path) {
        return payload;
    }
    const segments = path.split(".").filter(Boolean);
    let current = payload;
    for (const segment of segments) {
        if (!current || typeof current !== "object") {
            return undefined;
        }
        current = current[segment];
    }
    return current;
};
exports.getValueByPath = getValueByPath;
