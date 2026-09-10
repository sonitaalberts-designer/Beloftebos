PRAGMA foreign_keys=ON;
--> statement-breakpoint
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE rooms (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE room_images (id TEXT PRIMARY KEY, room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE amenities (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE bookings (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id), guest_id TEXT NOT NULL REFERENCES guests(id), checkin TEXT NOT NULL, checkout TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('ENQUIRY','PENDING','CONFIRMED','PAID','CHECKED-IN','CHECKED-OUT','CANCELLED','NO-SHOW')), source TEXT NOT NULL CHECK(source IN ('DIRECT','LEKKESLAAP','BOOKING.COM','ADMIN','OTHER')), idempotency_key TEXT UNIQUE, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, CHECK (checkout > checkin));
--> statement-breakpoint
CREATE TABLE booking_guests (id TEXT PRIMARY KEY, booking_id TEXT REFERENCES bookings(id), guest_id TEXT REFERENCES guests(id),data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE booking_sources (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE availability_blocks (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id), checkin TEXT NOT NULL, checkout TEXT NOT NULL, source TEXT NOT NULL, external_uid TEXT, integration_id TEXT REFERENCES integration_settings(id), data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, CHECK(checkout>checkin));
--> statement-breakpoint
CREATE TABLE functions (id TEXT PRIMARY KEY, checkin TEXT, checkout TEXT, status TEXT,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE function_enquiries (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE guests (id TEXT PRIMARY KEY, email TEXT,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE blog_posts (id TEXT PRIMARY KEY, slug TEXT UNIQUE,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE blog_categories (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE gallery_images (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE testimonials (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE faqs (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE website_settings (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE seo_metadata (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE integration_settings (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE audit_logs (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), token_hash TEXT UNIQUE, expires_at TEXT,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE reset_tokens (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), token_hash TEXT UNIQUE, expires_at TEXT,data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE rate_limits (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE email_outbox (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE contact_enquiries (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE menu_items (id TEXT PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX bookings_dates ON bookings(room_id,checkin,checkout,status);
--> statement-breakpoint
CREATE INDEX blocks_dates ON availability_blocks(room_id,checkin,checkout);
--> statement-breakpoint
CREATE INDEX guest_email ON guests(email);
--> statement-breakpoint
CREATE TRIGGER booking_conflict_insert BEFORE INSERT ON bookings WHEN NEW.status IN ('PENDING','CONFIRMED','PAID','CHECKED-IN') BEGIN
 SELECT RAISE(ABORT,'booking conflict') WHERE EXISTS(SELECT 1 FROM bookings b WHERE b.id<>NEW.id AND b.room_id=NEW.room_id AND b.status IN ('PENDING','CONFIRMED','PAID','CHECKED-IN') AND b.checkin<NEW.checkout AND b.checkout>NEW.checkin);
 SELECT RAISE(ABORT,'blocked date conflict') WHERE EXISTS(SELECT 1 FROM availability_blocks b WHERE b.room_id=NEW.room_id AND b.checkin<NEW.checkout AND b.checkout>NEW.checkin);
 END;
--> statement-breakpoint
CREATE TRIGGER block_conflict_insert BEFORE INSERT ON availability_blocks BEGIN
 SELECT RAISE(ABORT,'booking conflict') WHERE EXISTS(SELECT 1 FROM bookings b WHERE b.room_id=NEW.room_id AND b.status IN ('PENDING','CONFIRMED','PAID','CHECKED-IN') AND b.checkin<NEW.checkout AND b.checkout>NEW.checkin);
 END;
--> statement-breakpoint
CREATE TRIGGER booking_conflict_update BEFORE UPDATE ON bookings WHEN NEW.status IN ('PENDING','CONFIRMED','PAID','CHECKED-IN') BEGIN
 SELECT RAISE(ABORT,'booking conflict') WHERE EXISTS(SELECT 1 FROM bookings b WHERE b.id<>NEW.id AND b.room_id=NEW.room_id AND b.status IN ('PENDING','CONFIRMED','PAID','CHECKED-IN') AND b.checkin<NEW.checkout AND b.checkout>NEW.checkin);
 SELECT RAISE(ABORT,'blocked date conflict') WHERE EXISTS(SELECT 1 FROM availability_blocks b WHERE b.room_id=NEW.room_id AND b.checkin<NEW.checkout AND b.checkout>NEW.checkin);
 END;
--> statement-breakpoint
CREATE TRIGGER block_conflict_update BEFORE UPDATE ON availability_blocks BEGIN
 SELECT RAISE(ABORT,'booking conflict') WHERE EXISTS(SELECT 1 FROM bookings b WHERE b.room_id=NEW.room_id AND b.status IN ('PENDING','CONFIRMED','PAID','CHECKED-IN') AND b.checkin<NEW.checkout AND b.checkout>NEW.checkin);
 END;
