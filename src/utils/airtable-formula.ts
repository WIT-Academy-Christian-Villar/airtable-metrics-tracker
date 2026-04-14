export const escapeAirtableFormulaString = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

export const buildEqualsFormula = (fieldName: string, value: string): string =>
  `{${fieldName}}='${escapeAirtableFormulaString(value)}'`;
