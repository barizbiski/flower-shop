# Product Roadmap

> Design reference: "Flower by Event" demo canvas — https://claude.ai/artifact/PdKd3SZELharkGgtHa5MwM (shows MVP and Phase 2 features together; this roadmap decides what's MVP).

## Core Features (current state)

None — greenfield product.

## Phase 1: MVP

| Feature | Why it matters |
|---|---|
| Guided Questionnaire | The core differentiator. Occasion → budget → color → recommended ready-made bouquet(s), or a starting flower mix capped at the budget. |
| Ready-made Bouquet Catalog | Lets customers who know what they want browse florist-designed bouquets. |
| Filters (budget, color) + Product Pages | Narrows the catalog. Occasion is chosen only in the guided questionnaire, not as a catalog filter. Product pages show images, price, what's inside, and which occasions it suits. |
| Build Your Own Bouquet | Personal expression. Curated set of 20 stems (17 flowers + 3 fillers/greenery), price per stem, size label by stem count (Petite / Classic / Grand / Luxe), wrap or vase choice. Capped at the budget when started from the questionnaire. |
| Shopping Cart | Collect and review items before checkout. |
| Basic User Account | Sign up / log in, with the buyer's personal details. **Required at checkout** — every buyer becomes a registered user (supports the success measure; deliberate trade-off against some last-minute buyers). |
| Checkout with Delivery Details | Per order: recipient name, phone, address, delivery date ("send to myself" copies from the account). |
| Payment | Online payment at checkout. |
| Stock Quantities | Real quantities per item. Automatically decremented when payment completes; the owner restocks manually in the database when supplier deliveries arrive. No admin UI. |

## Phase 2: Post-Launch

- AI chat assistant (to be reconsidered)
- Admin dashboard — orders, stock updates, sales charts
- Greeting cards and gift add-ons (chocolates, wine, balloon)
- Wishlist
- Occasion reminders (emails before saved dates — supports repeat customers)
- Saved recipients / address book
- Order confirmation and status emails
- Hebrew / RTL support (likely early — see customer risks)
- Product reviews
- Promo codes

## Open Questions

- How does the owner get notified of new orders in the MVP? (Likely an email to the owner.)
- ~~Does a ready-made bouquet decrement its component stems by recipe, or is it stocked as its own unit?~~ Decided 2026-11-21 (bouquet-catalog epic): stocked as its own unit for MVP.
- Delivery area, delivery fee, and daily order capacity.
- Payment provider.
