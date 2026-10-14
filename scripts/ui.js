import { highlight, fieldsOf } from "./search.js";
import { buildEditRow } from "./inline-edit.js";

const $ = (id) => document.getElementById(id);   
const FIELDS = ["description", "amount", "category", "date"];

export function renderRecords(records, regex, totalCount, editing = null) {
  const body = $("records-body");
  body.replaceChildren();

  for (const record of records) {
    // The row being edited becomes inputs instead of text.
    if (editing && editing.id === record.id) {
      body.append(buildEditRow(record, editing.draft));
      continue;
    }

    const fields = fieldsOf(record);
    const row = document.createElement("tr");
    row.append(
      makeCell("Description", highlight(fields.description, regex)),
      makeCell("Amount", highlight(fields.amount, regex)),
      makeCell("Category", highlight(fields.category, regex)),
      makeCell("Date", highlight(fields.date, regex)),
      makeActionsCell(record)
    );
    body.append(row);
  }

  const empty = $("empty-state");
  empty.hidden = records.length > 0;
  empty.textContent =
    totalCount === 0
      ? "No transactions yet. Add your first one above, or load the sample data in Settings."
      : "No records match your search.";
}

function makeCell(label, content) {
  const td = document.createElement("td");
  td.dataset.label = label;
  td.append(content);              
  return td;
}

function makeActionsCell(record) {
  const td = document.createElement("td");
  td.dataset.label = "Actions";
  const wrap = document.createElement("div");
  wrap.className = "row-actions";
  wrap.append(
    makeButton("Edit", "edit", record, "secondary small"),
    makeButton("Delete", "delete", record, "danger small")
  );
  td.append(wrap);
  return td;
}

function makeButton(text, action, record, classes) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = classes;
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.id = record.id;

  button.setAttribute("aria-label", `${text} ${record.description}`);
  return button;
}

export function showSearchStatus({ regex, error, matched, total }) {
  const input = $("search");
  if (error) {
    input.setAttribute("aria-invalid", "true");
    $("search-status").textContent = `Invalid pattern: ${error}`;
    return;
  }
  input.removeAttribute("aria-invalid");
  $("search-status").textContent = regex ? `${matched} of ${total} records match.` : "";
}

export const readForm = () => ({
  description: $("description").value,   
  amount: $("amount").value,
  category: $("category").value,
  date: $("date").value,
});

export function setFieldError(field, message) {
  const input = $(field);
  $(`${field}-error`).textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

export function showFieldErrors(errors) {
  for (const field of FIELDS) setFieldError(field, errors[field] ?? "");
}

export function focusFirstError(errors) {
  const first = FIELDS.find((field) => errors[field]);
  if (first) $(first).focus();
}

export function resetForm() {
  $("record-form").reset();
  showFieldErrors({});
}

export const setStatus = (id, message) => {
  $(id).textContent = message;
};

export function fillCategoryList(categories) {
  const options = categories.map((name) => {
    const option = document.createElement("option");
    option.value = name;
    return option;
  });
  $("category-list").replaceChildren(...options);
}

export function askConfirm(message) {
  const dialog = $("confirm-dialog");
  $("confirm-text").textContent = message;
  dialog.returnValue = "";             
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "confirm"), { once: true });
    dialog.showModal();                
  });
}

export function focusRecordsHeading() {
  const heading = $("records-title");
  heading.setAttribute("tabindex", "-1");
  heading.focus();
}