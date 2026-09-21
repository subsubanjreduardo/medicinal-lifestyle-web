# Medicinal Lifestyle — Design Reference

## 1. Purpose and source

Recreate the existing Medicinal Lifestyle storefront, customer account, and admin interface as a faithful, editable prototype in Google Stitch.

- Website: https://medicinal-lifestyle-store.subsubanjr-eduardo.chatgpt.site/
- Admin: https://medicinal-lifestyle-store.subsubanjr-eduardo.chatgpt.site/admin
- Customer account: https://medicinal-lifestyle-store.subsubanjr-eduardo.chatgpt.site/account
- Document date: September 19, 2026.
- Reference: published version 4 source, commit `fcdadc655e57746f0bad8c5c5817cc3230a13ee6`.

This document was extracted from the existing HTML, CSS, and interface logic. It is a newly created reference, not a pre-existing configuration file used to generate the website. No new live screenshots were taken for this document. Admin-managed text, images, prices, and inventory can change independently of the source; use current screenshots for their exact visible values.

## 2. Visual direction

A bold streetwear storefront with large condensed-looking heavy display typography, oversized fashion photographs, black-and-white contrast, and acid-yellow/green accents. Product imagery carries the page. Layouts are clean, flat, and predominantly rectangular.

The admin is deliberately more utilitarian: a black header, horizontal section navigation, pale gray-green page background, white bordered panels, restrained rounded corners, and dense tables/forms. Preserve this difference between shopping and administration.

Reproduction rules:

- Preserve the existing composition, text hierarchy, image crops, spacing, and controls.
- Use actual brand/product images; do not generate replacement clothes or logos.
- Keep the admin's horizontal navigation; do not invent a sidebar.
- Keep the storefront product view as a modal and the bag as a right-side drawer.
- Avoid decorative gradients, glass effects, large rounded marketing cards, and unrelated dashboard charts. The hero's dark image overlay is intentional.
- Treat supplied screenshots as the visual authority for the captured state. Use this document to resolve styles, interactions, and missing states.

## 3. Color tokens

### Storefront and customer account

| Token / purpose | Value |
|---|---|
| Primary black | `#09090A` |
| Ink | `#171719` |
| Off-white page background | `#F8F8F6` |
| Secondary gray token | `#9A9A9A` |
| Borders / dividers | `#D8D8D4` |
| Acid accent | `#D7FF35` |
| Dark buttons and UI surfaces | `#111111` |
| White modal / drawer surfaces | `#FFFFFF` |
| Secondary product text | `#555555` |
| Descriptions / supporting text | `#666666` |
| Product image placeholder | `#D4D5D6` |
| Footer background | `#080808` |
| Promotional panel | `#F1F1EE` |
| Checkout summary panel | `#EEEEEE` |
| Backdrop | Black at 55% opacity |

### Admin

| Purpose | Value |
|---|---|
| Page background | `#F4F5F3` |
| Primary text | `#151617` |
| Header | `#111111` |
| Navigation background | `#E6E9E2` |
| Selected navigation | `#151617` background, `#D7FF35` text |
| Panels | `#FFFFFF` |
| Panel borders | `#DFE2DA` |
| Button borders | `#CCD0C9` |
| Input borders | `#BFC5B8` |
| Table header | `#F8F9F6` |
| Neutral status | `#F0F2EC` |
| Pending / notice | `#FFF0C2` |
| Paid / delivered | `#DEF1D4` |
| Cancelled / refunded | `#F4E0DF` |
| Shipped | `#DBE9FF` |

Do not use status color without a readable status label.

## 4. Typography

Storefront and account pages load **Archivo Black** and **Inter**. The admin declares `Inter, Arial, sans-serif` but does not independently load the web font in its HTML; its actual rendered face may fall back to Arial. Match the screenshot when exact admin text metrics matter.

| Element | Current source styling |
|---|---|
| Default body | Inter / Arial / sans-serif, 16px |
| Display headings | Archivo Black, tight negative tracking |
| Hero title, effective override | `clamp(2.5rem, 6vw, 6rem)`, line-height `.87`, tracking `-.06em`, max-width 850px |
| Major storefront section headings | `clamp(2.4rem, 4.2vw, 5rem)`, line-height `.93`, tracking `-.055em` |
| Eyebrows | Inter 700, `.72rem`, tracking `.18em` |
| Desktop navigation | Inter 700, `.79rem`, tracking `.08em` |
| Product name | `.86rem`; `.75rem` at ≤560px |
| Product price text | `.78rem`; `.7rem` at ≤560px |
| Product rating summary | 14px |
| Storefront CTA | Inter 700, `.76rem`, tracking `.08em` |
| Admin page heading | 48px, tracking -2px; 38px at ≤760px, 34px at ≤700px |
| Admin section heading | 24px |
| Admin form label | 14px, weight 600 |
| Admin table text / headers | 14px |
| Customer account main heading | Archivo Black, `clamp(3rem, 7vw, 6.5rem)`, line-height `.88` |

Many storefront labels are intentionally small in the current implementation. These sizes describe the existing design, not an accessibility redesign. Do not silently change them when reproducing a screenshot.

## 5. Layout and spacing

### Storefront

- Announcement strip: 34px high, centered text, acid background.
- Navigation: 82px high, sticky at the top, horizontal padding 4vw, subtle bottom border.
- Hero: `calc(100vh - 116px)`, minimum 620px on desktop. Photo fills the section with `object-fit: cover`.
- Hero overlay: left-to-right black gradient, approximately 62% opacity at the left, 10% near 60%, 20% at the right.
- Hero copy: 6vw from the left, 11% above the bottom.
- Shop sections: 110px vertical padding, 4vw horizontal padding.
- Section heading row: heading left, category filters right, 42px bottom spacing.
- Product grid: four columns, 18px gap. Image ratio 4:5.
- About: centered, max-width 1000px, 130px vertical padding; text max-width 620px.
- Footer: black, 55px vertical padding, 4vw horizontal padding, horizontal groups on large screens.

### Admin

- Header: 24px vertical padding and 4vw horizontal padding.
- Horizontal navigation below header: 16px / 4vw padding, 8px gaps, wraps as needed.
- Main content: max-width 1500px, centered, 48px / 4vw padding.
- White panels: 24px padding, 1px border, 8px corner radius.
- Field grids: two columns, 20px gaps.
- Inputs: 12px padding, 4px radius, label-to-input spacing 8px.
- Buttons: 12px / 18px padding, 5px radius.
- Product action buttons: 14px text, 9px / 12px padding.
- Order dialog: width `min(680px, 94vw)`, max-height 92vh, 32px padding, 10px radius.
- Product editor: width `min(960px, 96vw)`.

## 6. Storefront screens

### Home / Shop

Order of content:

1. Active announcement bar.
2. Sticky navigation: store identity, Shop, New Drop, Our Story, account access, bag with quantity badge.
3. Hero: desktop photo, optional mobile photo, subheading, large title, CTA.
4. Scheduled banners positioned after the hero.
5. Main shop: editable heading, category filters, product grid.
6. Scheduled banners positioned after the shop.
7. Enabled product sections: Featured Products, New Arrivals, Best Sellers, Featured Collection, in configured order. Empty sections are omitted.
8. About section.
9. Footer with store name, editable footer text, admin link, social links, and contact information when provided.

The older static marquee and white-hoodie feature block are no longer rendered in version 4, even though their CSS remains. Do not recreate them unless present in a supplied reference screenshot.

Each product card contains a large photograph, optional acid badge, name, price, optional struck-through previous price, availability, and review summary. Desktop hover reveals a white Quick View button and enlarges the image slightly. Cards remain directly clickable on mobile.

### Product modal

Desktop: centered white two-column modal, inset 5vh / 6vw, max-height 90vh. Left: product image with small thumbnail gallery along its lower edge. Right: product title, price, description, color choices, size choices, purchase control, availability details, review list, and review form. Close control sits at the upper right.

Required visual states: normal price, sale price, variant price, low stock, out of stock, pre-order, coming soon, unavailable, selected options, empty reviews, populated reviews, and review sign-in requirement.

The existing modal includes a heart button and Size Guide text control, but neither has a complete implemented workflow. Do not present invented wishlist or sizing screens as existing functionality.

### Shopping bag

Right-side drawer, width `min(460px, 100%)`, full viewport height. Dark backdrop behind it. Header shows Your Bag, quantity, and close control. Rows show image, product name, color, size, quantity buttons, price, and Remove. Footer shows subtotal and Checkout. Include the empty-bag state.

### Checkout

White modal with a delivery form and gray order-summary column. Delivery fields: full name, phone, email, address, city/municipality, postal code. Show only enabled payment methods. Shipping contributes to the displayed order total. Main CTA: Place Order with total.

Account sign-in is required before checkout. The existing site uses its hosted sign-in flow; an email/password or Google OAuth form is not an existing screen in this version.

### Confirmation

Centered white panel, width up to 500px, acid circular checkmark, Thank You heading, order reference, View My Orders, and Continue Shopping.

### Customer account

Sticky light header with brand, Shop, and Sign Out. Content width `min(1120px, 90vw)`. Large My Orders title. Three summary cells: All orders, In progress, Delivered. Each order card contains reference, date, total, status, item details, payment information, tracking, and final total. Include the no-orders state.

## 7. Admin screens

The default admin tab is **Products**. Tabs: Products, Inventory, Website Content, Settings → Store, Orders. Keep the black brand header and View storefront link on every admin screen.

### Products → All Products

Title and brief description, Create product and Refresh actions, search field, status filter, and product table.

Table columns: Product, Price, Stock, Status, Actions. Product cell has a 55×65px image, name, SKU, and category. Actions: Edit, View, Duplicate, Publish/Unpublish, Archive/Restore. Draft or hidden product View opens the editor for inspection rather than a public product page.

### Product editor

Scrollable dialog with Close and Save Changes. Include name, SKU, category, collection, regular/sale/compare-at prices, low-stock threshold, availability, publication status, release date, tags, description, pre-order/featured/new-arrival/best-seller checkboxes, images, upload control, variant rows, and SEO title/description.

Variants contain color, size, optional price override, and stock readout. Stock changes happen in Inventory. New products/variants start at zero stock. Duplicate products become drafts with zero stock. Existing variant identities are retained for order history.

### Inventory

Product dropdown, variant dropdown showing quantity, action selector (add/remove/set), quantity, required reason, and Record adjustment. Below: history table with date/actor, product/variant, change, resulting stock, and reason. Include Load older entries when available.

### Website Content

Accordion sections:

- Hero: desktop/mobile image URLs, image previews, replacement uploads, Remove image, heading, subheading, CTA label/destination, enabled checkbox.
- Announcement Bar: text, optional link, start/end UTC dates, active checkbox.
- Promotional Banners: add/delete cards; image, title, subtitle, CTA text/URL, schedule, active status, display position.
- Homepage Product Sections: main shop heading, featured collection name, section titles, enabled checkboxes, Move up actions.
- About & Footer: about heading/body and footer text.

Use a full-width Save / Publish action. This version has one hero, not a multi-slide carousel.

### Settings → Store

Store name, currency, logo/favicon URLs and previews, image upload controls, contact email/phone/address, Instagram/Facebook/TikTok links, default shipping fee, free-shipping threshold, enabled payment methods, and pre-order setting. End with Save Changes.

### Orders

Four statistic cards: Total orders, Awaiting confirmation, Active pre-orders, Paid order value. The second card uses acid green. Below: search, status and order-type filters, and order table. Manage opens a dialog with customer/address, items, immutable order total, payment method, fulfillment/payment status selectors, tracking, internal notes, and Save changes.

Fulfillment statuses: Pending, Confirmed, Preparing, Shipped, Delivered, Cancelled. Payment statuses: Unpaid, Paid, Refunded.

## 8. Responsive behavior

| Breakpoint | Existing behavior |
|---|---|
| Storefront ≤900px | Hide desktop navigation; show menu icon; two product columns; stack product/checkout modal; hide checkout summary column; stack footer |
| Storefront ≤640px | Stack promotional image and text; reduce banner image height to 240px |
| Storefront ≤560px | 70px navigation; 18px page gutters; 75px shop section padding; 8px product gap; hide Quick View; stack delivery fields |
| Admin ≤760px | 18px main gutters; two statistic columns; wrapped filter toolbar; smaller dialogs |
| Admin ≤700px | Single-column form grids; stacked heading/actions; wrapped variants; reduced panel padding |
| Account ≤760px | Stack summary cells and order body; two-column order header; payment/tracking panel above items |
| Account ≤480px | Single-column order header; hide Shop header link |

Suggested prototype frames: 1440px-wide desktop and 390px-wide mobile. These are convenient review sizes, not fixed dimensions encoded in the site.

## 9. Interaction and motion

- Product photo hover: scale 1.035, 500ms.
- Quick View reveal: 250ms.
- Navigation underline: 250ms.
- Bag drawer entrance: 350ms horizontal slide.
- Modal entrance: opacity and 18px vertical translation, 250ms.
- Toast: acid background, centered near bottom, 300ms entrance; message disappears after approximately 2.2 seconds.
- Disabled purchasing: dimmed button and explicit availability label.
- Saving errors: preserve entered values and display a readable message.
- Closing overlays returns to the underlying screen.

The current mobile menu icon displays a brief navigation message rather than a complete menu drawer. Do not invent a navigation drawer and call it an exact copy.

## 10. Prototype flows

Customer: Home → Product modal → select color/size → Bag → sign-in gate if needed → Checkout → Confirmation → My Orders.

Admin catalog: Products → Create/Edit → Save → refreshed table → View storefront.

Admin inventory: Inventory → choose variant → add/remove/set quantity → enter reason → record → updated stock and history.

Admin content: Website Content → open section → edit → Save / Publish → updated storefront state.

Admin orders: Orders → Manage → change status/tracking → Save → updated order state. Cancelling an unfulfilled order restores deducted stock once.

Simulate these changes with prototype states and clearly fictional sample customer data. A design prototype does not itself execute real transactions or authenticate customers.

## 11. Content and assets

Use the actual store logo when configured and the original product photography. Keep images as separate reusable assets. Existing source assets include:

| Reference | Local asset path |
|---|---|
| Black hoodie | `public/assets/813467454_122111863479453901_9205533144431282496_n.jpg` |
| Grey hoodie / initial hero | `public/assets/812729583_122111865975453901_4839055977738557781_n.jpg` |
| White hoodie | `public/assets/814507619_122111805783453901_6395947149336779668_n.jpg` |
| Signature tee | `public/assets/813583096_122111859471453901_4172575825523174736_n.jpg` |
| White tee | `public/assets/813546525_122111864307453901_6626734464249187009_n.jpg` |
| Black tee | `public/assets/813386481_122111805843453901_3578364694834511613_n.jpg` |

These are source references, not attachments embedded in this Markdown. Supply their image files or current screenshots to Stitch separately. Current database image references may supersede these initial assets.

## 12. Implementation boundary

The published version uses HTML/CSS/JavaScript, a Worker backend, and D1 persistence. It is not currently a React/Next.js application connected to MongoDB Atlas. Cloudinary upload handling exists but requires credentials; existing image URLs are supported. Storefront tabs check for updates every five seconds, with same-browser notifications for admin edits.

These details explain the existing behavior; do not turn them into customer-facing marketing content. Do not label MongoDB or Cloudinary as connected in a prototype intended to represent the current deployment.

## 13. Instruction for Stitch

Recreate Medicinal Lifestyle faithfully using this design reference and the attached screen captures. Preserve the original branding, colors, typography, layouts, product photography, modal and drawer structures, and admin horizontal navigation. Create separate editable screens for the storefront, product details, shopping bag, checkout, confirmation, customer orders, admin products, product editor, inventory, website content, settings, orders, and order management dialog. Connect their existing flows using prototype interactions and fictional sample data. Match each screenshot before proceeding to the next screen. Do not redesign, invent working backend connections, or add screens absent from the reference. Include desktop and mobile adaptations following the documented breakpoints.
