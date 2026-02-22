from fastapi import APIRouter
from pydantic import BaseModel
from app.core.firebase import db
from datetime import datetime
import uuid

router = APIRouter(prefix="/bot", tags=["Bot"])


class Mensagem(BaseModel):
    telefone: str
    mensagem: str


@router.post("/mensagem")
def receber_mensagem(dados: Mensagem):

    texto = dados.mensagem.lower()

    # =========================
    # BUSCAR SESSÃO DO USUÁRIO
    # =========================
    sessao_ref = db.collection("sessao_bot").document(dados.telefone)
    sessao_doc = sessao_ref.get()

    estado = None

    if sessao_doc.exists:
        estado = sessao_doc.to_dict().get("estado")

    # =========================
    # MENU INICIAL
    # =========================
    if "oi" in texto or "olá" in texto:
        resposta = (
            "Olá! 👋 Sou o assistente da Evotrix.\n\n"
            "Digite uma opção:\n"
            "1️⃣ Segunda via de fatura\n"
            "2️⃣ Suporte técnico\n"
            "3️⃣ Falar com atendente"
        )

        sessao_ref.set({"estado": "menu"})

    # =========================
    # SEGUNDA VIA
    # =========================
    elif texto == "1":

        sessao_ref.set({"estado": "segunda_via"})

        clientes = db.collection("clientes") \
            .where("telefone", "==", dados.telefone) \
            .stream()

        cliente_encontrado = None

        for c in clientes:
            cliente_encontrado = c
            break

        if not cliente_encontrado:
            resposta = "❌ Cliente não encontrado."
        else:
            cliente_id = cliente_encontrado.id

            cobrancas = db.collection("cobrancas") \
                .where("cliente_id", "==", cliente_id) \
                .where("status", "==", "pendente") \
                .stream()

            cobranca = None

            for c in cobrancas:
                cobranca = c
                break

            if not cobranca:
                resposta = "Você não possui faturas pendentes."
            else:
                dados_cobranca = cobranca.to_dict()
                pix_code = dados_cobranca.get("pix_copia_cola")

                if not pix_code:
                    pix_code = f"PIX-{uuid.uuid4().hex}"

                    db.collection("cobrancas").document(cobranca.id).update({
                        "gateway": "PIX_TESTE",
                        "pix_copia_cola": pix_code,
                        "status_gateway": "gerado"
                    })

                resposta = (
                    f"💰 Fatura pendente:\n"
                    f"Valor: R$ {dados_cobranca['valor']}\n\n"
                    f"PIX:\n{pix_code}"
                )

    # =========================
    # SUPORTE - INÍCIO
    # =========================
    elif texto == "2":
        sessao_ref.set({"estado": "aguardando_descricao_suporte"})
        resposta = "🛠️ Descreva seu problema."

    # =========================
    # SUPORTE - RECEBENDO DESCRIÇÃO
    # =========================
    elif estado == "aguardando_descricao_suporte":

        # buscar cliente
        clientes = db.collection("clientes") \
            .where("telefone", "==", dados.telefone) \
            .stream()

        cliente_encontrado = None
        for c in clientes:
            cliente_encontrado = c
            break

        cliente_id = None
        nome_cliente = None

        if cliente_encontrado:
            cliente_id = cliente_encontrado.id
            nome_cliente = cliente_encontrado.to_dict().get("nome")

        protocolo = f"SUP-{uuid.uuid4().hex[:8].upper()}"

        db.collection("chamados_bot").add({
            "cliente_id": cliente_id,
            "nome_cliente": nome_cliente,
            "telefone": dados.telefone,
            "descricao": dados.mensagem,
            "status": "aberto",
            "prioridade": "normal",
            "origem": "bot",
            "protocolo": protocolo,
            "data_abertura": datetime.utcnow()
        })

        sessao_ref.set({"estado": "menu"})

        resposta = (
            f"✅ Chamado aberto com sucesso!\n\n"
            f"📌 Protocolo: {protocolo}\n"
            f"Nossa equipe entrará em contato em breve."
        )


    # =========================
    # ATENDENTE
    # =========================
    elif texto == "3":
        sessao_ref.set({"estado": "menu"})
        resposta = "👩‍💼 Encaminhando para atendente."


    # =========================
    # CONSULTAR STATUS DO CHAMADO
    # =========================
    elif texto.startswith("status"):

        partes = texto.split(" ")

        if len(partes) < 2:
            resposta = "Informe o protocolo. Exemplo: status SUP-1234ABCD"
        else:
            protocolo = partes[1].upper()

            chamados = db.collection("chamados_bot") \
                .where("protocolo", "==", protocolo) \
                .stream()

            chamado_encontrado = None
            for c in chamados:
                chamado_encontrado = c
                break

            if not chamado_encontrado:
                resposta = "Protocolo não encontrado."
            else:
                dados_chamado = chamado_encontrado.to_dict()
                status_chamado = dados_chamado.get("status", "aberto")

                resposta = (
                    f"📌 Protocolo: {protocolo}\n"
                    f"Status atual: {status_chamado}"
                )


    # =========================
    # STATUS DA CONEXÃO
    # =========================
    elif "internet" in texto or "bloqueado" in texto:

        clientes = db.collection("clientes") \
            .where("telefone", "==", dados.telefone) \
            .stream()

        cliente_encontrado = None
        for c in clientes:
            cliente_encontrado = c
            break

        if not cliente_encontrado:
            resposta = "Cliente não encontrado."
        else:
            cliente_dict = cliente_encontrado.to_dict()
            status_cliente = cliente_dict.get("status", "ativo")

            if status_cliente == "bloqueado":
                resposta = "🔒 Sua conexão está bloqueada por inadimplência."
            else:
                resposta = "✅ Sua conexão está ativa e funcionando normalmente."



    # =========================
    # CONFIRMAR PAGAMENTO
    # =========================
    elif "paguei" in texto:

        clientes = db.collection("clientes") \
            .where("telefone", "==", dados.telefone) \
            .stream()

        cliente_encontrado = None
        for c in clientes:
            cliente_encontrado = c
            break

        if not cliente_encontrado:
            resposta = "Cliente não encontrado."
        else:
            cliente_id = cliente_encontrado.id

            cobrancas = db.collection("cobrancas") \
                .where("cliente_id", "==", cliente_id) \
                .where("status", "==", "pendente") \
                .stream()

            cobranca = None
            for c in cobrancas:
                cobranca = c
                break

            if not cobranca:
                resposta = "Nenhuma cobrança pendente encontrada."
            else:
                db.collection("cobrancas").document(cobranca.id).update({
                    "status": "pago",
                    "status_gateway": "pago",
                    "data_pagamento": datetime.utcnow().isoformat()
                })

                db.collection("clientes").document(cliente_id).update({
                    "status": "ativo"
                })

                resposta = "✅ Pagamento confirmado. Sua conexão foi liberada!"


    
    # =========================
    # DEFAULT
    # =========================
    else:
        resposta = (
            "Digite:\n"
            "1️⃣ Segunda via\n"
            "2️⃣ Suporte\n"
            "3️⃣ Atendente"
        )

    # =========================
    # SALVAR CONVERSA
    # =========================
    db.collection("conversas").add({
        "telefone": dados.telefone,
        "mensagem_cliente": dados.mensagem,
        "resposta_bot": resposta,
        "estado": estado,
        "data": datetime.utcnow()
    })

    return {
        "telefone": dados.telefone,
        "resposta": resposta
    }


from datetime import datetime, timedelta, timezone


@router.get("/stats")
def bot_stats():
    docs = db.collection("conversas").stream()

    enviadas = 0
    recebidas = 0
    lidas = 0
    erros = 0
    bloqueadas = 0

    grafico_map = {}

    agora = datetime.now(timezone.utc)
    sete_dias_atras = agora - timedelta(days=7)

    for doc in docs:
        data = doc.to_dict()

        data_msg = data.get("data")

        if not data_msg:
            continue

        # Se for string ISO
        if isinstance(data_msg, str):
            data_msg = datetime.fromisoformat(data_msg)

        # Se tiver timezone, converte para UTC
        if data_msg.tzinfo is None:
            data_msg = data_msg.replace(tzinfo=timezone.utc)
        else:
            data_msg = data_msg.astimezone(timezone.utc)

        if data_msg < sete_dias_atras:
            continue

        # CONTADORES
        if data.get("resposta_bot"):
            enviadas += 1

        if data.get("mensagem_cliente"):
            recebidas += 1

        if data.get("estado") == "lida":
            lidas += 1

        if data.get("estado") == "erro":
            erros += 1

        if data.get("estado") == "bloqueada":
            bloqueadas += 1

        # GRÁFICO
        data_formatada = data_msg.strftime("%d/%m")

        if data_formatada not in grafico_map:
            grafico_map[data_formatada] = 0

        grafico_map[data_formatada] += 1

    grafico = [
        {"data": k, "quantidade": v}
        for k, v in sorted(grafico_map.items())
    ]

    return {
        "enviadas": enviadas,
        "recebidas": recebidas,
        "lidas": lidas,
        "erros": erros,
        "bloqueadas": bloqueadas,
        "grafico": grafico
    }


from app.services.receitanet_service import ReceitaNetService

def avisar_cobranca(cliente, empresa_id):
    service = ReceitaNetService(empresa_id)

    mensagem = f"""
Olá {cliente['nome']} 👋

Identificamos uma fatura em aberto.

Por favor, regularize para evitar bloqueio.
"""

    service.enviar_mensagem(
        numero=cliente["telefone"],
        mensagem=mensagem
    )