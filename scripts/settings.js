import { getSettings, updateSettings } from "./state.js";
import { validateCap } from "./validators.js";
import * as ui from "./ui.js";

const capInput = document.getElementById("cap");

export function initSettings(onChange) {
  const settings = getSettings();
  capInput.value = String(settings.cap);
  ui.fillCategoryList(settings.categories);

  document.getElementById("settings-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const result = validateCap(capInput.value);
    ui.setFieldError("cap", result.ok ? "" : result.message);
    if (!result.ok) {
      capInput.focus();
      ui.setStatus("settings-status", "Please fix the cap and try again.");
      return;
    }

    updateSettings({ cap: result.value });
    ui.setStatus("settings-status", "Cap saved.");
    onChange();
  });
}