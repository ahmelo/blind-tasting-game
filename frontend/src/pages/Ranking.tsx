import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { EventRankingResponse } from "../types/event";

interface RankingProps {
  eventId: string;
}

export default function Ranking({ eventId }: RankingProps) {
  const [ranking, setRanking] = useState<EventRankingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      setError("");
      try {
        const res = await apiGet<EventRankingResponse[]>(`/events/${eventId}/ranking`);
        setRanking(res);
      } catch (err: any) {
        setError(err?.message ?? "Erro ao carregar ranking");
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, [eventId]);

  return (
    <div style={{ width: "100%" }}>
      {loading && <p>Carregando ranking...</p>}
      {error && <p style={{ color: "#f66" }}>{error}</p>}
      {!loading && !error && ranking.length === 0 && <p>Nenhum resultado disponível.</p>}
      {!loading && !error && ranking.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "2px solid #ccc", padding: 6 }}>Posição</th>
              <th style={{ borderBottom: "2px solid #ccc", padding: 6 }}>Participante</th>
              <th style={{ borderBottom: "2px solid #ccc", padding: 6 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r) => (
              <tr
                key={r.participant_id}
                style={{
                  background: r.position === 1 ? "#ffd70033" : "transparent",
                }}
              >
                <td style={{ padding: 6 }}>{r.position}</td>
                <td style={{ padding: 6 }}>{r.participant_name}</td>
                <td style={{ padding: 6 }}>{r.participant_percentual}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
