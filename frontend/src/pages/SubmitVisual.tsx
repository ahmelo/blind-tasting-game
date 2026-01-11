import { useMemo, useState, useEffect } from "react";
import { apiPost, apiGet } from "../api/client";
import type {
  ColorType,
  Limpidity,
  VisualEvaluationCreate,
  VisualEvaluationResponse,
} from "../types/visual";
import "../styles/submit-visual.css";

type RoundApiItem = {
  id: string;
  name: string;
  position: number;
  is_open: boolean;
  event_id: string;
};

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

const intensityOptions = [
  { value: 1, label: "Baixa" },
  { value: 2, label: "Média-Menos" },
  { value: 3, label: "Média" },
  { value: 4, label: "Média-Mais" },
  { value: 5, label: "Alta" },
];

const limpidityOptions: { value: Limpidity; label: string }[] = [
  { value: "limpido", label: "Límpido" },
  { value: "turvo", label: "Turvo" },
];

const colorTypeOptions: { value: ColorType; label: string }[] = [
  { value: "branco", label: "Branco" },
  { value: "rose", label: "Rosé" },
  { value: "tinto", label: "Tinto" },
];

interface SubmitVisualProps {
  participantId: string;
  eventId: string;
  initialIsAnswerKey: boolean;
}

export default function SubmitVisual({ participantId, eventId, initialIsAnswerKey}: SubmitVisualProps) {

  const [isAnswerKey, setIsAnswerKey] = useState<boolean>(initialIsAnswerKey);

  const [canCloseRound, setCanCloseRound] = useState(false);
  const [closingRound, setClosingRound] = useState(false);

  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundName, setRoundName] = useState<string | null>(null);
  const [loadingRound, setLoadingRound] = useState(false);

  const [limpidity, setLimpidity] = useState<Limpidity | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [colorType, setColorType] = useState<ColorType | null>(null);
  const [colorTone, setColorTone] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisualEvaluationResponse | null>(null);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);

  const toneOptions = useMemo(
    () => (colorType ? TONES[colorType] : []),
    [colorType]
  );

  function resetForm() {
    setLimpidity(null);
    setIntensity(null);
    setColorType(null);
    setColorTone(null);
  }

  useEffect(() => {
    loadPendingRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (roundId) {
      resetForm();
      setCanCloseRound(false);
    }
    setIsAnswerKey(initialIsAnswerKey);
  }, [roundId]);


  async function loadPendingRound() {
    setLoadingRound(true);
    setError("");

    try {
      const [rounds, answered] = await Promise.all([
        apiGet<RoundApiItem[]>(`/rounds?event_id=${eventId}`),
        apiGet<string[]>(
          `/visual-evaluations/answered-rounds?participant_id=${participantId}&event_id=${eventId}`
        ),
      ]);

      const openRounds = rounds
        .filter((r) => r.is_open)
        .sort((a, b) => a.position - b.position);

      const answeredSet = new Set(answered);
      const next = openRounds.find((r) => !answeredSet.has(r.id));

      if (next) {
        setRoundId(next.id);
        setRoundName(next.name);
        setWaiting(false);
      } else {
        setRoundId(null);
        setRoundName(null);
        setWaiting(true);
      }
    } catch {
      setWaiting(true);
    } finally {
      setLoadingRound(false);
    }
  }

  async function closeRound() {
    
    if (!roundId) return;

    setClosingRound(true);
    setError("");

    try {
      await apiPost(`/rounds/${roundId}/close`, {});
      setCanCloseRound(false);
      await loadPendingRound(); // vai buscar o próximo round aberto
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Erro ao fechar a rodada.");
    } finally {
      setClosingRound(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!roundId) return;

    if (!limpidity || !colorType || !colorTone || intensity == null) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const payload: VisualEvaluationCreate = {
        participant_id: participantId,
        round_id: roundId,
        limpidity,
        intensity,
        color_type: colorType,
        color_tone: colorTone,
        is_answer_key: isAnswerKey,
      };

      const res = await apiPost<
        VisualEvaluationCreate,
        VisualEvaluationResponse
      >("/visual-evaluations", payload);

      setResult(res);

      if(isAnswerKey){
        setCanCloseRound(true);
      } else{
        await new Promise((r) => setTimeout(r, 800));
        await loadPendingRound();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

    } catch {
      setError("Erro ao enviar avaliação.");
    } finally {
      setLoading(false);
    }
  }

  if (waiting) {
    return (
      <div className="alert">
        Nenhum round disponível no momento. Aguarde.
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-outline" onClick={loadPendingRound}>
            Verificar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="submit-visual">
      <h3>{roundName}</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {result && <div className="alert alert-success">Enviado com sucesso</div>}

      {/* Limpidez */}
      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Limpidez</legend>
        <div className="radio-grid">
          {limpidityOptions.map((opt) => (
            <label key={opt.value} className="radio-card">
              <input
                type="radio"
                name="limpidity"
                value={opt.value}
                checked={limpidity === opt.value}
                onChange={() => setLimpidity(opt.value)}
              />
              <span className="radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

     <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Intensidade</legend>
        <div className="radio-grid-list radio-grid--5">
          {intensityOptions.map((opt) => (
            <label key={opt.value} className="radio-card">
              <input
                type="radio"
                name="intensity"
                value={opt.value}
                checked={intensity === opt.value}
                onChange={() => setIntensity(opt.value)}
              />
              <span className="radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Cor</legend>
        <div className="radio-grid-list">
          {colorTypeOptions.map((opt) => (
            <label key={opt.value} className="radio-card">
              <input
                type="radio"
                name="colorType"
                value={opt.value}
                checked={colorType === opt.value}
                onChange={() => {
                  setColorType(opt.value);
                  setColorTone(null);
                }}
              />
              <span className="radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Tom</legend>
        <div className="radio-grid-list">
          {toneOptions.map((t) => (
            <label key={t.value} className="radio-card">
              <input
                type="radio"
                name="tone"
                value={t.value}
                checked={colorTone === t.value}
                onChange={() => setColorTone(t.value)}
              />
              <span className="radio-label">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {!(isAnswerKey && canCloseRound) && (
        <button className="btn btn-primary" disabled={loading || loadingRound}>
          {loading ? "Enviando..." : "Enviar avaliação"}
        </button>
      )}
      
      {isAnswerKey && canCloseRound && roundId && (
        <button
          type="button"
          className="btn btn-danger"
          disabled={closingRound}
          onClick={closeRound}
        >
          {closingRound ? "Fechando rodada..." : "Fechar rodada"}
        </button>
      )}
    </form>
  );
}
