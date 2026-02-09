import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../api/client";

type EventItem = {
  id: string;
  name: string;
  access_code?: string;
  is_open: boolean;
};

export default function Events({
  onBack,
  onViewResult,
  onViewAnswerKey,
}: {
  onBack: () => void;
  onViewResult: (eventId: string) => void;
  onViewAnswerKey: (eventId: string) => void;
}) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  async function fetchEvents() {
    setLoading(true);
    try {
      setEvents(await apiGet<EventItem[]>("/events"));
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
      const res = await apiPost<
        { name: string; access_code?: string },
        EventItem
      >("/events", {
        name: newName,
        access_code: newCode || undefined,
      });

      setEvents((s) => [res, ...s]);
      setNewName("");
      setNewCode("");
    } catch (err: any) {
      setError(err?.message ?? "Erro ao criar evento");
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir evento?")) return;
    await apiDelete(`/events/${id}`);
    setEvents((s) => s.filter((e) => e.id !== id));
  }

  return (
    <div className="card stack">
      <h2 className="h2">Eventos</h2>

      <form onSubmit={createEvent} className="stack">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input" placeholder="Nome" />
        <input value={newCode} onChange={(e) => setNewCode(e.target.value)} className="input" placeholder="Código" />
        <button className="btn btn-primary">Criar</button>
      </form>

      {loading && <p>Carregando…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {events.map((ev) => (
        <div key={ev.id} className="event-row">
          <strong>{ev.name}</strong>

          <div className="event-row-actions">
            {!ev.is_open && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => onViewResult(ev.id)}
                >
                  Ver resultado
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={() => onViewAnswerKey(ev.id)}
                >
                  Ver gabarito
                </button>
              </>
            )}

            <button
              className="btn btn-ghost btn-danger"
              onClick={() => remove(ev.id)}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-ghost" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
