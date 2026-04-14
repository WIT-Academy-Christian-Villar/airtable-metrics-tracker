"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEqualsFormula = exports.escapeAirtableFormulaString = void 0;
const escapeAirtableFormulaString = (value) => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
exports.escapeAirtableFormulaString = escapeAirtableFormulaString;
const buildEqualsFormula = (fieldName, value) => `{${fieldName}}='${(0, exports.escapeAirtableFormulaString)(value)}'`;
exports.buildEqualsFormula = buildEqualsFormula;
