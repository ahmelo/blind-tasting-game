from datetime import datetime
from typing import List
from app.schemas.results import EvaluationResultResponse


class ResultPdfRenderer:

    @staticmethod
    def render(participant_name: str, event_name: str, results: list[dict]) -> str:
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
            body {{ font-family: Arial, sans-serif; }}
            h1 {{ margin-bottom: 0; }}
            h2 {{ margin-top: 30px; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 6px; font-size: 12px; }}
            tr.correct {{ background: #e8f5e9; }}
            tr.partial {{ background: #fffde7; }}
            tr.wrong {{ background: #ffebee; }}
            </style>
        </head>
        <body>
            <h1>{event_name}</h1>
            <p>Participante: <strong>{participant_name}</strong></p>
            {rounds_html}
        </body>
        </html>
        """

