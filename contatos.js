function findContactPanel(toggle) {
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!(panel instanceof HTMLElement)) {
        console.error("Não foi possível encontrar o painel de contatos.");
        return null;
    }
    return panel;
}
function closeContactPanel(panel) {
    panel.hidden = true;
    const toggle = document.querySelector(
        `[data-contact-toggle][aria-controls="${panel.id}"]`
    );
    if (toggle instanceof HTMLButtonElement) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus({ preventScroll: true });
    }
}
document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const toggle = event.target.closest("[data-contact-toggle]");
    if (toggle instanceof HTMLButtonElement) {
        const panel = findContactPanel(toggle);
        if (!panel) {
            return;
        }
        panel.hidden = !panel.hidden;
        toggle.setAttribute("aria-expanded", String(!panel.hidden));
        if (!panel.hidden) {
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            panel.querySelector("[data-contact-close]")?.focus({
                preventScroll: true,
            });
        }
        return;
    }
    const closeButton = event.target.closest("[data-contact-close]");
    if (closeButton instanceof HTMLButtonElement) {
        const panel = closeButton.closest("[data-contact-panel]");
        if (panel instanceof HTMLElement) {
            closeContactPanel(panel);
        }
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }
    const panel = document.querySelector("[data-contact-panel]:not([hidden])");
    if (panel instanceof HTMLElement) {
        closeContactPanel(panel);
    }
});
