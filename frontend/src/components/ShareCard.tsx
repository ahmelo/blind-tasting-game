import { forwardRef } from "react";
import "../styles/share_card.css";

interface ShareCardProps {
    totalScore: number;
    percentual: number;
    badge: string;
    badgeKey: string;
}

const BADGE_IMAGES: Record<string, string> = {
    iniciante: "/badges/iniciante.png",
    explorador: "/badges/explorador.png",
    entusiasta: "/badges/entusiasta.png",
    conhecedor: "/badges/conhecedor.png",
    especialista: "/badges/especialista.png",
};

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
    ({ totalScore, percentual, badge, badgeKey }, ref) => {
        return (
            <div className="share-card" ref={ref}>
                {/* HEADER */}
                <div className="share-card-header">
                    🍷 Degustação às Cegas da Savoir-Vin
                </div>

                {/* CONTENT */}
                <div className="share-card-content">
                    <div className="share-score profile">
                        <span className="label">Meu perfil sensorial é</span>
                    </div>

                    <div className="share-badge">
                        <img
                            src={BADGE_IMAGES[badgeKey]}
                            alt={`Badge ${badge}`}
                        />
                    </div>

                    <div className="share-score">
                        <span className="label">Meu score total foi</span>
                        <div className="value">{totalScore} pontos</div>
                    </div>

                    <div className="share-score">
                        <span className="label">Com aproveitamento de</span>
                        <div className="value">{percentual.toFixed(2)}%</div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="share-card-footer">
                    @savoir_vin
                </div>
            </div>
        );
    }
);

export default ShareCard;
