# Daily Report System — Setup Guide

## Files Included
```
daily-report/
├── Code.gs             ← Google Apps Script backend
├── config.js           ← Your configuration (edit this)
├── style.css           ← Shared styles
├── common.js           ← Shared utilities
├── index.html          ← Dashboard
├── sales.html          ← Sales Details
├── bank_balance.html   ← Cash & Bank Balance
├── receivables.html    ← Total Receivable
└── payables.html       ← Total Payable
```

---

## Step 1 — Create Google Sheet

1. Go to https://sheets.google.com and create a **new blank spreadsheet**
2. Name it: `Daily Report System`
3. Keep it open — Google Apps Script will create all tabs automatically

---

## Step 2 — Set Up Google Apps Script

1. In your Google Sheet, click: **Extensions → Apps Script**
2. Delete any default code in the editor
3. **Copy all content from `Code.gs`** and paste it into the editor
4. Click 💾 **Save** (Ctrl+S)
5. Click **Deploy → New Deployment**
6. Click ⚙️ gear icon → Select type: **Web app**
7. Settings:
   - Description: `Daily Report API`
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. Click **Authorize access** → choose your Google account → Allow
10. **Copy the Web App URL** — it looks like:
    `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 3 — Configure the HTML Files

Open `config.js` in any text editor and update:

```javascript
const CONFIG = {
  SCRIPT_URL: 'PASTE_YOUR_WEB_APP_URL_HERE',  // ← paste Step 2 URL
  COMPANY_NAME: 'Your Company Name',           // ← your company name
};
```

Save the file.

---

## Step 4 — Run the System

**Option A (Simple):** Open `index.html` directly in your browser.
> ⚠️ Some browsers block cross-origin requests from file:// — if data doesn't load, use Option B.

**Option B (Recommended):** Run a local web server:
```bash
# Python 3
cd path/to/daily-report
python3 -m http.server 8080
# Then open: http://localhost:8080
```

**Option C:** Upload all files to any web hosting (cPanel, Netlify, etc.) and open the hosted URL.

---

## How to Use

### Dashboard (index.html)
- Overview of all sections
- Summary cards for sales, bank, receivables, payables
- Print full report button

### Sales (sales.html)
- Add/Edit/Delete sale entries
- Filter by date range, currency, category, customer
- Print section

### Cash & Bank (bank_balance.html)
- Add any number of LKR accounts
- Add any number of USD accounts
- Update balance with one click
- Edit or delete accounts anytime

### Receivables (receivables.html)
- Add receivables for Local, Seychelles, or Maldives customers
- Outstanding auto-calculates (Total − Paid)
- Overdue rows highlighted in red
- Filter by region tab, status, customer

### Payables (payables.html)
- Manage suppliers list (add/edit/delete)
- Add payable invoices linked to suppliers
- Outstanding auto-calculates
- Filter by supplier, status

---

## Updating After Changes

If you redeploy Code.gs (after changes):
1. Go to **Deploy → Manage Deployments**
2. Click the pencil icon → **Version: New version**
3. Click **Deploy** — the URL stays the same ✓

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch" | Use a local server (Option B above) |
| "API error" | Check SCRIPT_URL in config.js is correct |
| Data not saving | Re-authorize: in Apps Script → Run any function → Authorize |
| Blank dashboard | Check Google Sheet permissions — make sure it's not restricted |

---

## Support
All data is stored in your Google Sheet. You can view/edit it directly there.
Each section tab is auto-created when first used.
