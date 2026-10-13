# Student Finance Tracker - Spec

## Purpose
To help students track their spending, set a budget cao, and search records with regex.


## Data model (one record)

{
    "id":"txn_0001",
    "description": "Lunch at cafeteria",
    "amount": 12.5,
    "category": "Food",
    "date": "2025-09-29",
    "createdAt": "2025-09-29T10:00:00.000Z",
    "updatedAt": "2025-09-29T10:00:00.000Z"
}


## Settings (saved separately)

{
    "baseCurrency": "RWF",
    "rates": { "USD": 0.0007, "EUR": 0.0006 },
    "cap": 50000,
    "categories": ["Food", "Books", "Transport", "Entertainment", "Feed", "Other"]
}


## Regex rules
1. Description: no leading or trailing space
2. Amount: up to 2 decimals, no leading zeros
3. Date: YYYY-MM-DD
4. Category: letters, spaces, hyphens
5. Advanced: duplicate word check with a back-reference


## Sections
About, Dashboard, Add/Edit form, Records, Settings