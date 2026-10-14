const RECORDS_KEY = "sft:records"; 

export function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);  
    if (!raw) return [];
    const data = JSON.parse(raw);                   
    return Array.isArray(data) ? data : [];
  } catch {
    return [];                                      
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));  
    return true;
  } catch {
    return false;                                    
  }
}

