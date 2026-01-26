import { useEffect, useState } from "react";
import { apiDownload, apiGet } from "../api/client";
import "../styles/participant_result.css";
import type { EvaluationResultResponse } from "../types/results";

interface ParticipantResultProps {
  results: EvaluationResultResponse[];
  onBack: () => void;
}

export default function ParticipantResult({
  results,
  onBack,
}: ParticipantResultProps) {
  const [openRound, setOpenRound] = useState<string | null>(null);
  const [openBlock, setOpenBlock] = useState<string | null>(null);

  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  useEffect(() => {
    async function loadScore() {
      setLoadingScore(true);
      try {
        const res = await apiGet<{
          total_score: number;
          percentual: number;
          badge: string;
        }>("/results/my-event");

        setTotalScore(res.total_score);
      } catch {
        setTotalScore(null);
      } finally {
        setLoadingScore(false);
      }
    }

    loadScore();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      await apiDownload("/results/pdf", "resultado-avaliacao.pdf");
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar o PDF");
    }
  };

  return (
    <div className="participant-result full-width">

      {/* ===== HEADER ===== */}
      <div className="result-header">
        <h2>Resultado da Avaliação</h2>
        <button className="btn btn-ghost" onClick={onBack}>
          Voltar
        </button>
      </div>

      {/* ===== SCORE SUMMARY ===== */}
      <div className="card stack result-summary">
        {loadingScore && (
          <p className="muted">Calculando seu score...</p>
        )}

        {totalScore !== null && (
          <div className="score-highlight">
            <span className="score-label">Seu score total é</span>
            <span className="score-value">{totalScore}</span>
            <span className="score-label">pontos</span>
          </div>
        )}

      </div>

      {/* ===== ROUNDS ===== */}
      {results.map((round) => {
        const allItems = round.blocks.flatMap((b) => b.items);
        const correct = allItems.filter((i) => i.status === "correct").length;
        const partial = allItems.filter((i) => i.status === "partial").length;
        const wrong = allItems.filter((i) => i.status === "wrong").length;

        const roundOpen = openRound === round.round_id;

        return (
          <div key={round.round_id} className="round-card">
            <div
              className="round-header"
              onClick={() =>
                setOpenRound(roundOpen ? null : round.round_id)
              }
            >
              <div>
                <h3>{round.round_name}</h3>
                <div className="round-stats">
                  <span className="stat correct">🟢 {correct}</span>
                  <span className="stat partial">🟡 {partial}</span>
                  <span className="stat wrong">🔴 {wrong}</span>
                </div>
              </div>
              <span className="round-toggle">{roundOpen ? "▲" : "▼"}</span>
            </div>

            {roundOpen && (
              <div className="round-content">
                {round.blocks.map((block) => {
                  const blockKey = `${round.round_id}-${block.key}`;
                  const blockOpen = openBlock === blockKey;

                  return (
                    <div key={block.key} className="block-card">
                      <div
                        className="block-header"
                        onClick={() =>
                          setOpenBlock(blockOpen ? null : blockKey)
                        }
                      >
                        <span className="block-title">{block.label}</span>
                        <span className="block-toggle">
                          {blockOpen ? "−" : "+"}
                        </span>
                      </div>

                      {blockOpen && (
                        <div className="block-content">

                          {/* DESKTOP */}
                          <table className="result-table desktop-only">
                            <thead>
                              <tr>
                                <th>Status</th>
                                <th>Item</th>
                                <th>Você</th>
                                <th>Sommelier</th>
                              </tr>
                            </thead>
                            <tbody>
                              {block.items.map((item) => (
                                <tr key={item.key}>
                                  <td>
                                    <span className={`dot ${item.status}`} />
                                  </td>
                                  <td>{item.label}</td>
                                  <td>{item.participant}</td>
                                  <td>{item.answer_key}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* MOBILE */}
                          <div className="mobile-only">
                            {block.items.map((item) => (
                              <div key={item.key} className="mobile-result-item">
                                <div className="mobile-item-header">
                                  <span className={`dot ${item.status}`} />
                                  <span className="mobile-item-label">
                                    {item.label}
                                  </span>
                                </div>

                                <div className="mobile-item-row">
                                  <span>Você</span>
                                  <strong>{item.participant}</strong>
                                </div>

                                <div className="mobile-item-row">
                                  <span>Sommelier</span>
                                  <strong>{item.answer_key}</strong>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ===== PDF ===== */}
      <div className="stack" style={{ marginTop: "1rem" }}>
        <button
          onClick={handleDownloadPdf}
          className="btn btn-primary"
        >
          📄 Baixar resultado em PDF
        </button>
      </div>

    </div>
  );
}
