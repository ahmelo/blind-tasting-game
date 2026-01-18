import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { EvaluationResultResponse, ResultBlock, ResultItem } from "../types/results";
import "../styles/participant_result.css";

interface ParticipantResultProps {
  roundId: string;
  onBack: () => void; // função para voltar ao ranking
}

export default function ParticipantResult({ roundId, onBack }: ParticipantResultProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvaluationResultResponse | null>(null);

  useEffect(() => {
    async function fetchResult() {
      setLoading(true);
      setError("");

      try {
        const data = await apiGet<EvaluationResultResponse>(`/results/my-evaluation?round_id=${roundId}`);
        setResult(data);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar os resultados.");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [roundId]);

  if (loading) {
    return <div className="loading">Carregando resultados...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!result) {
    return <div className="alert alert-info">Nenhum resultado disponível.</div>;
  }

  return (
    <div className="participant-result">
      <h2>Resultado da Avaliação</h2>

      {result.blocks.map((block: ResultBlock) => (
        <div key={block.key} className="result-block">
          <h3>{block.label}</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>Item Avaliado</th>
                <th>Resposta do Participante</th>
                <th>Gabarito</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {block.items.map((item: ResultItem) => (
                <tr key={item.key} className={`status-${item.status}`}>
                  <td>{item.label}</td>
                  <td>{item.participant}</td>
                  <td>{item.answer_key}</td>
                  <td>{item.status === "partial" ? "Parcial" : item.status === "correct" ? "Certo" : "Errado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onBack}>
          Voltar
        </button>
      </div>
    </div>
  );
}
