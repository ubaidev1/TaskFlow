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

export function fetchTasks(page = 1) {
  return request(`/tasks/?page=${page}`);
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
