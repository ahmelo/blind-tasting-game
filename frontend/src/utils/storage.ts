const PARTICIPANT_KEY = "participant_id";
const USER_TYPE_KEY = "user_type";
const EVALUATION_DRAFT_KEY = "evaluation_draft";

export interface EvaluationDraft {
  eventId: string;
  roundId: string;
  roundName: string;
  participantId: string;
  data: {
    limpidity: string | null;
    visualIntensity: number | null;
    colorType: string | null;
    colorTone: string | null;
    condition: string | null;
    aromaIntensity: number | null;
    aromas: string | null;
    sweetness: string | null;
    tannin: number | null;
    alcohol: number | null;
    consistence: number | null;
    acidity: number | null;
    persistence: number | null;
    flavors: string | null;
    quality: string | null;
    grape: string | null;
    country: string | null;
    vintage: string | null;
    isAnswerKey: boolean;
  };
  timestamp: number;
}

export const storage = {
    // ===== identidade =====
    setParticipantId(id: string) {
        sessionStorage.setItem(PARTICIPANT_KEY, id);
    },

    getParticipantId(): string | null {
        return sessionStorage.getItem(PARTICIPANT_KEY);
    },

    clearParticipant() {
        sessionStorage.removeItem(PARTICIPANT_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        sessionStorage.clear();
    },

    setUserType(type: "participant" | "sommelier") {
        localStorage.setItem(USER_TYPE_KEY, type);
    },

    getUserType(): string | null {
        return localStorage.getItem(USER_TYPE_KEY);
    },

    // ===== sessão =====
    setSessionValue(key: string, value: any) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },

    getSessionValue<T>(key: string): T | null {
        const raw = sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    },

    clearSession() {
        sessionStorage.clear();
    },

    // ===== persistência de avaliação em rascunho =====
    saveEvaluationDraft(draft: EvaluationDraft) {
        try {
            localStorage.setItem(EVALUATION_DRAFT_KEY, JSON.stringify(draft));
        } catch (e) {
            console.warn("Erro ao salvar rascunho de avaliação:", e);
        }
    },

    getEvaluationDraft(): EvaluationDraft | null {
        try {
            const raw = localStorage.getItem(EVALUATION_DRAFT_KEY);
            return raw ? (JSON.parse(raw) as EvaluationDraft) : null;
        } catch (e) {
            console.warn("Erro ao carregar rascunho de avaliação:", e);
            return null;
        }
    },

    clearEvaluationDraft() {
        try {
            localStorage.removeItem(EVALUATION_DRAFT_KEY);
        } catch (e) {
            console.warn("Erro ao limpar rascunho de avaliação:", e);
        }
    },
};
