CREATE TABLE `customers` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_idx` ON `customers` (`email`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`customer_user_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`rating` integer NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_product_customer_idx` ON `reviews` (`product_id`,`customer_user_id`);--> statement-breakpoint
CREATE INDEX `reviews_product_created_idx` ON `reviews` (`product_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_user_id` text;--> statement-breakpoint
CREATE INDEX `orders_customer_created_idx` ON `orders` (`customer_user_id`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
