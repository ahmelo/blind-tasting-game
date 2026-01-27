import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { apiDownload, apiGet } from "../api/client";
import ShareCard from "../components/ShareCard";

import "../styles/participant_result.css";
import "../styles/share_card.css";
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
  const [percentual, setPercentual] = useState<number | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const [badgeKey, setBadgeKey] = useState<string | null>(null);
  const BADGE_IMAGES: Record<string, string> = {
    iniciante: "/badges/iniciante.png",
    explorador: "/badges/explorador.png",
    entusiasta: "/badges/entusiasta.png",
    conhecedor: "/badges/conhecedor.png",
    especialista: "/badges/especialista.png",
  };
  const [hasShared, setHasShared] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);


  useEffect(() => {
    async function loadScore() {
      setLoadingScore(true);
      try {
        const res = await apiGet<{
          total_score: number;
          percentual: number;
          badge: string;
          badge_key: string;
        }>("/results/my-event");

        setTotalScore(res.total_score);
        setPercentual(res.percentual);
        setBadge(res.badge);
        setBadgeKey(res.badge_key)
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
      setDownloadingPdf(true);
      await apiDownload("/results/pdf", "resultado-avaliacao.pdf");
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar o PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;

    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "resultado-degustacao.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Meu resultado na Degustação às Cegas",
        });
      } else {
        // fallback: download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "resultado-degustacao.png";
        link.click();
      }

      setHasShared(true);
    } catch (err) {
      console.error("Erro ao compartilhar imagem:", err);
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
          <div>
            <div className="score-highlight">
              <span className="score-label">Meu score total é</span>
              <span className="score-value">{totalScore}</span>
              <span className="score-label">pontos</span>
            </div>
            <div className="score-highlight">
              <span className="score-label">Atingi </span>
              <span className="score-value">{percentual?.toFixed(2)}%</span>
              <span className="score-label">dos pontos</span>
            </div>
            <div className="score-highlight">
              <span className="score-label">Meu perfil sensorial é: </span>
              <span className="score-value">{badge}</span>
            </div>
            {badgeKey && (
              <div className="score-highlight">
                <img
                  src={BADGE_IMAGES[badgeKey]}
                  alt={`Badge ${badge}`}
                  className="badge-image"
                />
              </div>
            )}
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
      <div className="card stack" style={{ marginTop: "1rem" }}>
        <button
          onClick={handleDownloadPdf}
          className="btn btn-primary"
          disabled={downloadingPdf}
        >
          {downloadingPdf ? "⏳ Gerando PDF..." : "📄 Baixar resultado em PDF"}
        </button>

        {/* ===== SHARE ===== */}
        {!hasShared ? (
          <button className="btn btn-primary" onClick={handleShare}>
            📤 Compartilhar no Instagram
          </button>
        ) : (
          <div className="shared-feedback">
            🙌 Obrigado por compartilhar!
          </div>
        )}
      </div>

      {totalScore !== null &&
        percentual !== null &&
        badge &&
        badgeKey && (
          <div style={{ position: "absolute", left: "-9999px" }}>
            <ShareCard
              ref={shareCardRef}
              totalScore={totalScore}
              percentual={percentual}
              badge={badge}
              badgeKey={badgeKey}
            />
          </div>
        )}


    </div>
  );
}
