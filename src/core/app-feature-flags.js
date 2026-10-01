/** WP-01 renewal app shell flag. V2 is the only shell: the legacy V1 tree and its `?shell=v1`
 * escape hatch were removed (docs/v2-default-cutover-handoff.md). Kept as a function so callers
 * need no change; an old `?shell=v1` bookmark simply opens V2. */
export function isRenewalShellEnabled() {
  return true;
}
