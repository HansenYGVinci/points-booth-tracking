import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT = 3000 } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
}

// Service role bypasses RLS — this key must never reach the browser.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Admin IDs live server-side only; the client bundle never sees them.
const ADMIN_ROLES = {
    '59322370': { type: 'super', name: 'Super Admin' },
    '88880001': { type: 'booth1', name: 'Booth 1 Admin' },
    '88880002': { type: 'booth2', name: 'Booth 2 Admin' },
    '88880003': { type: 'booth3', name: 'Booth 3 Admin' },
    '88889999': { type: 'super', name: 'Super Admin' }
};

const BOOTH_FIELDS = ['booth_1', 'booth_2', 'booth_3'];
const isValidId = (id) => /^\d{8}$/.test(id);

const app = express();
app.use(express.json());

// Wrap async handlers so rejections reach the error middleware
const ah = (fn) => (req, res, next) => fn(req, res, next).catch(next);

async function getUser(id) {
    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

app.post('/api/login', ah(async (req, res) => {
    const id = String(req.body.id || '').trim();
    if (!isValidId(id)) {
        return res.status(400).json({ error: 'Please enter a valid 8-digit ID' });
    }

    // Admins don't need a user row
    const admin = ADMIN_ROLES[id];
    if (admin) {
        return res.json({ type: 'admin', adminType: admin.type, name: admin.name });
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({ error: 'Account not found. Please sign up first.' });
    }
    res.json({ type: 'user', user });
}));

app.post('/api/signup', ah(async (req, res) => {
    const id = String(req.body.id || '').trim();
    if (!isValidId(id)) {
        return res.status(400).json({ error: 'Please enter a valid 8-digit ID' });
    }
    if (ADMIN_ROLES[id]) {
        return res.status(409).json({ error: 'This ID is reserved. Please choose another.' });
    }

    const existing = await getUser(id);
    if (existing) {
        return res.status(409).json({ error: 'This ID is already registered. Please login.' });
    }

    const { data, error } = await supabase.from('users').insert({
        id,
        role: 'user',
        points_count: 0,
        booth_1: false,
        booth_2: false,
        booth_3: false
    }).select().single();
    if (error) throw error;

    res.status(201).json({ type: 'user', user: data });
}));

app.get('/api/users/:id', ah(async (req, res) => {
    const id = req.params.id;
    if (!isValidId(id)) {
        return res.status(400).json({ error: 'Please enter a valid 8-digit ID' });
    }
    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
}));

app.post('/api/users/:id/booth', ah(async (req, res) => {
    const id = req.params.id;
    const booth = req.body.booth;
    if (!isValidId(id)) {
        return res.status(400).json({ error: 'Please enter a valid 8-digit ID' });
    }
    if (!BOOTH_FIELDS.includes(booth)) {
        return res.status(400).json({ error: 'Invalid booth' });
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { data, error } = await supabase
        .from('users')
        .update({ [booth]: true })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;

    res.json(data);
}));

app.post('/api/users/:id/purchase', ah(async (req, res) => {
    const id = req.params.id;
    const points = parseInt(req.body.points, 10);
    if (!isValidId(id)) {
        return res.status(400).json({ error: 'Please enter a valid 8-digit ID' });
    }
    if (!Number.isInteger(points) || points <= 0) {
        return res.status(400).json({ error: 'Please enter a valid point amount' });
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (!(user.booth_1 && user.booth_2 && user.booth_3)) {
        return res.status(400).json({ error: 'User has not completed all 3 booths. Not eligible for purchases.' });
    }
    if (points > (user.points_count || 0)) {
        return res.status(400).json({ error: 'Insufficient points' });
    }

    const { data, error } = await supabase
        .from('users')
        .update({ points_count: user.points_count - points })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;

    res.json(data);
}));

// Serve the built frontend (same origin, so no CORS needed)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.use((req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

// JSON error responses for anything uncaught
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
