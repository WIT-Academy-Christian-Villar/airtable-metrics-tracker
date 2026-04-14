"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nowIso = exports.toDateBucket = void 0;
const toDateBucket = (date, timeZone = "UTC") => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value ?? "0000";
    const month = parts.find((part) => part.type === "month")?.value ?? "01";
    const day = parts.find((part) => part.type === "day")?.value ?? "01";
    return `${year}-${month}-${day}`;
};
exports.toDateBucket = toDateBucket;
const nowIso = () => new Date().toISOString();
exports.nowIso = nowIso;
