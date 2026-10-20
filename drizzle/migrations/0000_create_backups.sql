CREATE TABLE public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  format_version integer NOT NULL DEFAULT 1,
  device_label text,
  record_count integer NOT NULL DEFAULT 0 CHECK (record_count >= 0),
  category_count integer NOT NULL DEFAULT 0 CHECK (category_count >= 0),
  purse_count integer NOT NULL DEFAULT 0 CHECK (purse_count >= 0),
  currency text NOT NULL DEFAULT 'HUF',
  payload jsonb NOT NULL CHECK (pg_column_size(payload) < 5242880),
  size_bytes integer NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
  CHECK (device_label IS NULL OR char_length(device_label) <= 60)
);

GRANT SELECT, INSERT, DELETE ON public.backups TO authenticated;
GRANT ALL ON public.backups TO service_role;

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own backups" ON public.backups FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members add own backups" ON public.backups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members delete own backups" ON public.backups FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX backups_user_created_idx ON public.backups (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.trim_user_backups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.backups
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.backups
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC, id DESC
      LIMIT 10
    );
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trim_user_backups() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER backups_keep_latest_10
AFTER INSERT ON public.backups
FOR EACH ROW EXECUTE FUNCTION public.trim_user_backups();