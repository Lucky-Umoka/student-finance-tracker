import { getSettings, updateSettings } from "./state.js";
import { DEFAULT_RATES } from "./currency.js";
import { validateCap, validateRate, validateCategories } from "./validators.js";
import * as ui from "./ui.js";

const $ = (id) => document.getElementById(id);

function showRateFields(base, rates) {
  const [codeA, codeB] = Object.keys(DEFAULT_RATES[base]);
  $("rate-a-label").textContent = `1 ${base} equals how many ${codeA}?`;
  $("rate-b-label").textContent = `1 ${base} equals how many ${codeB}?`;
  $("rate-a").value = String(rates[codeA]);
  $("rate-b").value = String(rates[codeB]);
}

export function syncSettingsForm() {
  const settings = getSettings();
  $("base-currency").value = settings.baseCurrency;
  showRateFields(settings.baseCurrency, settings.rates);
  $("cap").value = String(settings.cap);
  $("categories").value = settings.categories.join(", ");
  ui.fillCategoryList(settings.categories);
  for (const field of ["cap", "rate-a", "rate-b", "categories"]) ui.setFieldError(field, "");
}

export function initSettings(onChange) {
  syncSettingsForm();

  $("base-currency").addEventListener("change", (event) => {
    const base = event.target.value;
    showRateFields(base, DEFAULT_RATES[base]);
    ui.setStatus("settings-status", "Suggested rates filled in. Edit them if you like, then save. Existing amounts are not converted.");
  });

  $("settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const base = $("base-currency").value;
    const [codeA, codeB] = Object.keys(DEFAULT_RATES[base]);

    const checks = {
      "rate-a": validateRate($("rate-a").value),
      "rate-b": validateRate($("rate-b").value),
      cap: validateCap($("cap").value),
      categories: validateCategories($("categories").value),
    };

    let firstBad = null;
    for (const [field, result] of Object.entries(checks)) {
      ui.setFieldError(field, result.ok ? "" : result.message);
      if (!result.ok && !firstBad) firstBad = field;
    }
    if (firstBad) {
      $(firstBad).focus();
      ui.setStatus("settings-status", "Please fix the highlighted fields.");
      return;
    }

    updateSettings({
      baseCurrency: base,
      rates: { [codeA]: checks["rate-a"].value, [codeB]: checks["rate-b"].value },
      cap: checks.cap.value,
      categories: checks.categories.value,
    });
    ui.fillCategoryList(getSettings().categories);
    ui.setStatus("settings-status", "Settings saved.");
    onChange();
  });
}