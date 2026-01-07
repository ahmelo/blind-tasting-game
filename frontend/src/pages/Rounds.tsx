import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api/client";

type EventItem = { id: string; name: string; access_code?: string; is_open: boolean };
type RoundItem = { id: string; name: string; position: number; is_open: boolean; event_id: string };

export default function Rounds({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState<number | undefined>(undefined);

  const [editing, setEditing] = useState<{ [id: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [id: string]: { name?: string; position?: number; is_open?: boolean } }>(
    {}
  );

  async function fetchEvents() {
    try {
      const res = await apiGet<EventItem[]>("/events");
      setEvents(res.filter((e) => e.is_open));
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar eventos");
    }
  }

  async function fetchRounds(eventId: string) {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<RoundItem[]>(`/rounds?event_id=${eventId}`);
      setRounds(res);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar rounds");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchRounds(selectedEvent);
    else setRounds([]);
  }, [selectedEvent]);

  async function createRound(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent) {
      setError("Selecione um evento aberto");
      return;
    }
    setError("");
    try {
      const res = await apiPost<{ name: string; position?: number; event_id: string }, RoundItem>("/rounds", {
        name: newName,
        position: newPosition,
        event_id: selectedEvent,
      });
      setNewName("");
      setNewPosition(undefined);
      setRounds((s) => [res, ...s]);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao criar round");
    }
  }

  async function startEdit(id: string) {
    setEditing((s) => ({ ...s, [id]: true }));
    const r = rounds.find((x) => x.id === id);
    if (r) setEditValues((s) => ({ ...s, [id]: { name: r.name, position: r.position, is_open: r.is_open } }));
  }

  async function saveEdit(id: string) {
    const vals = editValues[id];
    if (!vals) return;
    try {
      const res = await apiPatch<{ name?: string; position?: number; is_open?: boolean }, RoundItem>(`/rounds/${id}`, {
        name: vals.name,
        position: vals.position,
        is_open: vals.is_open,
      });
      setRounds((s) => s.map((r) => (r.id === id ? res : r)));
      setEditing((s) => ({ ...s, [id]: false }));
    } catch (err: any) {
      setError(err?.message ?? "Erro ao salvar");
    }
  }

  async function cancelEdit(id: string) {
    setEditing((s) => ({ ...s, [id]: false }));
    setEditValues((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
  }

  async function remove(id: string) {
    if (!confirm("Excluir round? Esta ação é irreversível.")) return;
    try {
      await apiDelete(`/rounds/${id}`);
      setRounds((s) => s.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Erro ao excluir round");
    }
  }

  const selectedEventLabel =
    events.find((ev) => ev.id === selectedEvent)?.name ??
    (selectedEvent ? "Evento selecionado" : "Selecione um evento aberto");

  return (
    <div className="rounds-page card stack">
      <div className="card-header row-between">
        <div>
          <h2 className="h2">Rounds</h2>
          <p className="muted">Selecione um evento aberto e gerencie seus rounds.</p>
        </div>

        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Voltar
        </button>
      </div>

      {/* Seleção de evento (clean) */}
      {!selectedEvent ? (
        <div className="stack">
          <div className="field">
            <label className="label" htmlFor="roundsEventSelect">
              Evento aberto
            </label>
            <select
              id="roundsEventSelect"
              className="select select--clean"
              value={selectedEvent ?? ""}
              onChange={(e) => setSelectedEvent(e.target.value || null)}
            >
              <option value="">Selecione um evento aberto</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.access_code ?? "—"})
                </option>
              ))}
            </select>
          </div>

          <p className="muted">Selecione um evento para ver e criar rounds.</p>
        </div>
      ) : (
        <div className="stack">
          <div className="row-between">
            <div className="menu-selected">
              <div className="menu-selected__title">Evento selecionado</div>
              <div className="menu-selected__subtitle">{selectedEventLabel}</div>
            </div>

            <div className="rounds-actions-top">
              <button type="button" className="btn btn-outline" onClick={() => fetchRounds(selectedEvent)}>
                Atualizar
              </button>

              <button type="button" className="btn btn-ghost" onClick={() => setSelectedEvent(null)}>
                Trocar
              </button>
            </div>
          </div>

          {/* Criar round */}
          <form className="rounds-form" onSubmit={createRound}>
            <div className="field">
              <label className="label" htmlFor="roundName">
                Nome do round
              </label>
              <input
                id="roundName"
                className="input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex.: Round 1"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="roundPos">
                Posição (opcional)
              </label>
              <input
                id="roundPos"
                className="input"
                type="number"
                value={newPosition ?? ""}
                onChange={(e) => setNewPosition(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex.: 1"
              />
            </div>

            <div className="rounds-form-actions">
              <button type="submit" className="btn btn-primary">
                Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="alert" role="status" aria-live="polite">
          Carregando rounds...
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {selectedEvent && !loading && rounds.length === 0 && <p className="muted">Nenhum round cadastrado para este evento.</p>}

      {/* Lista (no lugar da tabela) */}
      {selectedEvent && rounds.length > 0 && (
        <div className="round-list">
          {rounds.map((r) => {
            const isEditing = !!editing[r.id];
            const vals = editValues[r.id] ?? {};

            return (
              <div key={r.id} className="round-row">
                <div className="round-row-main">
                  <div className="round-row-top">
                    <span className="round-badge">Posição {r.position}</span>
                    <span className={r.is_open ? "event-badge event-badge--open" : "event-badge event-badge--closed"}>
                      {r.is_open ? "Aberto" : "Fechado"}
                    </span>
                  </div>

                  {!isEditing ? (
                    <div className="round-row-title">{r.name}</div>
                  ) : (
                    <div className="round-edit-grid">
                      <div className="field">
                        <label className="label" htmlFor={`editName-${r.id}`}>
                          Nome
                        </label>
                        <input
                          id={`editName-${r.id}`}
                          className="input"
                          value={vals.name ?? ""}
                          onChange={(e) =>
                            setEditValues((s) => ({ ...s, [r.id]: { ...(s[r.id] ?? {}), name: e.target.value } }))
                          }
                        />
                      </div>

                      <div className="field">
                        <label className="label" htmlFor={`editPos-${r.id}`}>
                          Posição
                        </label>
                        <input
                          id={`editPos-${r.id}`}
                          className="input"
                          type="number"
                          value={vals.position ?? ""}
                          onChange={(e) =>
                            setEditValues((s) => ({
                              ...s,
                              [r.id]: { ...(s[r.id] ?? {}), position: e.target.value ? Number(e.target.value) : undefined },
                            }))
                          }
                        />
                      </div>

                      <label className="checkline" htmlFor={`editOpen-${r.id}`}>
                        <input
                          id={`editOpen-${r.id}`}
                          type="checkbox"
                          checked={vals.is_open ?? false}
                          onChange={(e) =>
                            setEditValues((s) => ({ ...s, [r.id]: { ...(s[r.id] ?? {}), is_open: e.target.checked } }))
                          }
                        />
                        <span>Aberto</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="round-row-actions">
                  {isEditing ? (
                    <>
                      <button type="button" className="btn btn-primary" onClick={() => saveEdit(r.id)}>
                        Salvar
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => cancelEdit(r.id)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-outline" onClick={() => startEdit(r.id)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-ghost btn-danger" onClick={() => remove(r.id)}>
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}