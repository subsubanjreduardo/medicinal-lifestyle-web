import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const customers = sqliteTable('customers', {
 userId:text('user_id').primaryKey(), email:text('email').notNull(), name:text('name').notNull().default(''), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull()
}, t=>[uniqueIndex('customers_email_idx').on(t.email)]);
export const orders = sqliteTable('orders', {
 id:text('id').primaryKey(), requestKey:text('request_key').notNull().unique(), customerUserId:text('customer_user_id'), customer:text('customer').notNull(), items:text('items').notNull(), total:integer('total').notNull(), paymentMethod:text('payment_method').notNull(), paymentStatus:text('payment_status').notNull().default('Unpaid'), status:text('status').notNull().default('Pending'), preorder:integer('preorder').notNull(), tracking:text('tracking').notNull().default(''), notes:text('notes').notNull().default(''), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull(), revision:integer('revision').notNull().default(0)
}, t=>[index('orders_created_at_idx').on(t.createdAt),index('orders_customer_created_idx').on(t.customerUserId,t.createdAt)]);
export const reviews = sqliteTable('reviews', {
 id:text('id').primaryKey(), productId:text('product_id').notNull(), customerUserId:text('customer_user_id').notNull(), customerName:text('customer_name').notNull(), rating:integer('rating').notNull(), title:text('title').notNull().default(''), body:text('body').notNull(), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull()
}, t=>[uniqueIndex('reviews_product_customer_idx').on(t.productId,t.customerUserId),index('reviews_product_created_idx').on(t.productId,t.createdAt)]);

export const shop = sqliteTable('shop', {id:text('id').primaryKey(), data:text('data').notNull(), revision:integer('revision').notNull().default(0), token:text('token').notNull().default('')});
export const inventoryLog = sqliteTable('inventory_log', {id:text('id').primaryKey(), productId:text('product_id').notNull(), variant:text('variant').notNull(), delta:integer('delta').notNull(), stock:integer('stock').notNull(), reason:text('reason').notNull(), actor:text('actor').notNull(), createdAt:text('created_at').notNull()},t=>[index('inventory_created_idx').on(t.createdAt)]);
