ALTER TABLE availability_blocks ADD COLUMN function_id TEXT REFERENCES functions(id);
--> statement-breakpoint
CREATE INDEX block_function ON availability_blocks(function_id);
