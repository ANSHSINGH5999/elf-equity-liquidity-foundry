import type { ApiErrorBody } from "./api-types";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(body: ApiErrorBody, status: number) {
    super(body.error.message);
    this.code = body.error.code;
    this.status = status;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    if (body?.error) throw new ApiError(body, response.status);
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
