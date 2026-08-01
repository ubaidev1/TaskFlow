const API_BASE = "/api";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.title?.[0] || "Request failed");
  }

  return data;
}

export function fetchTasks(page = 1, filters = {}) {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.search) params.set("search", filters.search);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.completed) params.set("completed", filters.completed);
  if (filters.ordering) params.set("ordering", filters.ordering);
  return request(`/tasks/?${params.toString()}`);
}

export function fetchTask(id) {
  return request(`/tasks/${id}/`);
}

export function createTask(taskData) {
  return request("/tasks/", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export function updateTask(id, taskData) {
  return request(`/tasks/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(taskData),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}/`, {
    method: "DELETE",
  });
}

export function fetchStats() {
  return request("/tasks/stats/");
}
