let firstLaunch = true;

export function consumeFirstLaunch(): boolean {
  const wasFirst = firstLaunch;
  if (firstLaunch) {
    firstLaunch = false;
  }
  return wasFirst;
}

export function resetLaunchState(): void {
  firstLaunch = true;
}
