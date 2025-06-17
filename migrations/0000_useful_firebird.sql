CREATE TABLE "mining_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" text NOT NULL,
	"pool_url" text NOT NULL,
	"worker_name" text NOT NULL,
	"chain" text DEFAULT 'etc' NOT NULL,
	"intensity" integer DEFAULT 7 NOT NULL,
	"thread_count" integer DEFAULT 4 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mining_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_id" integer,
	"hashrate" real DEFAULT 0 NOT NULL,
	"shares_accepted" integer DEFAULT 0 NOT NULL,
	"shares_rejected" integer DEFAULT 0 NOT NULL,
	"earnings" real DEFAULT 0 NOT NULL,
	"uptime" integer DEFAULT 0 NOT NULL,
	"temperature" real DEFAULT 0 NOT NULL,
	"power_consumption" real DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pool_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_id" integer,
	"pool_url" text NOT NULL,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"latency" real DEFAULT 0 NOT NULL,
	"difficulty" text,
	"block_height" integer,
	"last_connected" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "mining_stats" ADD CONSTRAINT "mining_stats_config_id_mining_configurations_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."mining_configurations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_connections" ADD CONSTRAINT "pool_connections_config_id_mining_configurations_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."mining_configurations"("id") ON DELETE no action ON UPDATE no action;