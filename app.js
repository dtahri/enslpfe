// Initialize Supabase
const supabaseUrl = 'https://nxiapowjelkojmhfkvpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWFwb3dqZWxrb2ptaGZrdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjg4MjAsImV4cCI6MjA2NDkwNDgyMH0.FXwcIBgxzV9OfHt5PLN2O9swVxKae6yjQYYlJx_yrKs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const loginPage = document.getElementById('login-page');
const mainContent = document.getElementById('main-content');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const currentYearTitle = document.getElementById('current-year');
const yearNavButtons = document.querySelectorAll('.year-nav button');
const subpageButtons = document.querySelectorAll('.subpages-tabs button');
const topicsContent = document.getElementById('topics-content');
const committeeContent = document.getElementById('committee-content');
const newTopicBtn = document.getElementById('new-topic-btn');
const newCommitteeBtn = document.getElementById('new-committee-btn');
const downloadExcelBtn = document.getElementById('download-excel-btn');
const downloadCommitteeExcelBtn = document.getElementById('download-committee-excel-btn');
const manageDiscussantsBtn = document.getElementById('manage-discussants-btn');
const topicsList = document.getElementById('topics-list');
const committeeList = document.getElementById('committee-list');
const topicModal = document.getElementById('topic-modal');
const committeeModal = document.getElementById('committee-modal');
const discussantsModal = document.getElementById('discussants-modal');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const cancelCommitteeModalBtn = document.getElementById('cancel-committee-modal-btn');
const closeDiscussantsModalBtn = document.getElementById('close-discussants-modal-btn');
const topicForm = document.getElementById('topic-form');
const committeeForm = document.getElementById('committee-form');
const committeeTopicSelect = document.getElementById('committee-topic');
const firstDiscussantSelect = document.getElementById('first-discussant');
const secondDiscussantSelect = document.getElementById('second-discussant');
const discussantsList = document.getElementById('discussants-list');
const newDiscussantInput = document.getElementById('new-discussant');
const addDiscussantBtn = document.getElementById('add-discussant-btn');
const discussantToLimitSelect = document.getElementById('discussant-to-limit');
const maxDiscussantUsageSelect = document.getElementById('max-discussant-usage');
const updateLimitBtn = document.getElementById('update-limit-btn');
const supervisorInput = document.getElementById('supervisor-name');
const topicTitleInput = document.getElementById('topic-title');
const topicProfileSelect = document.getElementById('topic-profile');

let currentUser = null;
let currentYear = '2025';

// Login Function (Updated for Supabase)
async function login() {
    const password = passwordInput.value.trim();
    
    // Map passwords to emails (since Supabase uses email/password)
    const userCredentials = {
        'RgT2025EnSl': 'admin@thesis.com',
        'A3$dF': 'user1@thesis.com',
        'zX#7k': 'user2@thesis.com'
        // Add more as needed
    };

    const email = userCredentials[password];
    
    if (!email) {
        loginError.textContent = 'كلمة المرور غير صحيحة';
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginError.textContent = 'فشل تسجيل الدخول: ' + error.message;
    } else {
        currentUser = password; // Store password for permissions
        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        loadSavedData();
    }
}

// Logout Function
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    mainContent.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

// Load Data from Supabase
async function loadSavedData() {
    // Load topics
    const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('year', currentYear);
    
    // Load committees
    const { data: committeesData } = await supabase
        .from('committees')
        .select('*')
        .eq('year', currentYear);
    
    // Load discussants
    const { data: discussantsData } = await supabase
        .from('discussants')
        .select('*');
    
    // Update UI
    renderTopics(topicsData || []);
    renderCommittees(committeesData || []);
}

// Save Topic to Supabase
async function saveTopic(topic) {
    const { error } = await supabase
        .from('topics')
        .upsert([{ ...topic, year: currentYear }]);
    
    if (error) console.error('Error saving topic:', error);
}

// Save Committee to Supabase
async function saveCommittee(committee) {
    const { error } = await supabase
        .from('committees')
        .upsert([{ ...committee, year: currentYear }]);
    
    if (error) console.error('Error saving committee:', error);
}

// Submit Topic Form
async function submitTopicForm(e) {
    e.preventDefault();
    
    const newTopic = {
        supervisor: supervisorInput.value.trim(),
        title: topicTitleInput.value.trim(),
        profile: topicProfileSelect.value,
        status: 'pending',
        addedBy: currentUser,
        timestamp: new Date().toISOString()
    };
    
    await saveTopic(newTopic);
    topicModal.classList.add('hidden');
    topicForm.reset();
    loadSavedData();
}

// Submit Committee Form
async function submitCommitteeForm(e) {
    e.preventDefault();
    
    const newCommittee = {
        topic: committeeTopicSelect.value,
        firstDiscussant: firstDiscussantSelect.value,
        secondDiscussant: secondDiscussantSelect.value,
        addedBy: currentUser,
        timestamp: new Date().toISOString()
    };
    
    await saveCommittee(newCommittee);
    committeeModal.classList.add('hidden');
    committeeForm.reset();
    loadSavedData();
}

// Rest of your functions (renderTopics, renderCommittees, etc.)
// ... (Copy from previous Glitch version, but replace localStorage with Supabase calls) ...

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user.email;
            mainContent.classList.remove('hidden');
            loginPage.classList.add('hidden');
            loadSavedData();
        }
    });

    // Event listeners
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });

    // ... (Rest of your event listeners) ...
});
