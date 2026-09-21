CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`customer` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text DEFAULT 'Unpaid' NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`preorder` integer NOT NULL,
	`tracking` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE INDEX `orders_created_at_idx` ON `orders` (`created_at`);