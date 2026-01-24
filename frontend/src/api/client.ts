import { NetworkError } from "../errors/NetworkError";
import { storage } from "../utils/storage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1";

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  try {
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
  } catch (err) {
    throw new NetworkError();
  }
}

function getParticipantId() {
  return storage.getParticipantId();
}

export async function apiGet<TRes>(path: string): Promise<TRes> {
  const participantId = getParticipantId();

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        ...(participantId ? { "X-Participant-Id": participantId } : {}),
      },
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        throw new Error(data.detail || "Erro na requisição");
      }
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json() as Promise<TRes>;
  } catch (err) {
    // aqui pegamos *qualquer* erro de rede
    throw new NetworkError();
  }
}

export async function apiPatch<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  try {
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
  } catch (err) {
    throw new NetworkError();
  }
}

export async function apiDelete(path: string): Promise<void> {
  try {
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
  } catch (err) {
    throw new NetworkError();
  }
}

export async function apiDownload(
  path: string,
  filename: string
): Promise<void> {
  const participantId = getParticipantId();

  try {
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
  } catch (err) {
    throw new NetworkError();
  }
}