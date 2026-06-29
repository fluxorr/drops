CREATE TABLE `concept_relationships` (
	`concept_id` text NOT NULL,
	`prerequisite_id` text NOT NULL,
	`relationship` text DEFAULT 'depends_on' NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`concept_id`, `prerequisite_id`),
	FOREIGN KEY (`concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`prerequisite_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "concept_relationships_not_self_check" CHECK("concept_relationships"."concept_id" <> "concept_relationships"."prerequisite_id")
);
--> statement-breakpoint
CREATE INDEX `concept_relationships_prerequisite_idx` ON `concept_relationships` (`prerequisite_id`);--> statement-breakpoint
CREATE TABLE `concepts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`description` text,
	`knowledge_score` integer DEFAULT 0 NOT NULL,
	`confidence_score` integer DEFAULT 0 NOT NULL,
	`last_learned_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "concepts_knowledge_score_check" CHECK("concepts"."knowledge_score" between 0 and 100),
	CONSTRAINT "concepts_confidence_score_check" CHECK("concepts"."confidence_score" between 0 and 100)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concepts_user_normalized_name_unique` ON `concepts` (`user_id`,`normalized_name`);--> statement-breakpoint
CREATE INDEX `concepts_user_knowledge_idx` ON `concepts` (`user_id`,`knowledge_score`);--> statement-breakpoint
CREATE TABLE `interests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`weight` integer DEFAULT 70 NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`last_selected_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "interests_weight_check" CHECK("interests"."weight" between 0 and 100)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interests_user_normalized_name_unique` ON `interests` (`user_id`,`normalized_name`);--> statement-breakpoint
CREATE INDEX `interests_user_active_idx` ON `interests` (`user_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `lesson_concepts` (
	`lesson_id` text NOT NULL,
	`concept_id` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`score_delta` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`lesson_id`, `concept_id`),
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lesson_concepts_concept_idx` ON `lesson_concepts` (`concept_id`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`why_this_lesson` text NOT NULL,
	`content_markdown` text NOT NULL,
	`sources` text DEFAULT '[]' NOT NULL,
	`read_minutes` integer NOT NULL,
	`status` text DEFAULT 'unread' NOT NULL,
	`generator_model` text NOT NULL,
	`selection_reason` text NOT NULL,
	`generated_at` integer NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "lessons_read_minutes_check" CHECK("lessons"."read_minutes" between 1 and 30)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_user_slug_unique` ON `lessons` (`user_id`,`slug`);--> statement-breakpoint
CREATE INDEX `lessons_user_generated_idx` ON `lessons` (`user_id`,`generated_at`);--> statement-breakpoint
CREATE INDEX `lessons_user_status_idx` ON `lessons` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`learning_goal` text NOT NULL,
	`background` text,
	`onboarding_completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`user_agent` text,
	`expires_at` integer,
	`last_success_at` integer,
	`last_failure_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_user_idx` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`time_zone` text DEFAULT 'Asia/Kolkata' NOT NULL,
	`notification_time` text DEFAULT '08:00' NOT NULL,
	`lessons_per_day` integer DEFAULT 1 NOT NULL,
	`push_enabled` integer DEFAULT false NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`weekly_reflection_day` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "settings_lessons_per_day_check" CHECK("settings"."lessons_per_day" between 1 and 5),
	CONSTRAINT "settings_weekly_day_check" CHECK("settings"."weekly_reflection_day" between 0 and 6)
);
--> statement-breakpoint
CREATE TABLE `weekly_reflections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`week_started_at` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly_reflections_user_week_unique` ON `weekly_reflections` (`user_id`,`week_started_at`);