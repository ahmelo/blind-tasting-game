from weasyprint import HTML


class PdfGenerator:

    @staticmethod
    def from_html(html: str) -> bytes:
        return HTML(string=html).write_pdf()
