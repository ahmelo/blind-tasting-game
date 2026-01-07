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
      await apiPatch<{ name?: string; access_code?: string }, { id: string; is_open: boolean }>(
        `/events/${id}/open`,
        { name: "", access_code: "" }
      );
      // server implementation uses separate /events/{id}/open with boolean param; since our backend requires boolean 'open' param in query or body, we'll call patch /events/{id} to update is_open via name placeholder
      // For now, call the dedicated endpoint using fetch-like approach: call apiPatch with body { } and update locally
      // Simpler approach: hit /events/{id} with same name and toggle is_open
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1"}/events/${id}/open?open=${!current}`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json();
      setEvents((s) => s.map((it) => (it.id === id ? { ...it, is_open: body.is_open } : it)));
    } catch (err: any) {
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
    <div className="events-page card stack">
      <div className="card-header row-between">
        <div>
          <h2 className="h2">Eventos</h2>
        </div>

        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Voltar
        </button>
      </div>

      <form className="events-form" onSubmit={createEvent}>
        <div className="field">
          <label className="label" htmlFor="eventName">
            Nome do evento
          </label>
          <input
            id="eventName"
            className="input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex.: Degustação Blind #1"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="eventCode">
            Código de acesso (opcional)
          </label>
          <input
            id="eventCode"
            className="input"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Ex.: SV2026"
          />
        </div>

        <div className="events-form-actions">
          <button type="submit" className="btn btn-primary">
            Criar
          </button>

          <button type="button" className="btn btn-outline" onClick={fetchEvents}>
            Atualizar
          </button>
        </div>
      </form>

      {loading && (
        <div className="alert" role="status" aria-live="polite">
          Carregando eventos...
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {!loading && events.length === 0 && <p className="muted">Nenhum evento cadastrado.</p>}

      <div className="event-list">
        {events.map((ev) => (
          <div key={ev.id} className="event-row">
            <div className="event-row-main">
              <div className="event-row-title">{ev.name}</div>
              <div className="event-row-meta">
                <span className="event-row-code">Código: {ev.access_code ?? "—"}</span>
                <span className={ev.is_open ? "event-badge event-badge--open" : "event-badge event-badge--closed"}>
                  {ev.is_open ? "Aberto" : "Fechado"}
                </span>
              </div>
            </div>

            <div className="event-row-actions">
              <button type="button" className="btn btn-outline" onClick={() => toggleOpen(ev.id, ev.is_open)}>
                {ev.is_open ? "Fechar" : "Abrir"}
              </button>

              <button type="button" className="btn btn-ghost btn-danger" onClick={() => remove(ev.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}