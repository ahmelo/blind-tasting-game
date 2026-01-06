import { useMemo, useState, useEffect } from "react";
import { apiPost, apiGet } from "../api/client";
import type { ColorType, Limpidity, VisualEvaluationCreate, VisualEvaluationResponse } from "../types/visual";

// Tom por cor
const TONES: Record<ColorType, { label: string; value: string }[]> = {
  branco: [
    { label: "Esverdeado", value: "esverdeado" },
    { label: "Palha", value: "palha" },
    { label: "Dourado", value: "dourado" },
    { label: "Âmbar", value: "ambar" },
  ],
  rose: [
    { label: "Salmão", value: "salmao" },
    { label: "Alaranjado", value: "alaranjado" },
    { label: "Cor-de-Rosa", value: "cor_de_rosa" },
    { label: "Avermelhado", value: "avermelhado" },
  ],
  tinto: [
    { label: "Púrpura", value: "purpura" },
    { label: "Rubi", value: "rubi" },
    { label: "Granada", value: "granada" },
    { label: "Acastanhado", value: "acastanhado" },
  ],
};

// Intensidade legendas
const intensityOptions = [
  { value: 1, label: "Baixa" },
  { value: 2, label: "Média-Menos" },
  { value: 3, label: "Média" },
  { value: 4, label: "Média-Mais" },
  { value: 5, label: "Alta" },
];

// Limpidez legendas
const limpidityOptions: { value: Limpidity; label: string }[] = [
  { value: "limpido", label: "Límpido" },
  { value: "turvo", label: "Turvo" },
];

// Cor legendas
const colorTypeOptions: { value: ColorType; label: string }[] = [
  { value: "branco", label: "Branco" },
  { value: "rose", label: "Rosé" },
  { value: "tinto", label: "Tinto" },
];

interface SubmitVisualProps {
  participantId: string;
  eventId: string;
  // se fornecido, marca automaticamente como gabarito
  initialIsAnswerKey?: boolean;
  // se true, o checkbox de gabarito fica desabilitado (sommelier)
  lockAnswerKey?: boolean;
}

export default function SubmitVisual({ participantId, eventId }: SubmitVisualProps) {
  const [participantIdState] = useState(participantId);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundName, setRoundName] = useState<string | null>(null);
  const [loadingRound, setLoadingRound] = useState(false);

  const [limpidity, setLimpidity] = useState<Limpidity>("limpido");
  const [intensity, setIntensity] = useState<number>(3);
  const [colorType, setColorType] = useState<ColorType>("tinto");
  const [colorTone, setColorTone] = useState<string>("rubi");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisualEvaluationResponse | null>(null);
  const [error, setError] = useState("");

  const toneOptions = useMemo(() => TONES[colorType], [colorType]);

  // Fetch first open round for the event
  useEffect(() => {
    let mounted = true;
    async function fetchOpenRound() {
      setLoadingRound(true);
      try {
        const data = await apiGet<{ id: string; name: string }>(`/events/${eventId}/open-round`);
        if (!mounted) return;
        setRoundId(data.id);
        setRoundName(data.name);
      } catch (err) {
        setRoundId(null);
        setRoundName(null);
      } finally {
        setLoadingRound(false);
      }
    }

    fetchOpenRound();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!roundId) {
      setError("Nenhum round aberto para este evento");
      return;
    }

    const payload: VisualEvaluationCreate = {
      participant_id: participantIdState,
      round_id: roundId,
      limpidity,
      intensity,
      color_type: colorType,
      color_tone: colorTone,
    };

    setLoading(true);
    try {
      const res = await apiPost<VisualEvaluationCreate, VisualEvaluationResponse>(
        "/visual-evaluations",
        payload
      );
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "grid",
        gap: 16,
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {loadingRound ? (
        <p>Carregando round...</p>
      ) : roundId ? (
        <>
          <label>
            Participant ID
            <input value={participantIdState} readOnly style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", background: "#f7f7f7" }} />
          </label>

          <label>
            Round
            <input value={`${roundName} (${roundId})`} readOnly style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", background: "#f7f7f7" }} />
          </label>
        </>
      ) : (
        <p style={{ color: "#f66" }}>Nenhum round aberto para este evento</p>
      )}

      {/* Limpidez */}
      <label style={{ display: "grid", gap: 4 }}>
        <span>Limpidez</span>
        <div style={{ display: "flex", gap: 16 }}>
          {limpidityOptions.map((opt) => (
            <label key={opt.value} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <input
                type="radio"
                name="limpidity"
                value={opt.value}
                checked={limpidity === opt.value}
                onChange={() => setLimpidity(opt.value)}
                style={{ accentColor: "#8b0000", width: 18, height: 18 }}
              />
              <span style={{ fontSize: 12, marginTop: 4 }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </label>

      {/* Intensidade */}
      <label style={{ display: "grid", gap: 4 }}>
        <span>Intensidade</span>
        <div style={{ display: "flex", gap: 16 }}>
          {intensityOptions.map((opt) => (
            <label key={opt.value} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <input
                type="radio"
                name="intensity"
                value={opt.value}
                checked={intensity === opt.value}
                onChange={() => setIntensity(opt.value)}
                style={{ accentColor: "#8b0000", width: 18, height: 18 }}
              />
              <span style={{ fontSize: 12, marginTop: 4 }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </label>

      {/* Cor */}
      <label style={{ display: "grid", gap: 4 }}>
        <span>Cor</span>
        <div style={{ display: "flex", gap: 16 }}>
          {colorTypeOptions.map((opt) => (
            <label
              key={opt.value}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <input
                type="radio"
                name="colorType"
                value={opt.value}
                checked={colorType === opt.value}
                onChange={() => {
                  setColorType(opt.value);
                  setColorTone(TONES[opt.value][0].value);
                }}
                style={{ accentColor: "#8b0000", width: 18, height: 18 }}
              />
              <span style={{ fontSize: 12, marginTop: 4 }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </label>

      {/* Tom */}
      <label style={{ display: "grid", gap: 4 }}>
        <span>Tom</span>
        <div style={{ display: "flex", gap: 16 }}>
          {toneOptions.map((t) => (
            <label key={t.value} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <input
                type="radio"
                name="tone"
                value={t.value}
                checked={colorTone === t.value}
                onChange={() => setColorTone(t.value)}
                style={{ accentColor: "#8b0000", width: 18, height: 18 }}
              />
              <span style={{ fontSize: 12, marginTop: 4 }}>{t.label}</span>
            </label>
          ))}
        </div>
      </label>

      {/* Botão */}
      <button
        type="submit"
        disabled={loading || loadingRound || !roundId}
        style={{
          padding: "10px 16px",
          backgroundColor: "#8b0000",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Enviando..." : loadingRound ? "Aguardando round..." : !roundId ? "Sem round" : "Enviar avaliação"}
      </button>

      {/* Feedback */}
      {error && <p style={{ color: "#f66" }}>{error}</p>}
      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#eef",
            borderRadius: 6,
          }}
        >
          <strong>Enviado com sucesso ✅</strong>
          <div>Score: {result.score}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>submitted_at: {result.submitted_at}</div>
        </div>
      )}
    </form>
  );
}
