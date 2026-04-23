import { Category, CategoryInput, Task, TaskInput } from "./types";

// Prefer runtime env variable if present, else fallback to build-time Vite env
const BASE_URL =
  (window.RUNTIME_TODO_API_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:9090";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  return handleResponse<Category[]>(res);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Category>(res);
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Category>(res);
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/categories/${id}`, { method: "DELETE" });
  return handleResponse<void>(res);
}

export async function fetchTasks(categoryId?: string): Promise<Task[]> {
  const url = categoryId
    ? `${BASE_URL}/tasks?categoryId=${encodeURIComponent(categoryId)}`
    : `${BASE_URL}/tasks`;
  const res = await fetch(url);
  return handleResponse<Task[]>(res);
}

export async function createTask(input: TaskInput): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Task>(res);
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, { method: "DELETE" });
  return handleResponse<void>(res);
}

export async function toggleTaskCompletion(
  id: string,
  completed: boolean,
): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}/complete`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  return handleResponse<Task>(res);
}
