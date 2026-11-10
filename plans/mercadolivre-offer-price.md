# Missing Mercado Livre offer price

Verified 2026-11-10 from the Railway production container, using the existing
unexpired token. The credential was read in a read-only database transaction;
no token values were printed or persisted locally.

- Product MLB2127526398: HTTP 200, buy_box_winner null.
- Selected item MLB5467833647: HTTP 403 access_denied.
- Selected item sale_price: HTTP 403.
- Product offers /products/MLB2127526398/items: HTTP 200, selected item
  price 33.99 BRL; another seller's item MLB5096699185 price 35.08 BRL.

The link parser correctly preserves the wid fragment. Expired authorization
and missing selected-offer ID are ruled out. Direct item resource access is
denied with this token; the provider's exact policy reason is not established.

Fix: when the direct price is absent, query catalogue offers and match the
selected or catalogue-winning item ID exactly. Never take an arbitrary offer.
If that offer is absent from the returned results, preserve manual entry.
Pagination and selecting a seller for links without a winner remain out of scope.

Regression test failed with null instead of 3399 before the fix and passed
afterward, including checks against accidentally selecting another seller.
No production instrumentation or configuration changes were needed.
