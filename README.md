# ONYX Smart Accounting

Arabic-first offline desktop/mobile accounting app. The current build includes the original cash/account tracking screens plus an initial double-entry journal engine, a starter chart of accounts, and a currency-specific trial balance.

## Build and verification

GitHub Actions builds Windows NSIS setup and Android debug APK:
https://github.com/mohammed73ed-web/smart-accountant./actions

Every build runs Node.js tests for the double-entry engine. Artifacts are attached to successful runs:
- `ONYX-Windows-Installer`
- `ONYX-Android-APK`

## Included now

- Arabic RTL interface with local-first operation and no mandatory login.
- Existing account and cash-movement screens.
- Initial double-entry journal posting (two-line entry), rejects unbalanced postings.
- Starter chart of accounts.
- Trial balance by selected currency.
- General-ledger and trial-balance calculation functions in `accounting-core.js`.
- Backup/restore validation and CSV text export.
- Windows and Android packaging workflows.

## Not yet a complete ERP

This repository is **not yet a production-ready FULL ERP**. In particular, the following remain to be implemented and tested before that claim is justified:

- Multi-line journal editor, journal approval/reversal, fiscal periods and closing.
- Full chart-of-accounts management and mapping from all source documents to journal entries.
- SQLite persistence and schema migrations (the current UI still stores data in browser local storage).
- Sales, purchases, invoices, returns, customer/supplier subledgers and credit limits.
- Inventory warehouses, stock movements, costing (FIFO/weighted average) and stock valuation.
- Cash/bank reconciliation, receipts/payments, expenses, budgets and installments.
- Tax configuration, fixed assets and depreciation.
- Balance sheet, income statement, cash-flow statement and aged receivables/payables.
- Robust backup files, restore migration and encrypted/device-to-device sync.
- Automated end-to-end tests on actual Windows and Android devices.

A successful packaging workflow only confirms that installers were generated; it does not certify the complete ERP feature set or guarantee zero defects.
