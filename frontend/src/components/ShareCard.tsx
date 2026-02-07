import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";

interface ShareCardProps {
    totalScore: number;
    maxTotalScore: number;
    percentual: number;
    badge: string;
    badgeKey: string;
}

const BADGE_IMAGES: Record<string, string> = {
  iniciante: `${import.meta.env.BASE_URL}badges/iniciante.png`,
  explorador: `${import.meta.env.BASE_URL}badges/explorador.png`,
  entusiasta: `${import.meta.env.BASE_URL}badges/entusiasta.png`,
  conhecedor: `${import.meta.env.BASE_URL}badges/conhecedor.png`,
  especialista: `${import.meta.env.BASE_URL}badges/especialista.png`,
};


export interface ShareCardHandle {
    toCanvas(): Promise<HTMLCanvasElement>;
}

const ShareCard = forwardRef<ShareCardHandle, ShareCardProps>(
  ({ totalScore, maxTotalScore, percentual, badgeKey }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [badgeImage, setBadgeImage] = useState<HTMLImageElement | null>(null);

    // Pré-carrega a imagem do badge
    useEffect(() => {
      const badgeSrc = BADGE_IMAGES[badgeKey];
      if (!badgeSrc) return;

      const img = new Image();
      img.src = badgeSrc;
      
      img.onload = () => {
        setBadgeImage(img);
      };
      
      img.onerror = () => {
        console.error(`Erro ao carregar badge: ${badgeSrc}`);
      };
    }, [badgeKey]);

    useImperativeHandle(ref, () => ({
      badgeReady: !!badgeImage,
      toCanvas: async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Não foi possível obter contexto 2D do canvas");

        const width = 1080;
        const height = 1920;
        canvas.width = width;
        canvas.height = height;

        // Fundo preto
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 48px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🍷 Degustação às Cegas da Savoir-Vin", width / 2, 120);

        // Perfil sensorial
        ctx.font = "36px Arial, sans-serif";
        ctx.fillStyle = "#CCCCCC";
        ctx.fillText("Meu perfil sensorial é", width / 2, 380);

        // Badge (se carregado) - mantendo proporção
        if (badgeImage) {
          const badgeWidth = 640;
          const badgeHeight = (badgeImage.naturalHeight / badgeImage.naturalWidth) * badgeWidth;
          const badgeX = (width - badgeWidth) / 2;
          const badgeY = 430;
          ctx.drawImage(badgeImage, badgeX, badgeY, badgeWidth, badgeHeight);
        }

        // Score total
        ctx.font = "36px Arial, sans-serif";
        ctx.fillStyle = "#CCCCCC";
        ctx.fillText("", width / 2, 1350);

        ctx.font = "36px Arial, sans-serif";
        ctx.fillStyle = "#CCCCCC";
        ctx.fillText(`Atingi ${totalScore} de ${maxTotalScore} pontos`, width / 2, 1450);

        // Aproveitamento
        ctx.font = "36px Arial, sans-serif";
        ctx.fillStyle = "#CCCCCC";
        ctx.fillText("Meu score foi de", width / 2, 1620);

        ctx.font = "bold 64px Arial, sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`${percentual.toFixed(2)}%`, width / 2, 1720);

        // Footer
        ctx.font = "32px Arial, sans-serif";
        ctx.fillStyle = "#999999";
        ctx.fillText("@savoir_vin", width / 2, 1850);

        return canvas;
      }
    }), [badgeImage, totalScore, percentual]);

    return (
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;