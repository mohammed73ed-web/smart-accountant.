(function (root) {
  "use strict";
  var DEFAULT_ACCOUNTS = [
    { code: "1000", name: "الأصول", type: "asset", parent: null },
    { code: "1100", name: "الصندوق", type: "asset", parent: "1000" },
    { code: "1200", name: "البنوك", type: "asset", parent: "1000" },
    { code: "1300", name: "العملاء", type: "asset", parent: "1000" },
    { code: "1400", name: "المخزون", type: "asset", parent: "1000" },
    { code: "2000", name: "الالتزامات", type: "liability", parent: null },
    { code: "2100", name: "الموردون", type: "liability", parent: "2000" },
    { code: "2200", name: "ضرائب مستحقة", type: "liability", parent: "2000" },
    { code: "3000", name: "حقوق الملكية", type: "equity", parent: null },
    { code: "3100", name: "رأس المال", type: "equity", parent: "3000" },
    { code: "3200", name: "الأرباح المحتجزة", type: "equity", parent: "3000" },
    { code: "4000", name: "الإيرادات", type: "income", parent: null },
    { code: "4100", name: "إيرادات المبيعات", type: "income", parent: "4000" },
    { code: "4200", name: "إيرادات أخرى", type: "income", parent: "4000" },
    { code: "5000", name: "المصروفات", type: "expense", parent: null },
    { code: "5100", name: "تكلفة البضاعة المباعة", type: "expense", parent: "5000" },
    { code: "5200", name: "الرواتب والأجور", type: "expense", parent: "5000" },
    { code: "5300", name: "الإيجارات والمرافق", type: "expense", parent: "5000" }
  ];

  function fail(message) { var e = new Error(message); e.name = "AccountingValidationError"; throw e; }
  function round(value) { return Math.round((value + Number.EPSILON) * 100000000) / 100000000; }
  function validateChart(accounts) {
    if (!Array.isArray(accounts) || !accounts.length) fail("دليل الحسابات فارغ أو غير صالح");
    var map = new Map();
    accounts.forEach(function (a) {
      if (!a || !/^\d{3,12}$/.test(String(a.code)) || !String(a.name || "").trim()) fail("بيانات حساب غير صالحة");
      if (map.has(a.code)) fail("رمز حساب مكرر: " + a.code);
      if (["asset", "liability", "equity", "income", "expense"].indexOf(a.type) < 0) fail("نوع حساب غير صالح: " + a.code);
      map.set(a.code, a);
    });
    accounts.forEach(function (a) {
      if (a.parent && !map.has(a.parent)) fail("الحساب الأب غير موجود: " + a.parent);
      if (a.parent === a.code) fail("لا يمكن أن يكون الحساب أباً لنفسه");
    });
    return map;
  }
  function validateEntry(entry, chart) {
    var map = validateChart(chart || DEFAULT_ACCOUNTS);
    if (!entry || !/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date || "")) || isNaN(Date.parse(entry.date))) fail("تاريخ القيد غير صالح");
    if (!Array.isArray(entry.lines) || entry.lines.length < 2) fail("القيد يجب أن يحتوي على سطرين على الأقل");
    var totals = Object.create(null);
    entry.lines.forEach(function (line) {
      if (!line || !map.has(String(line.accountCode))) fail("رمز الحساب غير موجود في دليل الحسابات");
      var debit = Number(line.debit || 0), credit = Number(line.credit || 0);
      if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit < 0 || credit < 0) fail("قيمة مدينة أو دائنة غير صالحة");
      if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) fail("كل سطر يجب أن يكون مديناً أو دائناً فقط");
      if (!line.currency || !/^[A-Z]{3,8}$/.test(String(line.currency))) fail("رمز العملة غير صالح");
      var t = totals[line.currency] || (totals[line.currency] = { debit: 0, credit: 0 });
      t.debit = round(t.debit + debit); t.credit = round(t.credit + credit);
    });
    Object.keys(totals).forEach(function (currency) {
      if (Math.abs(totals[currency].debit - totals[currency].credit) > 0.00000001) fail("القيد غير متوازن بعملة " + currency);
    });
    return { valid: true, totals: totals };
  }
  function trialBalance(entries, chart, currency) {
    var map = validateChart(chart || DEFAULT_ACCOUNTS), result = {};
    map.forEach(function (a, code) { result[code] = { code: code, name: a.name, type: a.type, debit: 0, credit: 0, balance: 0 }; });
    (entries || []).forEach(function (entry) {
      if (entry.status !== "posted") return;
      entry.lines.forEach(function (line) {
        if (currency && line.currency !== currency) return;
        var row = result[line.accountCode];
        if (!row) fail("قيد مرحّل يحتوي على حساب غير موجود: " + line.accountCode);
        row.debit = round(row.debit + Number(line.debit || 0));
        row.credit = round(row.credit + Number(line.credit || 0));
      });
    });
    Object.keys(result).forEach(function (code) {
      var row = result[code];
      row.balance = round(row.debit - row.credit);
    });
    return Object.keys(result).map(function (code) { return result[code]; });
  }
  function generalLedger(entries, accountCode, currency) {
    var rows = [];
    (entries || []).filter(function (e) { return e.status === "posted"; }).slice().sort(function (a,b) { return a.date.localeCompare(b.date); }).forEach(function (e) {
      e.lines.forEach(function (line) {
        if (line.accountCode === accountCode && (!currency || line.currency === currency)) rows.push({ date: e.date, reference: e.reference || "", memo: e.memo || "", debit: Number(line.debit || 0), credit: Number(line.credit || 0), currency: line.currency });
      });
    });
    var running = 0;
    return rows.map(function (r) { running = round(running + r.debit - r.credit); r.balance = running; return r; });
  }
  root.OnyxAccounting = Object.freeze({ defaultAccounts: DEFAULT_ACCOUNTS, validateChart: validateChart, validateEntry: validateEntry, trialBalance: trialBalance, generalLedger: generalLedger });
}(typeof globalThis !== "undefined" ? globalThis : this));
