import { useState } from "react";
import { apiPost, setParticipantSession } from "../api/client";
import { usePWAInstall } from "../hooks/usePWAInstall";
import "../styles/login.css";


type UserType = "sommelier" | "participant" | null;

export default function Login({
  onLogin,
}: {
  onLogin: (userType: UserType, info: any) => void;
}) {
  const [userType, setUserType] = useState<UserType>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { canInstall, install } = usePWAInstall();


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (userType === "sommelier") {
        try {
          const data = await apiPost("/auth/login", { name, password });
          setError(null);
          onLogin("sommelier", data);
        } catch (err: any) {
          setError(err?.message || "Erro ao logar como sommelier");
        }
      } else if (userType === "participant") {
        try {
          const data = await apiPost<{ name: string; event_code: string }, any>(
            "/participants/join",
            { name, event_code: eventCode }
          );
          setError(null);
          onLogin("participant", data);
          setParticipantSession(data.participant_id);
        } catch (err: any) {
          setError(err?.message || "Erro ao participar do evento");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor");
    }
  }

  return (
    <div className="login-container">
      <div className="login-brand">
        <img
          src="/logo_app2.png"
          alt="Savoir-Vin"
          className="login-logo"
        />
        <h1>Degustação às Cegas</h1>
        <p className="subtitle">Savoir-Vin</p>
      </div>

      <div className="login-panel">
        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            <span>{error}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setError(null)}
              aria-label="Fechar mensagem de erro"
              title="Fechar"
            >
              ×
            </button>
          </div>
        )}

        {!userType ? (
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setUserType("sommelier")}>
              Sou Sommelier
            </button>
            <button className="btn btn-primary" onClick={() => setUserType("participant")}>
              Sou Participante
            </button>

            {canInstall && (
              <button className="install-button" onClick={install}>
                Instalar app
              </button>
            )}

          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {userType === "sommelier" && (
              <div className="field">
                <label className="label" htmlFor="password">
                  Senha
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {userType === "participant" && (
              <div className="field">
                <label className="label" htmlFor="eventCode">
                  Código do Evento
                </label>
                <input
                  id="eventCode"
                  className="input"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-actions">
              <button type="submit" className="btn btn-primary">
                Entrar
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setUserType(null);
                  setError(null);
                }}
              >
                Voltar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}