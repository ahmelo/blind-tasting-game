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

export function setParticipantSession(participantId: string) {
  localStorage.setItem("participant_id", participantId);
}

function getParticipantId() {
  return localStorage.getItem("participant_id");
}

export async function apiGet<TRes>(path: string): Promise<TRes> {
  const participantId = getParticipantId();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(participantId
        ? { "X-Participant-Id": participantId }
        : {}),
    },
  });

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

export async function apiDownload(
  path: string,
  filename: string
): Promise<void> {
  const participantId = getParticipantId();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      ...(participantId
        ? { "X-Participant-Id": participantId }
        : {}),
      Accept: "application/pdf",
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const blob = await res.blob();

  // segurança extra: valida se é PDF mesmo
  if (blob.type !== "application/pdf") {
    throw new Error("Resposta não é um PDF válido");
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}