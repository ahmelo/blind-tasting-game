import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { EventWinnerResponse } from "../types/event";

interface WinnerProps {
  eventId: string;
}

export default function Winner({ eventId }: WinnerProps) {
  const [winner, setWinner] = useState<EventWinnerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWinner() {
      setLoading(true);
      setError("");
      try {
        const res = await apiGet<EventWinnerResponse>(`/events/${eventId}/winner`);
        setWinner(res);
      } catch (err: any) {
        setError(err?.message ?? "Erro ao carregar vencedor");
      } finally {
        setLoading(false);
      }
    }
    fetchWinner();
  }, [eventId]);

  return (
    <div style={{ textAlign: "center" }}>
      {loading && <p>Carregando vencedor...</p>}
      {error && <p style={{ color: "#f66" }}>{error}</p>}
      {!loading && !error && winner && (
        <div
          style={{
            padding: 24,
            backgroundColor: "#fff8dc",
            border: "2px solid #ffd700",
            borderRadius: 8,
            display: "inline-block",
            minWidth: 200,
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 8 }}>🏆 {winner.participant_name}</h2>
          <p style={{ fontWeight: "bold", fontSize: 18 }}>Score: {winner.total_score}</p>
        </div>
      )}
      {!loading && !error && !winner && <p>Nenhum vencedor encontrado.</p>}
    </div>
  );
}
