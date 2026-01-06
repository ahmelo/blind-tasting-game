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
  const [editValues, setEditValues] = useState<{ [id: string]: { name?: string; position?: number; is_open?: boolean } }>({});

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

  return (
    <div style={{ maxWidth: 800 }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>
        ← Voltar
      </button>

      <h2>Rounds</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={selectedEvent ?? ""} onChange={(e) => setSelectedEvent(e.target.value || null)}>
          <option value="">Selecione um evento aberto</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name} ({ev.access_code ?? "—"})
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <form onSubmit={createRound} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do round" required />
          <input type="number" value={newPosition ?? ""} onChange={(e) => setNewPosition(e.target.value ? Number(e.target.value) : undefined)} placeholder="Posição (opcional)" />
          <button type="submit">Criar</button>
        </form>
      )}

      {loading && <p>Carregando rounds...</p>}
      {error && <p style={{ color: "#f66" }}>{error}</p>}

      {!selectedEvent && <p>Selecione um evento para ver seus rounds.</p>}

      {selectedEvent && rounds.length === 0 && <p>Nenhum round cadastrado para este evento.</p>}

      {rounds.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Posição</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Nome</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Aberto</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 6 }}>{r.position}</td>
                <td style={{ padding: 6 }}>
                  {editing[r.id] ? (
                    <input value={editValues[r.id]?.name ?? ""} onChange={(e) => setEditValues((s) => ({ ...s, [r.id]: { ...(s[r.id] ?? {}), name: e.target.value } }))} />
                  ) : (
                    r.name
                  )}
                </td>
                <td style={{ padding: 6 }}>
                  {editing[r.id] ? (
                    <input type="checkbox" checked={editValues[r.id]?.is_open ?? false} onChange={(e) => setEditValues((s) => ({ ...s, [r.id]: { ...(s[r.id] ?? {}), is_open: e.target.checked } }))} />
                  ) : (
                    r.is_open ? "Sim" : "Não"
                  )}
                </td>
                <td style={{ padding: 6 }}>
                  {editing[r.id] ? (
                    <>
                      <button onClick={() => saveEdit(r.id)} style={{ marginRight: 8 }}>
                        Salvar
                      </button>
                      <button onClick={() => cancelEdit(r.id)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(r.id)} style={{ marginRight: 8 }}>
                        Editar
                      </button>
                      <button onClick={() => remove(r.id)} style={{ color: "#900" }}>
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
