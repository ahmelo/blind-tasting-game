import { useState } from "react";
import type { EvaluationResultResponse } from "../types/results";
import "../styles/participant_result.css";

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

  return (
    <div className="participant-result full-width">
      <div className="result-header">
        <h2>Resultado da Avaliação</h2>
        <button className="btn btn-ghost" onClick={onBack}>
          Voltar
        </button>
      </div>

      {results.map((round, index) => {
        const allItems = round.blocks.flatMap((b) => b.items);
        const correct = allItems.filter((i) => i.status === "correct").length;
        const partial = allItems.filter((i) => i.status === "partial").length;
        const wrong = allItems.filter((i) => i.status === "wrong").length;

        const roundOpen = openRound === round.round_id;

        return (
          <div key={round.round_id} className="round-card">
            {/* ===== ROUND HEADER ===== */}
            <div
              className="round-header"
              onClick={() =>
                setOpenRound(roundOpen ? null : round.round_id)
              }
            >
              <div>
                <h3>Round {index + 1}</h3>
                <div className="round-stats">
                  <span className="stat correct">🟢 {correct}</span>
                  <span className="stat partial">🟡 {partial}</span>
                  <span className="stat wrong">🔴 {wrong}</span>
                </div>
              </div>
              <span className="round-toggle">{roundOpen ? "▲" : "▼"}</span>
            </div>

            {/* ===== ROUND CONTENT ===== */}
            {roundOpen && (
              <div className="round-content">
                {round.blocks.map((block) => {
                  const blockKey = `${round.round_id}-${block.key}`;
                  const blockOpen = openBlock === blockKey;

                  return (
                    <div key={block.key} className="block-card">
                      {/* BLOCK HEADER */}
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

                      {/* BLOCK TABLE */}
                      {blockOpen && (
                        <div className="block-content">
                            {/* ===== DESKTOP (tabela atual, sem mudanças) ===== */}
                            <table className="result-table desktop-only">
                            <thead>
                                <tr>
                                <th>Status</th>
                                <th>Item</th>
                                <th>Você</th>
                                <th>Gabarito</th>
                                </tr>
                            </thead>
                            <tbody>
                                {block.items.map(item => (
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

                            {/* ===== MOBILE (lista adaptada) ===== */}
                            <div className="mobile-only">
                            {block.items.map(item => (
                                <div key={item.key} className="mobile-result-item">
                                <div className="mobile-item-header">
                                    <span className={`dot ${item.status}`} />
                                    <span className="mobile-item-label">{item.label}</span>
                                </div>

                                <div className="mobile-item-row">
                                    <span>Você</span>
                                    <strong>{item.participant}</strong>
                                </div>

                                <div className="mobile-item-row">
                                    <span>Gabarito</span>
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
    </div>
  );
}
