import { pool } from './db';
import dotenv from 'dotenv';

dotenv.config();

const MOCK_STREAMS = [
  {
    title: 'Grand Finals - Team A vs Team B',
    description: 'The ultimate showdown.',
    streamer_name: 'OfficialLeague',
    thumbnail_url: 'https://via.placeholder.com/320x180.png?text=Grand+Finals',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    game: 'League of Legends'
  },
  {
    title: 'Casual Friday Stream',
    description: 'Just chilling with viewers.',
    streamer_name: 'CoolGamer123',
    thumbnail_url: 'https://via.placeholder.com/320x180.png?text=Casual+Friday',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    game: 'Valorant'
  },
  {
    title: 'Speedrun Any% WR Attempt',
    description: 'Trying to beat the record.',
    streamer_name: 'SpeedyBoi',
    thumbnail_url: 'https://via.placeholder.com/320x180.png?text=Speedrun',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    game: 'Super Mario 64'
  }
];

const ingest = async () => {
  console.log('[WORKER] Starting mock ingestion...');

  try {
    const randomStream = MOCK_STREAMS[Math.floor(Math.random() * MOCK_STREAMS.length)];
    const isLive = Math.random() > 0.5;
    const views = Math.floor(Math.random() * 10000);

    const check = await pool.query('SELECT * FROM streams WHERE title = $1', [randomStream.title]);

    if (check.rows.length > 0) {
      await pool.query(
        'UPDATE streams SET is_live = $1, views = $2, updated_at = NOW() WHERE id = $3',
        [isLive, views, check.rows[0].id]
      );
      console.log(`[WORKER] Updated stream "${randomStream.title}" (Live: ${isLive})`);
    } else {
      await pool.query(
        'INSERT INTO streams (title, description, streamer_name, thumbnail_url, video_url, game, is_live, views, started_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
        [randomStream.title, randomStream.description, randomStream.streamer_name, randomStream.thumbnail_url, randomStream.video_url, randomStream.game, isLive, views]
      );
      console.log(`[WORKER] Created stream "${randomStream.title}"`);
    }

    if (Math.random() > 0.7) {
        const sRes = await pool.query('SELECT id, title FROM streams ORDER BY random() LIMIT 1');
        if (sRes.rows.length > 0) {
            const stream = sRes.rows[0];
            await pool.query(
                'INSERT INTO highlights (stream_id, title, description, thumbnail_url, video_url, views, likes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [stream.id, `Best Moment of ${stream.title}`, 'Insane play!', 'https://via.placeholder.com/320x180.png?text=Highlight', 'https://www.youtube.com/embed/dQw4w9WgXcQ', Math.floor(Math.random() * 5000), Math.floor(Math.random() * 500)]
            );
            console.log(`[WORKER] Added highlight for "${stream.title}"`);
        }
    }

  } catch (error) {
    console.error('[WORKER] Error:', error);
  }
};

setInterval(ingest, 10000);
ingest();

console.log('[WORKER] Ingestion service started.');
