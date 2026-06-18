---
title: SCG Tuitions App - Payments
domain: projects
level: reference
status: active
tags: [scg-tuitions, payments, stripe, sumup, invoice, no-backend]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Payments

## Architecture: No Backend, No API Keys

Both Stripe and SumUp are integrated via **Payment Links** only.
No API keys in the app. No webhook. No server.

## Flow

```
Teacher                                    Parent
──────                                    ──────
1. Creates payment record in              3. Opens parent-payments.html
   teacher-payments.html                  4. Sees current term card
   - Pastes Stripe Payment Link URL       5. Clicks "Pay with Stripe"
   - Optional SumUp URL                      (opens Stripe in new tab)
   - Sets term name, amount, due date     6. Completes payment on Stripe
   - Invoice number e.g. SCG-2026-001

2. Record saved to Firestore              7. Clicks "View Invoice"
                                             (opens invoice.html?paymentId=xxx)

Teacher marks paid                        Parent sees green "Paid" badge
8. Clicks "Mark as paid"
   - Sets paid: true, paidAt: now()
   - Selects method (stripe/sumup/bank/cash)
```

## Firestore `payments` Document

```js
{
  parentId: string,
  studentName: string,
  parentName: string,
  teacherId: string,
  termName: string,                // "Autumn Term 2025"
  amountDue: number,               // in pence — 25000 = £250
  dueDate: Timestamp,
  paid: boolean,
  paidAt: Timestamp | null,
  paymentMethod: "stripe" | "sumup" | "bank" | "cash",
  stripePaymentLink: string,       // URL from Stripe dashboard
  sumupPaymentLink: string | null, // URL from SumUp dashboard
  invoiceNumber: string,           // "SCG-2026-001"
  notes: string,
  createdAt: Timestamp
}
```

## Invoice Page (`invoice.html`)

- Opened via `invoice.html?paymentId=xxx` in a new tab
- Reads `paymentId` from URL params
- Fetches Firestore payment doc
- Renders printable invoice: SCG logo, address (Swindon), invoice number, date, student name, term, amount, VAT (0%), total, payment status
- "Print / Save as PDF" button calls `window.print()`
- `@media print` CSS hides the button and cleans layout

## Security Rules

Payments collection: **admin** creates and updates. Parent reads own docs only. No delete ever.

```
match /payments/{docId} {
  allow create, update: if isAdmin();
  allow read: if isAuthed() && (resource.data.parentId == uid() || isAdmin());
  allow delete: if false;
}
```

Note: `isAdmin()` not `isTeacher()` — teacher doesn't have write access to payments. If teacher needs to create payments, the admin role must be assigned to the teacher account, or the rule must be updated to `isStaff()`.

## How to Create a Stripe Payment Link

1. Log into Stripe dashboard
2. Payment Links → Create link
3. Set price, description (term name)
4. Copy the `pay.stripe.com/...` URL
5. Paste into `teacher-payments.html` form

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Firebase & Firestore]]
- [[SCG Tuitions - Caching & Deploy]]
