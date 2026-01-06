import { useState } from "react";
import { apiPost } from "../api/client";

type UserType = "sommelier" | "participant" | null;

export default function Login({ onLogin }: { onLogin: (userType: UserType, info: any) => void }) {
  const [userType, setUserType] = useState<UserType>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (userType === "sommelier") {
        try {
          const data = await apiPost("/auth/login", {
            name,
            password,
          });

          setError(null);
          onLogin("sommelier", data);
        } catch (err: any) {
          setError(err?.message || "Erro ao logar como sommelier");
        }
      } else if (userType === "participant") {
        try {
          const data = await apiPost<{ name: string; event_code: string }, any>("/participants/join", {
            name,
            event_code: eventCode,
          });

          setError(null);
          onLogin("participant", data);
        } catch (err: any) {
          setError(err?.message || "Erro ao participar do evento");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor");
    }
  }

  if (!userType) {
    return (
      <div className="login-container">
        <h1>Degustação às Cegas</h1>
        <p className="subtitle">Savoir-Vin</p>

        {!userType && (
          <div className="actions">
            <button onClick={() => setUserType("sommelier")}>
              Sou Sommelier
            </button>
            <button onClick={() => setUserType("participant")}>
              Sou Participante
            </button>
          </div>
        )}

        {userType && (
          <form className="login-form">
            {/* campos que você já tem */}
          </form>
        )}
      </div>

    );
}


  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
      {error && (
        <div style={{ color: "#721c24", backgroundColor: "#f8d7da", padding: 8, borderRadius: 4 }}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ marginLeft: 8, background: "transparent", border: "none", cursor: "pointer" }}
            aria-label="Fechar mensagem de erro"
          >
            ×
          </button>
        </div>
      )}

      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      {userType === "sommelier" && (
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
      )}

      {userType === "participant" && (
        <label>
          Código do Evento
          <input value={eventCode} onChange={(e) => setEventCode(e.target.value)} required />
        </label>
      )}

      <button type="submit">Entrar</button>
      <button
        type="button"
        onClick={() => {
          setUserType(null);
          setError(null);
        }}
      >
        Voltar
      </button>
    </form>
  );
}
