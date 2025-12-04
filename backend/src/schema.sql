
-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  telegram_verified BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 0,
  tickets INT DEFAULT 0,
  last_daily_login_at TIMESTAMP,
  last_fortune_spin_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Verification
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP
);

-- Telegram Link
CREATE TABLE IF NOT EXISTS telegram_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  telegram_user_id VARCHAR(255) UNIQUE,
  telegram_username VARCHAR(255),
  link_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  linked_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streams
CREATE TABLE IF NOT EXISTS streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  streamer_name VARCHAR(255) NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  game VARCHAR(255),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  is_live BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Highlights
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  timestamp_in_stream INT,
  thumbnail_url TEXT,
  video_url TEXT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  game VARCHAR(255),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  prize_pool NUMERIC,
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, finished
  banner_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Offers
CREATE TABLE IF NOT EXISTS ticket_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  price_points INT,
  price_tickets INT,
  quantity_available INT, -- NULL = unlimited
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code Rewards (Redeemable codes like "WELCOME100")
CREATE TABLE IF NOT EXISTS code_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  points_reward INT DEFAULT 0,
  tickets_reward INT DEFAULT 0,
  max_uses_per_user INT DEFAULT 1,
  global_max_uses INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Code Redemptions
CREATE TABLE IF NOT EXISTS user_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code_reward_id UUID REFERENCES code_rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Items
CREATE TABLE IF NOT EXISTS market_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price_points INT NOT NULL,
  stock_quantity INT, -- NULL = unlimited
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Item Grants (The actual digital codes to give)
CREATE TABLE IF NOT EXISTS market_item_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_item_id UUID REFERENCES market_items(id) ON DELETE CASCADE,
  code VARCHAR(255) NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Market Purchases
CREATE TABLE IF NOT EXISTS user_market_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_item_id UUID REFERENCES market_items(id) ON DELETE SET NULL,
  market_item_grant_id UUID REFERENCES market_item_grants(id) ON DELETE SET NULL,
  points_spent INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fortune Prize Tiers
CREATE TABLE IF NOT EXISTS fortune_prize_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  points_reward INT NOT NULL,
  weight INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fortune Spins
CREATE TABLE IF NOT EXISTS fortune_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prize_tier_id UUID REFERENCES fortune_prize_tiers(id) ON DELETE SET NULL,
  points_awarded INT NOT NULL,
  spun_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
