# Architecture

## Components

- **Web client** — React SPA (Vite), English-only for MVP (build i18n-ready for later Hebrew/RTL): guided questionnaire, bouquet catalog with filters, product pages, build-your-own, cart, auth (sign up / log in), checkout with delivery details.
- **API server** — NestJS (on Express) REST/JSON API: catalog, questionnaire recommendations, build-your-own pricing, auth/accounts, cart/orders, checkout, payment integration, stock decrement.
- **Database** — PostgreSQL: users, products (bouquets and individual stems), occasions/colors/price attributes, stock quantities, orders with per-order recipient and delivery details. Also the owner's MVP "admin": restocking is done directly in the database.
- **Recommendation logic** — rule-based (no LLM in MVP): maps occasion + budget + color to suitable bouquets, or to a starting stem mix within budget.
- **Payment provider** — external (TBD), used by checkout.

## Data Flow

- Web client → API server over HTTP (REST/JSON).
- API server → PostgreSQL for all persistent data.
- Checkout requires an authenticated user. On successful payment: API server confirms with the payment provider → creates the order → decrements stock quantities in the same transaction.
- Restocking: the owner updates quantities directly in PostgreSQL.

## Environments

TBD

## Gotchas

- Inventory: stock must be re-checked at payment time — two customers can try to buy the last stems at once; the decrement must be atomic and refuse oversell.
- Inventory: a ready-made bouquet is stocked as its own unit (not by stem recipe); build-your-own stems have separate stock.
- Pricing: a product's price might change after the customer adds it to the cart — recompute on the server at checkout.
- Delivery: a customer might select a delivery date or address outside what can be delivered.
- Build-your-own: when started from the questionnaire, the mix must not exceed the customer's budget — enforce server-side.
