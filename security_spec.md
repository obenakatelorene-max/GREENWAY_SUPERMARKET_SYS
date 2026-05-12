# Firestore Security Specification - Supermarket Pro Tracker

## Data Invariants
1. Products must have a unique SKU (enforced by application logic/indexes).
2. Stock quantity cannot be negative (in a perfect world, but I'll allow it for flexibility in this demo).
3. Every Sale Item must belong to an existing Sale.
4. Sales totals must be positive.

## The "Dirty Dozen" Payloads (Deny cases)
1. **Unauthenticated Write**: Attempting to add a product without being logged in.
2. **Identity Spoofing**: Attempting to set `created_by` to another user ID (not used here but good to note).
3. **Ghost Field Update**: Adding `is_admin: true` to a product document.
4. **Invalid Type**: Sending `price: "free"` instead of a number.
5. **Resource Exhaustion**: Sending a 1MB string as a product name.
6. **State Skip**: Directly updating a sale total after it's been created.
7. **Negative Stock Hack**: Setting stock to a very large negative number via client.
8. **Orphaned Sale Item**: Creating a sale item without a sale document.
9. **Timestamp Spoofing**: Sending a client-side date for `created_at` instead of `serverTimestamp()`.
10. **ID Poisoning**: Using a 2KB junk string as a document ID.
11. **Bulk Scrape**: Querying all sales without any filter (if restricted).
12. **Unauthorized Deletion**: Deleting a sale record as a non-admin.

## Test Runner (Logic)
The following `firestore.rules` will be validated against these payloads.
