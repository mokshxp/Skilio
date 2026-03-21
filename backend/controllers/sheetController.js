const supabase = require('../config/db');

/**
 * List all published interview sheets
 */
exports.listSheets = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = supabase
            .from('interview_sheets')
            .select(`
                id, title, slug, description, category, subcategory, 
                difficulty, is_premium, view_count, tags, 
                estimated_read_time, created_at, updated_at
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('[listSheets] Error:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get a single sheet by its slug
 */
exports.getSheetBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { data, error } = await supabase
            .from('interview_sheets')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Sheet not found' });
        }

        // Increment view count asynchronously
        try {
            await supabase.rpc('increment_sheet_view', { sheet_id: data.id });
        } catch (e) {
            // Silently ignore if RPC fails
        }

        res.json(data);
    } catch (err) {
        console.error('[getSheetBySlug] Error:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get user's progress on a specific sheet
 */
exports.getSheetProgress = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { sheetId } = req.params;

        const { data, error } = await supabase
            .from('user_sheet_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('sheet_id', sheetId)
            .maybeSingle();

        if (error) throw error;
        res.json(data || { is_bookmarked: false, is_completed: false, progress_percent: 0 });
    } catch (err) {
        console.error('[getSheetProgress] Error:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update user's progress/completion
 */
exports.updateProgress = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { sheetId } = req.params;
        const { progress_percent, is_completed } = req.body;

        const { data, error } = await supabase
            .from('user_sheet_progress')
            .upsert({
                user_id: userId,
                sheet_id: sheetId,
                progress_percent: progress_percent || 0,
                is_completed: is_completed || false,
                last_viewed_at: new Date().toISOString()
            }, { onConflict: 'user_id,sheet_id' })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('[updateProgress] Error:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Toggle bookmark for a sheet
 */
exports.toggleBookmark = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { sheetId } = req.params;
        const { bookmarked } = req.body;

        const { data, error } = await supabase
            .from('user_sheet_progress')
            .upsert({
                user_id: userId,
                sheet_id: sheetId,
                is_bookmarked: bookmarked
            }, { onConflict: 'user_id,sheet_id' })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('[toggleBookmark] Error:', err);
        res.status(500).json({ message: err.message });
    }
};
