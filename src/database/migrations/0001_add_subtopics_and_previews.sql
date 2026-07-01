ALTER TABLE interests ADD COLUMN subtopics text;

CREATE TABLE topic_previews (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  topic_name text NOT NULL,
  preview_data text NOT NULL,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);

CREATE UNIQUE INDEX topic_previews_user_topic_unique ON topic_previews(user_id, topic_name);
