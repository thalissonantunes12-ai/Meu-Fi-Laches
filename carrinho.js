/* ==========================================
   CONFIGURAÇÃO: preencha aqui os dados da lanchonete
   ========================================== */
const CONFIG = {
    whatsapp: "5538991137713",  // só números, com 55 + DDD
    instagram: "fernandez__taa_", // usuário sem o @
    endereco: "",  // Ex.: "Rua Tal, 123 - Centro, Montes Claros"
    horario: ""    // Ex.: "Ter a dom, das 18h às 23h"
};

(function () {
    const KEY = "meufi-carrinho";
    let itens = [];
    try { itens = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { itens = []; }
    if (!Array.isArray(itens)) itens = [];

    const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(itens)); } catch (e) { /* sem armazenamento */ } };

    /* ---------- gaveta do carrinho ---------- */
    const overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    overlay.hidden = true;

    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.hidden = true;
    drawer.setAttribute("aria-label", "Carrinho de compras");
    drawer.innerHTML =
        '<div class="cart-head"><h2>Seu pedido</h2><button type="button" class="cart-x" aria-label="Fechar carrinho">✕</button></div>' +
        '<div class="cart-list"></div>' +
        '<div class="cart-foot">' +
        '<p class="cart-total"></p>' +
        '<input class="cart-in" id="cart-nome" placeholder="Seu nome" autocomplete="name">' +
        '<select class="cart-in" id="cart-tipo" aria-label="Retirada ou entrega"><option>Retirada no local</option><option>Entrega</option></select>' +
        '<textarea class="cart-in" id="cart-obs" rows="2" placeholder="Endereço (se for entrega) e observações"></textarea>' +
        '<button type="button" class="cart-send">Finalizar pelo WhatsApp</button>' +
        '<button type="button" class="cart-clear">Limpar carrinho</button>' +
        '<p class="cart-aviso"></p>' +
        '</div>';
    document.body.append(overlay, drawer);

    const lista = drawer.querySelector(".cart-list");
    const totalEl = drawer.querySelector(".cart-total");
    const avisoEl = drawer.querySelector(".cart-aviso");
    const enviar = drawer.querySelector(".cart-send");

    /* ---------- selos no ícone do carrinho ---------- */
    const icones = document.querySelectorAll(".carrinho");
    icones.forEach((el) => {
        const b = document.createElement("span");
        b.className = "cart-badge";
        b.hidden = true;
        el.appendChild(b);
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", "Abrir carrinho");
    });

    function render() {
        const qtd = itens.reduce((s, i) => s + i.qtd, 0);
        document.querySelectorAll(".cart-badge").forEach((b) => { b.textContent = qtd; b.hidden = qtd === 0; });

        if (!itens.length) {
            lista.innerHTML = '<p class="cart-vazio">Seu carrinho está vazio. Escolha algo no cardápio.</p>';
        } else {
            lista.innerHTML = itens.map((i, idx) =>
                '<div class="cart-item"><div class="cart-info"><strong>' + esc(i.nome) + '</strong><span>' +
                (i.preco != null ? brl(i.preco * i.qtd) : "Combo promocional") + '</span></div>' +
                '<div class="cart-qtd"><button type="button" data-acao="menos" data-i="' + idx + '" aria-label="Diminuir">−</button>' +
                '<b>' + i.qtd + '</b>' +
                '<button type="button" data-acao="mais" data-i="' + idx + '" aria-label="Aumentar">+</button></div></div>'
            ).join("");
        }

        const total = itens.reduce((s, i) => s + (i.preco != null ? i.preco * i.qtd : 0), 0);
        const temCombo = itens.some((i) => i.preco == null);
        totalEl.textContent = itens.length
            ? "Total: " + brl(total) + (temCombo ? " + combos (desconto confirmado no atendimento)" : "")
            : "";

        const semNumero = !CONFIG.whatsapp;
        enviar.disabled = !itens.length || semNumero;
        avisoEl.textContent = semNumero ? "Pedido por WhatsApp indisponível no momento." : "";
    }

    function abrir() { overlay.hidden = false; drawer.hidden = false; drawer.querySelector(".cart-x").focus(); }
    function fechar() { overlay.hidden = true; drawer.hidden = true; }

    function adicionar(nome, preco) {
        const it = itens.find((i) => i.nome === nome);
        if (it) it.qtd++; else itens.push({ nome: nome, preco: preco, qtd: 1 });
        salvar();
        render();
    }

    function montarMensagem() {
        const nome = drawer.querySelector("#cart-nome").value.trim();
        const tipo = drawer.querySelector("#cart-tipo").value;
        const obs = drawer.querySelector("#cart-obs").value.trim();
        let t = "Olá! Gostaria de fazer um pedido" + (nome ? " em nome de " + nome : "") + ":\n\n";
        itens.forEach((i) => {
            t += i.qtd + "x " + i.nome + (i.preco != null ? " - " + brl(i.preco * i.qtd) : " (combo promocional)") + "\n";
        });
        const total = itens.reduce((s, i) => s + (i.preco != null ? i.preco * i.qtd : 0), 0);
        t += "\nTotal dos itens: " + brl(total);
        if (itens.some((i) => i.preco == null)) t += " (mais os combos promocionais)";
        t += "\n" + tipo;
        if (obs) t += "\nObs.: " + obs;
        return t;
    }

    /* ---------- eventos ---------- */
    document.addEventListener("click", (e) => {
        if (!(e.target instanceof Element)) return;

        const add = e.target.closest(".btn-carrinho-pag3, .btn-carrinho");
        if (add) {
            const card = add.closest("article, .bloco-item");
            const titulo = card && card.querySelector("h3, h2");
            if (!titulo) return;
            const precoEl = card.querySelector(".preco-pag3");
            const preco = precoEl ? parseFloat(precoEl.textContent.replace(/[^\d,]/g, "").replace(",", ".")) : null;
            adicionar(titulo.textContent.trim(), isNaN(preco) ? null : preco);
            const original = add.textContent;
            add.textContent = "✔ Adicionado!";
            setTimeout(() => { add.textContent = original; }, 900);
            return;
        }

        if (e.target.closest(".carrinho")) { e.preventDefault(); abrir(); return; }
        if (e.target.closest(".cart-x") || e.target === overlay) { fechar(); return; }

        const qtdBtn = e.target.closest("[data-acao]");
        if (qtdBtn && drawer.contains(qtdBtn)) {
            const i = Number(qtdBtn.dataset.i);
            if (!itens[i]) return;
            itens[i].qtd += qtdBtn.dataset.acao === "mais" ? 1 : -1;
            if (itens[i].qtd <= 0) itens.splice(i, 1);
            salvar();
            render();
            return;
        }

        if (e.target.closest(".cart-clear")) { itens = []; salvar(); render(); return; }

        if (e.target.closest(".cart-send") && CONFIG.whatsapp && itens.length) {
            window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(montarMensagem()), "_blank", "noopener");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !drawer.hidden) fechar();
        if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element && e.target.matches(".carrinho")) {
            e.preventDefault();
            abrir();
        }
    });

    /* ---------- painel de contatos com os dados reais ---------- */
    const texto = document.querySelector(".contact-card-text");
    if (texto && (CONFIG.endereco || CONFIG.horario)) {
        texto.style.whiteSpace = "pre-line";
        texto.textContent = [CONFIG.horario, CONFIG.endereco].filter(Boolean).join("\n");
    }
    function virarLink(rotulo, href) {
        const span = document.querySelector('.contact-social-icon[aria-label="' + rotulo + '"]');
        if (!span || !href) return;
        const a = document.createElement("a");
        a.className = span.className;
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("aria-label", rotulo);
        a.innerHTML = span.innerHTML;
        span.replaceWith(a);
    }
    virarLink("WhatsApp", CONFIG.whatsapp ? "https://wa.me/" + CONFIG.whatsapp : "");
    virarLink("Instagram", CONFIG.instagram ? "https://instagram.com/" + CONFIG.instagram : "");

    render();
})();
