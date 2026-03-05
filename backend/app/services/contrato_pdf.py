from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import os
import base64
from io import BytesIO


def gerar_pdf_contrato(contrato, cliente, empresa):

    pasta = "contratos_pdf"

    if not os.path.exists(pasta):
        os.makedirs(pasta)

    caminho = f"{pasta}/{contrato['id']}.pdf"

    c = canvas.Canvas(caminho, pagesize=A4)

    c.setFont("Helvetica", 12)

    # =========================
    # DADOS DO CONTRATO
    # =========================

    c.drawString(100, 800, f"Contrato Nº: {contrato.get('numero')}")
    c.drawString(100, 780, f"Cliente: {cliente.get('nome')}")
    c.drawString(100, 760, f"Plano: {contrato.get('plano_nome')}")
    c.drawString(100, 740, f"Valor: R$ {contrato.get('valor_mensal')}")

    c.drawString(100, 700, "Declaro que aceito os termos do contrato.")

    c.drawString(100, 650, "Assinatura do cliente:")

    # =========================
    # INSERIR ASSINATURA
    # =========================

    assinatura = contrato.get("assinatura_cliente")

    if assinatura:

        try:

            # remove prefixo data:image/png;base64,
            if assinatura.startswith("data:image"):
                assinatura = assinatura.split(",")[1]

            assinatura = assinatura.strip()

            img_bytes = base64.b64decode(assinatura)

            img = ImageReader(BytesIO(img_bytes))

            c.drawImage(
                img,
                100,
                600,
                width=200,
                height=80,
                mask="auto"
            )

        except Exception as e:
            print("Erro ao inserir assinatura:", e)

    c.save()

    return caminho