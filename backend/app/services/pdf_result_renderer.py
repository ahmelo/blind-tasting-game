from datetime import datetime
from typing import List
from app.schemas.results import EvaluationResultResponse
import base64
from pathlib import Path


class ResultPdfRenderer:

    @staticmethod
    def render(
        participant_name: str,
        results: list[dict],
        score_total: int,
        percentual: int,
        badge: str,
    ) -> str:
        BASE_DIR = Path(__file__).resolve().parent.parent
        logo_path = BASE_DIR / "assets" / "logo_app.png"
        badge_path = BASE_DIR / "assets" / f"{badge}.png"

        with open(logo_path, "rb") as f:
            logo_base64 = base64.b64encode(f.read()).decode("utf-8")

        with open(badge_path, "rb") as b:
            badge_base64 = base64.b64encode(b.read()).decode("utf-8")

        rounds_html = ""

        for r in results:
            blocks_html = ""
            for block in r["blocks"]:
                rows_html = ""
                for item in block["items"]:
                    rows_html += f"""
                    <tr class="{item['status']}">
                        <td>{item['label']}</td>
                        <td>{item['participant']}</td>
                        <td>{item['answer_key']}</td>
                    </tr>
                    """

                blocks_html += f"""
                <h3>{block['label']}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Participante</th>
                            <th>Gabarito</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows_html}
                    </tbody>
                </table>
                """

            rounds_html += f"""
            <section class="round">
                <h2>{r['round_name']}</h2>
                {blocks_html}
            </section>
            """

        return f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 10px;
                }}
                .header-logo img {{
                    height: 200px;
                }}
                .header-text h1 {{
                    margin: 0;
                    font-size: 22px;
                    color: #333;
                }}
                .header-text h3 {{
                    margin: 4px 0;
                    font-size: 16px;
                    color: #555;
                }}
                .header-text .total-score {{
                    font-weight: bold;
                    font-size: 18px;
                    color: #555;
                }}
                h2 {{ margin-top: 30px; color: #1f2937; }}
                h3 {{ margin-bottom: 8px; }}
                table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
                th, td {{ border: 1px solid #ddd; padding: 6px; font-size: 12px; text-align: left; }}
                tr.correct {{ background: #e8f5e9; }}
                tr.partial {{ background: #fffde7; }}
                tr.wrong {{ background: #ffebee; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-logo">
                    <img src="data:image/png;base64,{logo_base64}" alt="Logo">
                </div>
                <div class="header-text">
                    <h1>{r['event_name']}</h1>
                    <h3 class="total-score">Parabéns <strong>{participant_name}!</strong></h3>
                    <h3 class="total-score">Você atingiu um total de {score_total} pontos</h3>
                    <h3 class="total-score">O que corresponde a {percentual}% do total</h3>
                    <h3 class="total-score">Seu perfil sensorial é {badge}</h3>
                </div>
                <div class="header-logo">
                    <img src="data:image/png;base64,{badge_base64}" alt="badge">
                </div>
            </div>

            {rounds_html}
        </body>
        </html>
        """
