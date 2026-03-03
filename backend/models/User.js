// User helpers using Supabase — replaces Mongoose model
const supabase = require("../config/db");

const User = {
    findByEmail: async (email) => {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
        if (error && error.code !== "PGRST116") throw error;
        return data;
    },

    findById: async (id) => {
        const { data, error } = await supabase
            .from("users")
            .select("id, name, email, created_at")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    create: async ({ name, email, password }) => {
        const { data, error } = await supabase
            .from("users")
            .insert([{ name, email, password }])
            .select("id, name, email, created_at")
            .single();
        if (error) throw error;
        return data;
    },
};

module.exports = User;
