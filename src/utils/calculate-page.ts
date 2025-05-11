export function GetIndexStartOfPage(page: number, per_page: number): number {
  if (page < 1) {
    return 0;
  }
  if (per_page < 0) {
    return 0;
  }
  return (page - 1) * per_page;
}
