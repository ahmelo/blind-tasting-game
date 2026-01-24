const PARTICIPANT_KEY = "participant_id";
const USER_TYPE_KEY = "user_type";

export const storage = {
    // ===== identidade =====
    setParticipantId(id: string) {
        localStorage.setItem(PARTICIPANT_KEY, id);
    },

    getParticipantId(): string | null {
        return localStorage.getItem(PARTICIPANT_KEY);
    },

    clearParticipant() {
        localStorage.removeItem(PARTICIPANT_KEY);
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
};
