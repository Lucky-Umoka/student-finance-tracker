const $ = (id) => document.getElementById(id);
const FIELDS = ["description", "amount", "category", "date"];
const LABELS = { description: "Description", amount: "Amount", category: "Category", date: "Date" };


export function buildEditRow(record, draft) {
  const values = draft ?? {
    description: record.description,
    amount: String(record.amount),
    category: record.category,
    date: record.date,
  };

  const row = document.createElement("tr");
  row.className = "editing-row";

  for (const field of FIELDS) {
    const td = document.createElement("td");
    td.dataset.label = LABELS[field];

    const input = document.createElement("input");
    input.type = "text";
    input.id = `edit-${field}`;
    input.value = values[field];
    input.autocomplete = "off";
    input.setAttribute("aria-label", `${LABELS[field]} for ${record.description}`);
    input.setAttribute("aria-describedby", `edit-${field}-error`);
    if (field === "amount") input.inputMode = "decimal";
    if (field === "category") input.setAttribute("list", "category-list");

    const error = document.createElement("p");
    error.className = "error";
    error.id = `edit-${field}-error`;

    td.append(input, error);
    row.append(td);
  }

  const actions = document.createElement("td");
  actions.dataset.label = "Actions";
  const wrap = document.createElement("div");
  wrap.className = "row-actions";
  wrap.append(
    makeButton("Save", "save-row", `Save changes to ${record.description}`, "small"),
    makeButton("Cancel", "cancel-row", `Cancel editing ${record.description}`, "secondary small")
  );
  actions.append(wrap);
  row.append(actions);
  return row;
}

function makeButton(text, action, label, classes) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = classes;
  button.textContent = text;
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  return button;
}

export function readEditRow() {
  if (!$("edit-description")) return null;
  return {
    description: $("edit-description").value,
    amount: $("edit-amount").value,
    category: $("edit-category").value,
    date: $("edit-date").value,
  };
}

export function setEditError(field, message) {
  const input = $(`edit-${field}`);
  if (!input) return;
  $(`edit-${field}-error`).textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

export function showEditErrors(errors) {
  for (const field of FIELDS) setEditError(field, errors[field] ?? "");
  const first = FIELDS.find((field) => errors[field]);
  if (first) $(`edit-${first}`).focus();
}

export const focusEditField = () => $("edit-description")?.focus();


export function focusRowButton(id) {
  document.querySelector(`button[data-action="edit"][data-id="${CSS.escape(id)}"]`)?.focus();
}