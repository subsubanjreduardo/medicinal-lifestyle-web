# Medicinal Lifestyle — actual website, runnable in VS Code

This package contains the real storefront and admin source from the published Medicinal Lifestyle site, including all nine bundled photographs. It is not a replacement MVC template or a set of screenshot mockups.

The storefront, product modal, bag, checkout, customer orders, reviews, admin products, product editor, inventory, homepage content editor, settings and order manager are included.

## Start on Windows

1. Install **Node.js 24 LTS** (or Node.js 22.13+). Close and reopen VS Code after installation.
2. Extract the ZIP completely. Do not open files from inside the ZIP.
3. In VS Code choose **File → Open Folder**, then select `medicinal-lifestyle-vscode`. The folder must contain `package.json`.
4. Open **Terminal → New Terminal**. Choose **Command Prompt** as the terminal profile if PowerShell blocks `npm.ps1`.
5. Run:

```bat
node --version
npm install
npm run dev
```

6. Open **http://localhost:3000** for the storefront.
7. Open **http://localhost:3000/admin**. On first run it opens setup: choose your own admin email and password (minimum 12 characters).
8. Sign in to manage products, inventory, images, homepage content, shipping, payments and orders.

There is no preset or shared admin password. No XAMPP, PHP, separate database server, MongoDB account, ChatGPT sign-in or Cloudinary account is needed for local development.

For the fastest start, `npm run dev` also works before `npm install`: the local server uses only Node built-ins. `npm install` installs the optional schema-development dependencies.

Keep the terminal running while using the app. Press **Ctrl+C** to stop. Later, run `npm run dev` again; saved data remains.

## What matches the hosted site

- Original storefront CSS, admin CSS and customer account CSS.
- Original product photographs in `public/assets/` (nine images).
- Product, bag, checkout and confirmation layouts.
- Admin Products, Inventory, Website Content, Settings → Store and Orders.
- Sale prices, variant prices, stock logs, purchase stock deductions, cancellation restoration, private customer orders, and product reviews.
- A snapshot of the publicly visible catalog and website settings, revision 10, captured September 19, 2026.

The current snapshot contains **five published products**. At capture time the configured hero image was empty and the hero subheading was `DROP 001 — NOW LIVE`. Those are your captured live settings, not missing source assets. To restore a hero image locally, open **Admin → Website Content → Hero**, choose an included photo or upload one, then Save / Publish.

The source's original six-product initial catalog is also retained in `server/seed.js`. The current public snapshot takes precedence on first startup.

## What is different locally

- The hosted ChatGPT sign-in is replaced with local email/password sign-in. Customers can register; the first-run setup creates the administrator.
- SQLite replaces the hosted D1 binding. All app data persists in `data/store.sqlite`.
- Image uploads work immediately, saving files in `data/uploads/`. Optional Cloudinary credentials can be added later.
- Existing Search, mobile Menu and heart controls have local implementations. Size Guide displays available sizes and honestly identifies missing garment measurements. Escape closes storefront overlays.
- Saved-product heart selections are device-local preferences.

These local additions reuse the existing style. They do not redesign the storefront or admin.

## Included content versus live private data

The package includes code, bundled images, public catalog data and homepage settings. It does **not** copy live customer accounts, passwords, orders, reviews, inventory history, or inaccessible draft/archived catalog records. Register test customers and create sample orders locally.

The admin screens and workflows are fully included even though their private live records are not copied. Local changes do not sync to the live website. No deployment credentials or live account secrets are included.

## Test the complete shopping flow

1. Sign in as your local admin.
2. Go to **Inventory**, select a product/variant, use **Set** or **Add**, enter a quantity and a reason, then record the adjustment. The captured regular products may have zero stock.
3. Confirm the product is Published, available, and has a price in Products.
4. Open an incognito browser window as a separate customer.
5. Visit the store, open a product, choose a color/size and add it to the bag.
6. Checkout redirects to local sign-in. Create a customer account, then complete delivery details and place an order.
7. Check **My Account** for the order. Add or update a product review.
8. In the admin window, open **Orders → Manage** to update status or tracking.
9. Cancel an unfulfilled test order and check Inventory history for the stock restoration.

GCash and Bank Transfer are manually recorded payment options, not payment-gateway integrations. No money is collected by this local app.

## Edit and continue development

| File / folder | Purpose |
|---|---|
| `public/index.html` | Storefront page and overlay structure |
| `public/styles.css` | Storefront appearance and responsive rules |
| `public/app.js` | Bag, product modal, checkout and reviews |
| `public/storefront.js` | Dynamic catalog, content, prices and settings |
| `public/local-enhancements.js` | Local search, menu, saved-product toggle and Escape controls |
| `public/admin.html` / `public/admin.css` | Admin layout and styling |
| `public/cms-admin.js` | Product, inventory, content and settings forms |
| `public/admin.js` | Order management |
| `public/account.html`, `.css`, `.js` | Customer order history |
| `public/assets/` | Original photographs |
| `server/cms.js` | Product/CMS validation, stock and order transactions |
| `server/index.js` | Shared routes, reviews and account/order logic |
| `server/seed.js` | Original default products |
| `local/server.mjs` | Local HTTP server, authentication, database adapter and uploads |
| `local/store-snapshot.json` | Public catalog/settings snapshot imported only on first run |
| `db/schema.ts` / `drizzle/` | Database schema and migrations |
| `design.md` | Extracted design reference for development and Stitch |
| `README.md` | Setup and development instructions |

HTML/CSS/browser JavaScript changes appear after refreshing the browser. Shared server source changes are reloaded by the local server. Restart the server after editing `local/server.mjs` or environment configuration.

Change day-to-day catalog data, stock, hero content and prices in Admin. Editing `server/seed.js` does not overwrite an existing database.

## Commands

```bat
npm run dev
npm start
npm test
npm run build
npm run test:store
npm run seed
```

- `dev` / `start`: run the local server.
- `test`: check required source, JavaScript syntax and original assets.
- `build`: create the shared Worker build for inspection/tests. This does not publish the local project.
- `test:store`: run the isolated catalog, inventory and checkout tests after `build`.
- `seed`: explain the automatic, non-destructive first-run initialization. It does not reset data.

## Optional Cloudinary

Copy `.env.example` to `.env`. Fill in your own Cloudinary cloud name, API key and API secret, then restart the server. Without all three, uploads continue to use the local uploads directory. Keep `.env` private.

## Database and backups

Stop the server before copying the `data/` folder as a backup. Keep the database and uploaded files together. `data/` is created automatically and is not bundled with test accounts or test orders.

To start a completely separate test database, configure a new `DATA_DIR` in `.env`. Do not delete your existing data just to change store content.

This edition uses **SQLite, not MongoDB Atlas**. Migrating to MongoDB requires a data-layer migration; replacing a connection string alone is insufficient. The current export prioritizes matching your existing website and running successfully on your laptop.

## Troubleshooting

**`npm` is not recognized:** Install Node.js, reopen VS Code, and run `node --version`.

**PowerShell says scripts are disabled:** Select the Command Prompt terminal profile, or use `npm.cmd install` and `npm.cmd run dev`. No system-wide policy change is necessary.

**`node:sqlite` is missing:** Upgrade to Node.js 24 LTS or 22.13+.

**Port 3000 is busy:** Stop the other app, or copy `.env.example` to `.env`, set `PORT=3001`, restart, and use `http://localhost:3001`.

**Images do not show after moving files:** Extract the entire folder. Do not move `public/assets` out of the project. Uploaded images require the matching `data/uploads` folder.

**Products say Out of Stock:** Enter actual sample quantities in Inventory. Pre-orders work only when both product and store settings allow them.

**The page differs from an old screenshot:** The packaged public snapshot reflects the current captured website settings. An older screenshot may show the original hero or products that you later unpublished. All nine original photographs remain available.

**Fonts look different offline:** The original storefront/account pages request Google Fonts. Internet access is needed for those web fonts unless you later self-host them. Original images are bundled locally.

## Scope and verification

This is a runnable development copy of the published website, not every feature ever proposed in earlier chats. MongoDB migration, real Google OAuth, email verification/password-reset delivery, payment-gateway processing and production hosting setup are not included.

The local server binds to your own computer only. Before deploying publicly, add a production hosting/authentication configuration, HTTPS, account recovery, and the operational controls needed for your deployment. Do not expose this development server directly to the internet.

Verified with Node.js 24: server startup, first admin setup, password sign-in, session logout, admin authorization, rejection of spoofed identity headers, CMS saves, image upload, customer checkout, reviews, order history, and cancellation stock restoration. Original store business-logic tests also pass. Browser visual QA and execution on a Windows machine were not performed; original design files and image bytes were retained.
