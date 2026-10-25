/**
 * Firestore rejects `undefined` as a field value ("Unsupported field value"),
 * so every document payload is passed through this helper right before a write.
 * Optional fields (e.g. an empty contact phone) are simply dropped instead.
 */
export function withoutUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>
}
