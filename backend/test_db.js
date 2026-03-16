require('dotenv').config();
const supabase = require('./config/db');

async function testInsert() {
    const testData = {
        user_id: 'test_user_' + Date.now(),
        raw_text: 'Test resume content',
        summary: 'Test summary',
        skills: ['testing'],
        experience_years: 5,
        primary_role: 'Tester',
        education: 'Test University',
        key_projects: ['Test Project']
    };

    console.log("Attempting insert into 'resumes' table...");
    const { data, error } = await supabase.from('resumes').insert(testData).select();

    if (error) {
        console.error("INSERT FAILED:");
        console.error(error);
        if (error.code === '42P01') {
            console.error("HINT: The 'resumes' table might not exist.");
        }
    } else {
        console.log("INSERT SUCCESS:");
        console.log(data);
        
        // Clean up
        await supabase.from('resumes').delete().eq('id', data[0].id);
        console.log("CLEANUP SUCCESS");
    }
}

testInsert();
