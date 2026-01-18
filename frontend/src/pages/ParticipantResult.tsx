import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type {
  EvaluationResultResponse,
  ResultBlock,
  ResultItem,
} from "../types/results";
import "../styles/participant_result.css";

interface ParticipantResultProps {
  roundIds: string[];   // ⬅️ agora suporta múltiplos rounds
  onBack: () => void;
}

export default function ParticipantResult({
  roundIds,
  onBack,
}: ParticipantResultProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState<EvaluationResultResponse[]>([]);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError("");

      try {
        const responses = await Promise.all(
          roundIds.map((roundId) =>
            apiGet<EvaluationResultResponse>(
              `/results/my-evaluation?round_id=${roundId}`
            )
          )
        );

        setResults(responses);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar os resultados.");
      } finally {
        setLoading(false);
      }
    }

    if (roundIds.length > 0) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [roundIds]);

  if (loading) {
    return <div className="loading">Carregando resultados...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="alert alert-info">
        Nenhum resultado disponível.
      </div>
    );
  }

  return (
    <div className="participant-result">
      <h2>Resultado da Avaliação</h2>

      {results.map((result, index) => (
        <div key={result.round_id} className="round-result">
          <h3>Round {index + 1}</h3>

          {result.blocks.map((block: ResultBlock) => (
            <div key={block.key} className="result-block">
              <h4>{block.label}</h4>

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
                    <tr
                      key={item.key}
                      className={`status-${item.status}`}
                    >
                      <td>{item.label}</td>
                      <td>{item.participant}</td>
                      <td>{item.answer_key}</td>
                      <td>
                        {item.status === "partial"
                          ? "Parcial"
                          : item.status === "correct"
                          ? "Certo"
                          : "Errado"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
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
