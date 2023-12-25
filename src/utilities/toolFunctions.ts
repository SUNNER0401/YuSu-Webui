export function countOccurrences(arr: any[], value: any) {
  return arr.reduce((a, v) => (v === value ? a + 1 : a), 0);
}
