-- Safe, additive support for hidden demo claim testing.
-- Demo listings remain directly accessible for QA but are excluded from public discovery.

ALTER TABLE dentists
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS membership_tier TEXT NOT NULL DEFAULT 'BASIC';

UPDATE dentists
SET membership_tier = 'PROFESSIONAL'
WHERE is_premium = TRUE
  AND membership_tier = 'BASIC';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'dentists'::regclass
      AND conname = 'dentists_membership_tier_check'
  ) THEN
    ALTER TABLE dentists
      ADD CONSTRAINT dentists_membership_tier_check
      CHECK (membership_tier IN ('BASIC', 'PROFESSIONAL', 'PREMIUM_PLUS'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_dentists_public_visibility
  ON dentists (is_test, state_code, city);
CREATE INDEX IF NOT EXISTS idx_dentists_membership_tier
  ON dentists (membership_tier);

ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS dentist_id TEXT,
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dentistos_user_id UUID,
  ADD COLUMN IF NOT EXISTS dentistos_practice_id UUID,
  ADD COLUMN IF NOT EXISTS dentistos_linked_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'claims'::regclass
      AND conname = 'claims_dentist_id_fkey'
  ) THEN
    ALTER TABLE claims
      ADD CONSTRAINT claims_dentist_id_fkey
      FOREIGN KEY (dentist_id)
      REFERENCES dentists(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_claims_dentist_id ON claims(dentist_id);
CREATE INDEX IF NOT EXISTS idx_claims_dentistos_user_id ON claims(dentistos_user_id);
CREATE INDEX IF NOT EXISTS idx_claims_dentistos_practice_id ON claims(dentistos_practice_id);
CREATE INDEX IF NOT EXISTS idx_claims_is_test ON claims(is_test);

CREATE TABLE IF NOT EXISTS practices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  website     TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  zip_code    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_memberships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id  UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('OWNER', 'STAFF', 'ADMIN')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practice_id, user_id)
);

CREATE TABLE IF NOT EXISTS practice_listing_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id  UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  dentist_id   TEXT NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  claim_id     INTEGER REFERENCES claims(id) ON DELETE SET NULL,
  status       TEXT NOT NULL CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'UNLINKED')),
  verified_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practice_id, dentist_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_memberships_user_id
  ON practice_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_memberships_practice_id
  ON practice_memberships(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_listing_links_practice_id
  ON practice_listing_links(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_listing_links_dentist_id
  ON practice_listing_links(dentist_id);
CREATE INDEX IF NOT EXISTS idx_practice_listing_links_claim_id
  ON practice_listing_links(claim_id);
CREATE INDEX IF NOT EXISTS idx_practice_listing_links_status
  ON practice_listing_links(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_listing_links_active_dentist
  ON practice_listing_links(dentist_id)
  WHERE status IN ('PENDING', 'VERIFIED');

-- These tables are server-managed. Keep them inaccessible through the public Data API.
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_listing_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON practices, practice_memberships, practice_listing_links FROM anon, authenticated;
