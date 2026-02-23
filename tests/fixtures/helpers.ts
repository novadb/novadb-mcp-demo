import type { CmsValue } from "../../src/cms-api/client.js";
import { ATTR_FORM_CONTENT } from "./constants.js";

/**
 * Extrahiert eine Multi-ObjRef-Liste aus einem CmsObject.
 * Multi-value ObjRef attributes are stored as separate CmsValue entries
 * (one per referenced object), sorted by `sortReverse`.
 */
export function extractMultiValueObjRef(
  obj: { values?: CmsValue[] },
  attrId: number
): number[] {
  if (!obj.values) return [];
  const entries = obj.values
    .filter((v) => v.attribute === attrId && (v.language ?? 0) === 0 && (v.variant ?? 0) === 0)
    .sort((a, b) => ((a.sortReverse ?? 0) - (b.sortReverse ?? 0)));
  return entries.map((v) => v.value as number);
}

/**
 * Extrahiert alle formContent-Einträge (Attribut 5053) aus einem CmsObject.
 *
 * WICHTIG: Jedes Feld ist ein separater CmsValue-Eintrag — NICHT ein Array-Wert.
 * Es gibt mehrere Einträge mit `attribute === 5053`, eine pro Feld.
 *
 * Diese Funktion:
 * 1. Filtert alle 5053-Einträge
 * 2. Sortiert nach `sortReverse` (aufsteigend)
 * 3. Gibt die Feld-IDs in korrekter Reihenfolge zurück
 */
export function extractFormFields(obj: { values?: CmsValue[] }): number[] {
  if (!obj.values) return [];
  const entries = obj.values
    .filter((v) => v.attribute === ATTR_FORM_CONTENT && (v.language ?? 0) === 0 && (v.variant ?? 0) === 0)
    .sort((a, b) => ((a.sortReverse ?? 0) - (b.sortReverse ?? 0)));
  return entries.map((v) => v.value as number);
}

/**
 * Baut CmsValue[]-Einträge für formContent (5053).
 *
 * Jedes Feld wird als separater Eintrag mit sortReverse kodiert.
 * Beispiel für fieldIds=[2098001, 2098002, 2098003]:
 * ```json
 * { "attribute": 5053, "language": 0, "variant": 0, "value": 2098001, "sortReverse": 0 },
 * { "attribute": 5053, "language": 0, "variant": 0, "value": 2098002, "sortReverse": 1 },
 * { "attribute": 5053, "language": 0, "variant": 0, "value": 2098003, "sortReverse": 2 }
 * ```
 */
export function buildFormContentValues(fieldIds: number[]): CmsValue[] {
  return fieldIds.map((id, index) => ({
    attribute: ATTR_FORM_CONTENT,
    language: 0,
    variant: 0,
    value: id,
    sortReverse: index,
  }));
}
