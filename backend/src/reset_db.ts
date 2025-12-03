import { pool } from './db';

const reset = async () => {
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('Database reset successfully.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

reset();
