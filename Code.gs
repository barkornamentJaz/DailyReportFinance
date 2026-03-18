// ============================================================
// Code.gs — Bark Ornament Daily Report System
// Deploy: Extensions > Apps Script > Deploy > Web App
//         Execute as: Me | Who has access: Anyone
// ============================================================

const HEADERS = {
  Sales:        ['ID','Date','SaleType','Currency','Amount','Notes'],
  BankAccounts: ['ID','AccountName','Bank','Currency','AccountNo','Balance'],
  BankDailyLog: ['ID','Date','AccountID','AccountName','Currency','Balance','Notes'],
  CashDetails:  ['ID','Date','OpeningBalance','CashIn','CashOut','ClosingBalance','Notes'],
  PettyCash:    ['ID','Date','EntryType','Description','Amount','Balance','Notes'],
  Customers:    ['ID','Name','Region','Contact','Email'],
  Receivables:  ['ID','CustomerName','Region','InvoiceNo','InvoiceDate','DueDate','TotalAmount','PaidAmount','Outstanding','Status','Currency','Notes'],
  Suppliers:    ['ID','Name','Contact','Email'],
  Payables:     ['ID','SupplierName','InvoiceNo','InvoiceDate','DueDate','TotalAmount','PaidAmount','Outstanding','Status','Currency','Notes']
};

function ok(data)  { return out({ success:true, data }); }
function err(msg)  { return out({ success:false, error:msg }); }
function out(obj)  { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  try {
    const a=e.parameter.action, s=e.parameter.sheet;
    if(a==='getAll')     return ok(getAllRows(s));
    if(a==='getSummary') return ok(getSummary());
    return err('Unknown action');
  } catch(ex) { return err(ex.message); }
}

function doPost(e) {
  try {
    const p=JSON.parse(e.postData.contents);
    const{action,sheet,data,id}=p;
    if(action==='add')    return ok(addRow(sheet,data));
    if(action==='update') return ok(updateRow(sheet,id,data));
    if(action==='delete'){ deleteRow(sheet,id); return ok(null); }
    return err('Unknown action');
  } catch(ex) { return err(ex.message); }
}

function getSheet(name) {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(name);
  if(!sh) {
    sh=ss.insertSheet(name);
    const hdrs=HEADERS[name];
    if(hdrs) {
      sh.appendRow(hdrs);
      sh.getRange(1,1,1,hdrs.length).setBackground('#1d4ed8').setFontColor('#fff').setFontWeight('bold');
    }
  }
  return sh;
}

function getAllRows(name) {
  const sh=getSheet(name);
  const vals=sh.getDataRange().getValues();
  if(vals.length<=1) return [];
  const hdrs=vals[0];
  return vals.slice(1).map((row,i)=>{
    const o={_row:i+2};
    hdrs.forEach((h,j)=>{o[h]=row[j];});
    return o;
  }).filter(r=>r.ID!=='');
}

function addRow(name,data) {
  const sh=getSheet(name);
  const hdrs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  data.ID=Utilities.getUuid();
  sh.appendRow(hdrs.map(h=>data[h]!==undefined?data[h]:''));
  return data;
}

function updateRow(name,id,data) {
  const sh=getSheet(name);
  const vals=sh.getDataRange().getValues();
  const hdrs=vals[0];
  const idIdx=hdrs.indexOf('ID');
  for(let i=1;i<vals.length;i++) {
    if(String(vals[i][idIdx])===String(id)) {
      hdrs.forEach((h,j)=>{ if(data[h]!==undefined) sh.getRange(i+1,j+1).setValue(data[h]); });
      return data;
    }
  }
  throw new Error('Record not found: '+id);
}

function deleteRow(name,id) {
  const sh=getSheet(name);
  const vals=sh.getDataRange().getValues();
  const hdrs=vals[0];
  const idIdx=hdrs.indexOf('ID');
  for(let i=1;i<vals.length;i++) {
    if(String(vals[i][idIdx])===String(id)){sh.deleteRow(i+1);return;}
  }
  throw new Error('Record not found: '+id);
}

function getSummary() {
  const today=new Date();today.setHours(0,0,0,0);
  const m=today.getMonth(),y=today.getFullYear();
  const sales=getAllRows('Sales');
  const accounts=getAllRows('BankAccounts');
  const recs=getAllRows('Receivables');
  const pays=getAllRows('Payables');
  const cash=getAllRows('CashDetails');
  const petty=getAllRows('PettyCash');
  const sum=(arr,key)=>arr.reduce((s,x)=>s+(parseFloat(x[key])||0),0);
  const todaySales=sales.filter(s=>{const d=new Date(s.Date);d.setHours(0,0,0,0);return+d===+today;});
  const monSales=sales.filter(s=>{const d=new Date(s.Date);return d.getMonth()===m&&d.getFullYear()===y;});
  const lkrAcc=accounts.filter(a=>a.Currency==='LKR');
  const usdAcc=accounts.filter(a=>a.Currency==='USD');
  const todayCash=cash.filter(c=>{const d=new Date(c.Date);d.setHours(0,0,0,0);return+d===+today;});
  const lastPetty=petty.sort((a,b)=>new Date(a.Date)-new Date(b.Date));
  return {
    sales:{
      todayExport:sum(todaySales.filter(s=>s.SaleType==='Export'),'Amount'),
      todayLocal:sum(todaySales.filter(s=>s.SaleType==='Local'),'Amount'),
      monthExport:sum(monSales.filter(s=>s.SaleType==='Export'),'Amount'),
      monthLocal:sum(monSales.filter(s=>s.SaleType==='Local'),'Amount'),
    },
    bank:{totalLKR:sum(lkrAcc,'Balance'),totalUSD:sum(usdAcc,'Balance'),lkrCount:lkrAcc.length,usdCount:usdAcc.length},
    cash:{
      todayClosing:todayCash.length?todayCash[todayCash.length-1].ClosingBalance||0:null,
      todayIn:sum(todayCash,'CashIn'),todayOut:sum(todayCash,'CashOut')
    },
    petty:{balance:lastPetty.length?lastPetty[lastPetty.length-1].Balance||0:0},
    receivables:{
      total:sum(recs.filter(r=>r.Status!=='Paid'),'Outstanding'),
      overdue:sum(recs.filter(r=>new Date(r.DueDate)<today&&r.Status!=='Paid'),'Outstanding'),
      local:sum(recs.filter(r=>r.Region==='Local'&&r.Status!=='Paid'),'Outstanding'),
      sey:sum(recs.filter(r=>r.Region==='Seychelles'&&r.Status!=='Paid'),'Outstanding'),
      maldives:sum(recs.filter(r=>r.Region==='Maldives'&&r.Status!=='Paid'),'Outstanding'),
      count:recs.filter(r=>r.Status!=='Paid').length
    },
    payables:{
      total:sum(pays.filter(p=>p.Status!=='Paid'),'Outstanding'),
      overdue:sum(pays.filter(p=>new Date(p.DueDate)<today&&p.Status!=='Paid'),'Outstanding'),
      count:pays.filter(p=>p.Status!=='Paid').length
    }
  };
}
