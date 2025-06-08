// Supabase Configuration
const supabaseUrl = 'https://nxiapowjelkojmhfkvpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWFwb3dqZWxrb2ptaGZrdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjg4MjAsImV4cCI6MjA2NDkwNDgyMH0.FXwcIBgxzV9OfHt5PLN2O9swVxKae6yjQYYlJx_yrKs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Initialize Supabase
const supabaseUrl = 'https://nxiapowjelkojmhfkvpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWFwb3dqZWxrb2ptaGZrdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjg4MjAsImV4cCI6MjA2NDkwNDgyMH0.FXwcIBgxzV9OfHt5PLN2O9swVxKae6yjQYYlJx_yrKs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Initial Data
const validPasswords = ['RgT2025EnSl', 'A3$dF', 'zX#7k', 'm9@Lp', 'Q2!vB', 'nT6$e', 'G#1yW', 'o9Z@c', 'Hx3!M', 'b$E2t', 'J7q#R', 'V!4sN', 'k@W5d', 'U#v9g', 'yL6$B', 'p!T3z', 'D@r1K', 's#8oM', 'Zx2$h', 'D!c7M', 'Lw@5j', 'C#o3e', 't7!NZ', 'M2$dV', 'aP#9f', 'B!q6y', 'hX@4G', 'N#1zw', 'j6$LT', 'R!v2c', 'e@M7b', 'i#o5Q', 'O3$Nd', 'f!C9x', 'K@y8W', 'xZ#1p', 'E4!uv', 'g@Rw2', 'T#6ay', 'q!9BC', 'W@z5m', 'Y#7Lo', 'd!K8r', 'vP@2x', 'S#o4j'];
let currentUser = null;
let currentYear = '2025';

// Load Data from Supabase
async function loadSavedData() {
    // Load topics
    const { data: topicsData } = await supabase
        .from('topics')
        .select('*');
    
    // Load committees
    const { data: committeesData } = await supabase
        .from('committees')
        .select('*');
    
    // Load discussants
    const { data: discussantsData } = await supabase
        .from('discussants')
        .select('*');
    
    // Update UI
    renderTopics();
    renderCommittees();
}

// Save Data to Supabase
async function saveData(table, data) {
    const { error } = await supabase
        .from(table)
        .upsert(data);
    
    if (error) {
        console.error('Error saving to Supabase:', error);
    }
}

// Example: Adding a new topic
async function submitTopicForm(e) {
    e.preventDefault();
    
    const newTopic = {
        supervisor: supervisorInput.value.trim(),
        title: topicTitleInput.value.trim(),
        profile: topicProfileSelect.value,
        status: 'pending',
        addedBy: currentUser,
        year: currentYear,
        timestamp: new Date().toISOString()
    };
    
    await saveData('topics', [newTopic]);
    topicModal.classList.add('hidden');
    renderTopics();
}

// Rest of your existing JS logic (same as before)
// ... (Copy-paste from Glitch version) ...
