// Delegation storage removed. Provide no-op functions to preserve API shape.
export function listDelegations() {
  return [] as any[];
}

export function saveDelegation() {
  // noop
}

export function revokeDelegation() {
  // noop
}
