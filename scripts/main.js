import {
  initState, getRecords, getRecord, addRecord, updateRecord,
  deleteRecord, sortRecords, getSettings,
} from "./state.js";
import { compileRegex, filterRecords } from "./search.js";
import {
  validateRecord, validateDescription, validateAmount, validateCategory, validateDate,
} from "./validators.js";
import * as ui from "./ui.js";
import { renderDashboard } from "./dashboard.js";
import { initSettings, syncSettingsForm } from "./settings.js";
import { initDataControls } from "./data.js";


const searchInput = document.getElementById("search");
const caseBox = document.getElementById("search-case");
const sortSelect = document.getElementById("sort-by");


function refresh() {
  const { regex, error } = compileRegex(searchInput.value, caseBox.checked);
  const all = getRecords();
  const matched = filterRecords(all, regex);
  const sorted = sortRecords(matched, sortSelect.value);
  ui.renderRecords(sorted, regex, all.length);
  ui.showSearchStatus({ regex, error, matched: matched.length, total: all.length });
    renderDashboard(all, getSettings());
}


const FIELD_VALIDATORS = {
  description: validateDescription,
  amount: validateAmount,
  category: validateCategory,
  date: validateDate,
};

for (const [field, validate] of Object.entries(FIELD_VALIDATORS)) {
  const input = document.getElementById(field);

  input.addEventListener("blur", () => {
    if (input.value !== "") ui.setFieldError(field, validate(input.value).message ?? "");
  });

  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") {
      ui.setFieldError(field, validate(input.value).message ?? "");
    }
  });
}


document.getElementById("record-form").addEventListener("submit", (event) => {
  event.preventDefault();                       

  const result = validateRecord(ui.readForm());
  if (!result.ok) {
    ui.showFieldErrors(result.errors);
    ui.focusFirstError(result.errors);
    const count = Object.keys(result.errors).length;
    ui.setStatus("form-status", `Please fix ${count} ${count === 1 ? "error" : "errors"} and try again.`);
    return;
  }

    const editingId = ui.getEditingId();
    if (editingId) {
      updateRecord(editingId, result.value);
      ui.setStatus("form-status", `Updated "${result.value.description}".`);
    } else {
      addRecord(result.value);
      ui.setStatus("form-status", `Added "${result.value.description}".`);
    }
  
    ui.resetForm();
    refresh();
    document.getElementById("description").focus();   
  });
  
  document.getElementById("cancel-edit").addEventListener("click", () => {
    ui.resetForm();
    ui.setStatus("form-status", "Edit cancelled.");
  });

  document.getElementById("records-body").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "edit") startEdit(id);
  if (action === "delete") startDelete(id);
});

function startEdit(id) {
  const record = getRecord(id);
  if (!record) return;
  ui.fillForm(record);
  ui.setFormMode(true);
  ui.showFieldErrors({});
  document.getElementById("description").focus();
}

async function startDelete(id) {
  const record = getRecord(id);
  if (!record) return;

  const confirmed = await ui.askConfirm(`Delete "${record.description}"? This cannot be undone.`);
  if (!confirmed) return;

  deleteRecord(id);
  if (ui.getEditingId() === id) ui.resetForm();      
  refresh();
  ui.setStatus("form-status", `Deleted "${record.description}".`);
  ui.focusRecordsHeading();
}

searchInput.addEventListener("input", refresh);     
caseBox.addEventListener("change", refresh);
sortSelect.addEventListener("change", refresh);

initState();
initSettings(refresh);
initDataControls(() => {
  syncSettingsForm();
  refresh();
});
refresh();