import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { EventWinnerResponse, EventWinnersResponse } from "../types/event";

interface WinnerProps {
  eventId: string;
}

export default function Winner({ eventId }: WinnerProps) {
  const [winners, setWinners] = useState<EventWinnerResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWinner() {
      setLoading(true);
      setError("");
      try {
        const res = await apiGet<EventWinnersResponse>(
          `/events/${eventId}/winner`
        );
        setWinners(res.winners);
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
      {!loading && !error && winners.length > 0 && (
        <div
          style={{
            padding: 24,
            backgroundColor: "#fff8dc",
            border: "2px solid #ffd700",
            borderRadius: 8,
            display: "inline-block",
            minWidth: 260,
          }}
        >
          <h2 style={{ marginBottom: 12 }}>
            🏆 {winners.length > 1 ? "Empate!" : "Vencedor"}
          </h2>

          {winners.map((winner) => (
            <div key={winner.participant_id} style={{ marginBottom: 8 }}>
              <strong>{winner.participant_name}</strong>
              <div style={{ fontSize: 16 }}>
                Score: {winner.participant_percentual}%
              </div>
            </div>
      ))}
    </div>
  )
}

{
  !loading && !error && winners.length === 0 && (
    <p>Nenhum vencedor encontrado.</p>
  )
}
    </div >
  );
}
