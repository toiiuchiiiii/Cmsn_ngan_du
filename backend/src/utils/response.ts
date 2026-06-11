export function success<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true as const, data, ...(meta ? { meta } : {}) };
}

export function paginated<T>(data: T[], total: number, page: number, limit: number) {
  return {
    success: true as const,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export function errorResponse(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: { code, message, ...(details ? { details } : {}) },
  };
}
