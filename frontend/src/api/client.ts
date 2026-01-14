const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1"; 

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.detail || JSON.stringify(data));
    }
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<TRes>;
}

export async function apiGet<TRes>(path: string): Promise<TRes> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<TRes>;
}

export async function apiPatch<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.detail || JSON.stringify(data));
    }
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<TRes>;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.detail || JSON.stringify(data));
    }
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

console.log("API BASE:", import.meta.env.VITE_API_BASE);

