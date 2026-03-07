const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('gupta@206654', 'gupta%40206654')
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB");

        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log("Created table chat_sessions");

        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='chatbot_messages' AND column_name='session_id';
        `);

        if (res.rows.length === 0) {
            await client.query(`
                ALTER TABLE chatbot_messages 
                ADD COLUMN session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;
            `);
            console.log("Added session_id to chatbot_messages");
        } else {
            console.log("session_id already exists on chatbot_messages");
        }

        // Auto-migrate orphaned messages into a "Legacy Chat" session per user
        // Find users with orphaned messages
        const orphans = await client.query(`
            SELECT user_id FROM chatbot_messages WHERE session_id IS NULL GROUP BY user_id
        `);

        for (const row of orphans.rows) {
            const uid = row.user_id;
            // Create a legacy session
            const ins = await client.query(`
                INSERT INTO chat_sessions (user_id, title) VALUES ($1, 'Legacy Chat') RETURNING id
            `, [uid]);
            const sid = ins.rows[0].id;
            // Update orphaned messages
            await client.query(`
                UPDATE chatbot_messages SET session_id = $1 WHERE user_id = $2 AND session_id IS NULL
            `, [sid, uid]);
            console.log("Migrated orphaned msgs for user", uid, "to session", sid);
        }

        console.log("Done");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
