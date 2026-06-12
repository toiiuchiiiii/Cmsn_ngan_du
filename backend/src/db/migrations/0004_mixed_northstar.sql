ALTER TABLE "posts" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "posts" ADD COLUMN "guest_name" varchar(100);
ALTER TABLE "posts" ADD COLUMN "guest_email" varchar(255);
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN "guest_name" varchar(100);
ALTER TABLE "comments" ADD COLUMN "guest_email" varchar(255);
