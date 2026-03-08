export const defaultPagination = { page: 1, limit: 20 };

/**
 * Strips undefined and null values from a query params object.
 */
export const buildQueryString = (params: Record<string, any>): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      result[key] = String(params[key]);
    }
  }
  return result;
};

/**
 * Returns a human readable string for pagination meta.
 * Example: "Showing 1-20 of 143"
 */
export const formatMeta = (meta: { page: number; limit: number; total: number }): string => {
  const { page, limit, total } = meta;
  if (total === 0) return 'No items to show';
  
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  
  return `Showing ${start}-${end} of ${total}`;
};
