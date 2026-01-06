import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api/client";

type EventItem = {
  id: string;
  name: string;
  access_code?: string;
  is_open: boolean;
};

export default function Events({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<EventItem[]>("/events");
      setEvents(res);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiPost<{ name: string; access_code?: string }, EventItem>("/events", {
        name: newName,
        access_code: newCode || undefined,
      });
      setNewName("");
      setNewCode("");
      setEvents((s) => [res, ...s]);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao criar evento");
    }
  }

  async function toggleOpen(id: string, current: boolean) {
    setError("");
    try {
      await apiPatch<{ name?: string; access_code?: string }, { id: string; is_open: boolean }>(`/events/${id}/open`, { name: "", access_code: "" });
      // server implementation uses separate /events/{id}/open with boolean param; since our backend requires boolean 'open' param in query or body, we'll call patch /events/{id} to update is_open via name placeholder
      // For now, call the dedicated endpoint using fetch-like approach: call apiPatch with body { } and update locally
      // Simpler approach: hit /events/{id} with same name and toggle is_open
      const res = await fetch(`${import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1"}/events/${id}/open?open=${!current}`, { method: "PATCH" });
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json();
      setEvents((s) => s.map((it) => (it.id === id ? { ...it, is_open: body.is_open } : it)));    } catch (err: any) {
      setError(err?.message ?? "Erro ao atualizar evento");
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir evento? Esta ação é irreversível.")) return;
    setError("");
    try {
      await apiDelete(`/events/${id}`);
      setEvents((s) => s.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Erro ao excluir evento");
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>
        ← Voltar
      </button>

      <h2>Eventos</h2>

      <form onSubmit={createEvent} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do evento" required />
        <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Código de acesso (opcional)" />
        <button type="submit">Criar</button>
      </form>

      {loading && <p>Carregando eventos...</p>}
      {error && <p style={{ color: "#f66" }}>{error}</p>}

      {!loading && events.length === 0 && <p>Nenhum evento cadastrado.</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Nome</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Código</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Aberto</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td style={{ padding: 6 }}>{ev.name}</td>
              <td style={{ padding: 6 }}>{ev.access_code ?? "—"}</td>
              <td style={{ padding: 6 }}>{ev.is_open ? "Sim" : "Não"}</td>
              <td style={{ padding: 6 }}>
                <button onClick={() => toggleOpen(ev.id, ev.is_open)} style={{ marginRight: 8 }}>
                  {ev.is_open ? "Fechar" : "Abrir"}
                </button>
                <button onClick={() => remove(ev.id)} style={{ color: "#900" }}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
