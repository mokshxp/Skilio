require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SAMPLE_SHEETS = [
    {
        title: "Arrays & Hashing Masterclass",
        slug: "arrays-hashing-dsa",
        description: "Core patterns for solving 80% of array-based interview questions.",
        category: "dsa",
        subcategory: "arrays",
        difficulty: "beginner",
        estimated_read_time: 12,
        is_premium: false,
        tags: ["DSA", "Arrays", "Hash Maps"],
        content: {
            sections: [
                {
                    title: "The Two-Sum Pattern",
                    text: "The Two-Sum problem is the foundation of many hashing techniques. Instead of O(n²) nested loops, we use a hash map to achieve O(n) time complexity.",
                    code: {
                        language: "python",
                        snippet: "def twoSum(nums, target):\n    prevMap = {} # val : index\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i"
                    }
                },
                {
                    title: "Common Pitfalls",
                    text: "1. Not handling negative numbers properly if using certain optimizations.\n2. Forgetting that hash map operations are 'average' O(1), not 'worst-case' O(1)."
                }
            ]
        }
    },
    {
        title: "System Design: Scaling from 0 to 1M Users",
        slug: "system-design-scaling",
        description: "A step-by-step roadmap for growing a single server into a global distributed system.",
        category: "system-design",
        subcategory: "scaling",
        difficulty: "intermediate",
        estimated_read_time: 25,
        is_premium: true,
        tags: ["System Design", "Architecture", "Scaling"],
        content: {
            sections: [
                {
                    title: "Stage 1: The Load Balancer",
                    text: "When a single server can no longer handle traffic, we introduce a Load Balancer (LB) to distribute requests across multiple app servers."
                },
                {
                    title: "Database Scaling: Vertical vs Horizontal",
                    text: "Vertical scaling (adding more RAM/CPU) has limits. Sharding (Horizontal scaling) involves splitting data across multiple database instances."
                }
            ]
        }
    },
    {
        title: "Core CS: Operating Systems Mid-Level Prep",
        slug: "core-cs-os",
        description: "Process vs Threads, Deadlocks, and Memory Management explained simply.",
        category: "core-cs",
        subcategory: "os",
        difficulty: "intermediate",
        estimated_read_time: 15,
        is_premium: true,
        tags: ["CS Core", "OS", "Memory"],
        content: {
            sections: [
                {
                    title: "Process vs Thread",
                    text: "A process is a program in execution with its own memory space. A thread is the smallest unit of execution within a process, sharing memory with other threads in the same process."
                }
            ]
        }
    }
];

async function seed() {
    console.log("🌱 Seeding Interview Sheets...");
    
    for (const sheet of SAMPLE_SHEETS) {
        const { data, error } = await supabase
            .from('interview_sheets')
            .upsert(sheet, { onConflict: 'slug' })
            .select('id, title');
            
        if (error) {
            console.error(`❌ Failed to seed ${sheet.title}:`, error.message);
        } else {
            console.log(`✅ Seeded: ${data[0].title}`);
        }
    }
    
    console.log("✨ Seeding complete!");
}

seed().catch(console.error);
