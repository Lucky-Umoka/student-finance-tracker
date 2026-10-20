const MAX_TOASTS = 3;
const SHOW_MS = 4000;

export function showToast(message, kind = "success") {
    const region = document.getElementById("toast-region");
    if (!region || !message) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${kind}`;
    toast.textContent = message;
    toast.addEventListener("click", () => toast.remove());
    region.append(toast);


    while (region.children.length > MAX_TOASTS) region.firstElementChild.remove();

    setTimeout(() => toast.classList.add("toast-hide"), SHOW_MS);
    setTimeout(() => toast.remove(), SHOW_MS + 400);
}