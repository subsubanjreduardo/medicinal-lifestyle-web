CREATE TABLE `inventory_log` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`variant` text NOT NULL,
	`delta` integer NOT NULL,
	`stock` integer NOT NULL,
	`reason` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inventory_created_idx` ON `inventory_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `shop` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`token` text DEFAULT '' NOT NULL
);
