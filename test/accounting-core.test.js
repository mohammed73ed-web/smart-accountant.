"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
require("../accounting-core.js");
const A = globalThis.OnyxAccounting;
const entry = {
  id: "J-001", date: "2026-11-07", reference: "JV-001", memo: "قيد افتتاحي",
  status: "posted",
  lines: [
    { accountCode: "1100", debit: 1000, credit: 0, currency: "USD" },
    { accountCode: "3100", debit: 0, credit: 1000, currency: "USD" }
  ]
};

test("default chart has unique valid account codes", () => {
  assert.equal(A.validateChart(A.defaultAccounts).size, A.defaultAccounts.length);
});

test("accepts a balanced double-entry journal", () => {
  assert.equal(A.validateEntry(entry).valid, true);
});

test("rejects an unbalanced journal", () => {
  const bad = structuredClone(entry);
  bad.lines[1].credit = 999;
  assert.throws(() => A.validateEntry(bad), /غير متوازن/);
});

test("rejects missing accounts", () => {
  const bad = structuredClone(entry);
  bad.lines[0].accountCode = "9999";
  assert.throws(() => A.validateEntry(bad), /غير موجود/);
});

test("rejects a line with both debit and credit", () => {
  const bad = structuredClone(entry);
  bad.lines[0].credit = 1;
  assert.throws(() => A.validateEntry(bad), /مديناً أو دائناً/);
});

test("rejects negative amounts", () => {
  const bad = structuredClone(entry);
  bad.lines[0].debit = -1;
  assert.throws(() => A.validateEntry(bad), /غير صالحة/);
});

test("balances trial balance for a selected currency", () => {
  const rows = A.trialBalance([entry], A.defaultAccounts, "USD");
  const debit = rows.reduce((n, r) => n + r.debit, 0);
  const credit = rows.reduce((n, r) => n + r.credit, 0);
  assert.equal(debit, 1000);
  assert.equal(credit, 1000);
});

test("calculates running general ledger balance", () => {
  const rows = A.generalLedger([entry], "1100", "USD");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].balance, 1000);
});

test("rejects impossible calendar dates", () => {
  const bad = structuredClone(entry);
  bad.date = "2026-02-31";
  assert.throws(() => A.validateEntry(bad), /تاريخ القيد غير صالح/);
});

test("requires a currency when trial balance spans multiple currencies", () => {
  const other = structuredClone(entry);
  other.id = "J-002";
  other.lines.forEach(line => { line.currency = "YER"; });
  assert.throws(() => A.trialBalance([entry, other]), /حدد العملة/);
});
