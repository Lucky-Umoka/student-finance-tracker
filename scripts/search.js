export function compileRegex(input, ignoreCase = true) {
  if (!input) return { regex: null, error: null };
  try {
     return { regex: new RegExp(input, ignoreCase ? "gi" : "g"), error: null };
  } catch (err) {
      return { regex: null, error: err.message };
  }
}
export const fieldsOf = (record) => ({
  description: record.description,
  amount: record.amount.toFixed(2),
  category: record.category,
  date: record.date,
});

function matches(regex, text) {
  regex.lastIndex = 0;
  return regex.test(text);
}

export function filterRecords(records, regex) {
  if (!regex) return records;
  return records.filter((record) =>
    Object.values(fieldsOf(record)).some((text) => matches(regex, text))
  );
}

export function highlight(text, regex) {
  const fragment = document.createDocumentFragment();
  if (!regex) {
    fragment.append(text);
    return fragment;
  }

    let last = 0;                                  
  for (const match of text.matchAll(regex)) {   
    if (match[0] === "") continue;               
    fragment.append(text.slice(last, match.index));   
    const mark = document.createElement("mark");
    mark.textContent = match[0];                      
    fragment.append(mark);
    last = match.index + match[0].length;
  }
  fragment.append(text.slice(last));            
  return fragment;
}
