import {
  initState, getRecords, getRecord, addRecord, updateRecord,
  deleteRecord, sortRecords, getSettings,
} from "./state.js";
import { compileRegex, filterRecords } from "./search.js";
import {
  validateRecord, validateDescription, validateAmount, validateCategory, validateDate,
} from "./validators.js";
import { renderDashboard } from "./dashboard.js";
import { initSettings, syncSettingsForm } from "./settings.js";
import { initDataControls } from "./data.js";
import * as edit from "./inline-edit.js";
import * as ui from "./ui.js";

const searchInput = document.getElementById("search");
const caseBox = document.getElementById("search-case");
const sortSelect = document.getElementById("sort-by");
const recordsBody = document.getElementById("records-body");

let editingId = null;  


function refresh() {
  const { regex, error } = compileRegex(searchInput.value, caseBox.checked);
  const all = getRecords();
  const matched = filterRecords(all, regex);
  const sorted = sortRecords(matched, sortSelect.value);


  const editing = editingId ? { id: editingId, draft: edit.readEditRow() } : null;

  ui.renderRecords(sorted, regex, all.length, editing);
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

  addRecord(result.value);
  ui.setStatus("form-status", `Added "${result.value.description}".`);
  ui.resetForm();
  refresh();
  document.getElementById("description").focus();
});


function startEdit(id) {
  const record = getRecord(id);
  if (!record) return;
  editingId = id;
  refresh();
  edit.focusEditField();
  ui.setStatus("form-status", `Editing "${record.description}". Press Enter to save or Escape to cancel.`);
}

function saveRow() {
  const input = edit.readEditRow();
  if (!input) return;

  const result = validateRecord(input);
  if (!result.ok) {
    edit.showEditErrors(result.errors);
    ui.setStatus("form-status", "Please fix the errors in the row.");
    return;
  }

  const id = editingId;
  updateRecord(id, result.value);
  editingId = null;
  refresh();
  ui.setStatus("form-status", `Updated "${result.value.description}".`);
  edit.focusRowButton(id);
}

function stopEdit(message) {
  const id = editingId;
  editingId = null;
  refresh();
  ui.setStatus("form-status", message);
  edit.focusRowButton(id);
}

async function startDelete(id) {
  const record = getRecord(id);
  if (!record) return;

  const confirmed = await ui.askConfirm(`Delete "${record.description}"? This cannot be undone.`);
  if (!confirmed) return;

  deleteRecord(id);
  if (editingId === id) editingId = null;
  refresh();
  ui.setStatus("form-status", `Deleted "${record.description}".`);
  ui.focusRecordsHeading();
}


recordsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "edit") startEdit(id);
  if (action === "delete") startDelete(id);
  if (action === "save-row") saveRow();
  if (action === "cancel-row") stopEdit("Edit cancelled.");
});


recordsBody.addEventListener("keydown", (event) => {
  if (!editingId || !event.target.id?.startsWith("edit-")) return;
  if (event.key === "Enter") {
    event.preventDefault();
    saveRow();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    stopEdit("Edit cancelled.");
  }
});


recordsBody.addEventListener("input", (event) => {
  const id = event.target.id ?? "";
  if (!id.startsWith("edit-") || event.target.getAttribute("aria-invalid") !== "true") return;
  const field = id.slice("edit-".length);
  edit.setEditError(field, FIELD_VALIDATORS[field](event.target.value).message ?? "");
});


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