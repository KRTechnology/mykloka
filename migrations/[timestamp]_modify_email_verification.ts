import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export async function up(db: any) {
  // Drop the existing foreign key
  await db.sql`
    ALTER TABLE email_verification_tokens 
    DROP CONSTRAINT IF EXISTS email_verification_tokens_user_id_fkey;
  `;

  // Add the new foreign key with cascade delete
  await db.sql`
    ALTER TABLE email_verification_tokens 
    ADD CONSTRAINT email_verification_tokens_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;
  `;
}

export async function down(db: any) {
  // Revert to original foreign key without cascade
  await db.sql`
    ALTER TABLE email_verification_tokens 
    DROP CONSTRAINT IF EXISTS email_verification_tokens_user_id_fkey;
  `;

  await db.sql`
    ALTER TABLE email_verification_tokens 
    ADD CONSTRAINT email_verification_tokens_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id);
  `;
} 