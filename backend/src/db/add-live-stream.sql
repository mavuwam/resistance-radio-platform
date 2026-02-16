-- Add live stream URL for Resistance Radio Station
-- Stream URL: https://s6.citrus3.com/public/resistanceradiostation

-- First, deactivate any existing live broadcasts
UPDATE live_broadcasts SET is_active = false WHERE is_active = true;

-- Insert the new live stream configuration
INSERT INTO live_broadcasts (
  stream_url,
  is_active,
  started_at,
  listener_count
) VALUES (
  'https://s6.citrus3.com/public/resistanceradiostation',
  true,
  CURRENT_TIMESTAMP,
  0
)
ON CONFLICT DO NOTHING;

-- Verify the insertion
SELECT id, stream_url, is_active, started_at 
FROM live_broadcasts 
WHERE is_active = true;
