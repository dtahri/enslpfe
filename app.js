// Configuration
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjEK3fv10wCCsTiYfzcUI4WPHMWSStpElVTFCnNtGOlQA0zVCNIKDw7v9DQxvkxSD_-w/exec"; // Replace with your deployed web app URL
const validPasswords = ['RgT2025EnSl', 'A3$dF', 'zX#7k', 'm9@Lp']; // Add your passwords

// Data Structures
let currentUser = null;
let currentYear = '2025';
let topics = { '2025': [], '2026': [], '2027': [], '2028': [] };
let committees = { '2025': [], '2026': [], '2027': [], '2028': [] };
let discussants = ["أ. علي حسن", "أ. سميرة خالد", "أ. محمد أحمد"]; // Add your discussants
let discussantLimits = {};
let discussantUsage = {};

// DOM Elements
const loginPage = document.getElementById('login-page');
const mainContent = document.getElementById('main-content');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const currentYearTitle = document.getElementById('current-year');
const newTopicBtn = document.getElementById('new-topic-btn');
const newCommitteeBtn = document.getElementById('new-committee-btn');
const topicModal = document.getElementById('topic-modal');
const committeeModal = document.getElementById('committee-modal');
const topicForm = document.getElementById('topic-form');
const committeeForm = document.getElementById('committee-form');
const topicsList = document.getElementById('topics-list');
const committeeList = document.getElementById('committee-list');

// Initialize Discussant Limits
function initializeDiscussantLimits() {
    discussants.forEach(discussant => {
        if (!discussantLimits[discussant]) {
            discussantLimits[discussant] = 3; // Default limit
        }
    });
}

// Save Topic to Google Sheets
async function saveTopicToSheet(topicData) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "saveTopic",
                data: {
                    supervisor: topicData.supervisor,
                    title: topicData.title,
                    profile: topicData.profile,
                    addedBy: currentUser,
                    year: currentYear
                }
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error saving topic:", error);
        return { success: false };
    }
}

// Save Committee to Google Sheets
async function saveCommitteeToSheet(committeeData) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "saveCommittee",
                data: {
                    topic: committeeData.topic,
                    firstDiscussant: committeeData.firstDiscussant,
                    secondDiscussant: committeeData.secondDiscussant,
                    addedBy: currentUser,
                    year: currentYear
                }
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error saving committee:", error);
        return { success: false };
    }
}

// Submit Topic Form
async function submitTopicForm(e) {
    e.preventDefault();
    
    const topicData = {
        supervisor: document.getElementById('supervisor-name').value.trim(),
        title: document.getElementById('topic-title').value.trim(),
        profile: document.getElementById('topic-profile').value
    };

    const result = await saveTopicToSheet(topicData);
    
    if (result.success) {
        alert("تم حفظ الموضوع بنجاح!");
        topicModal.classList.add('hidden');
        topicForm.reset();
        // Refresh topics list
        await loadTopics();
    } else {
        alert("حدث خطأ أثناء الحفظ: " + (result.message || ""));
    }
}

// Submit Committee Form
async function submitCommitteeForm(e) {
    e.preventDefault();
    
    const committeeData = {
        topic: document.getElementById('committee-topic').value,
        firstDiscussant: document.getElementById('first-discussant').value,
        secondDiscussant: document.getElementById('second-discussant').value
    };

    const result = await saveCommitteeToSheet(committeeData);
    
    if (result.success) {
        alert("تم حفظ اللجنة بنجاح!");
        committeeModal.classList.add('hidden');
        committeeForm.reset();
        // Refresh committees list
        await loadCommittees();
    } else {
        alert("حدث خطأ أثناء الحفظ: " + (result.message || ""));
    }
}

// Load Topics from Google Sheets
async function loadTopics() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getTopics&year=${currentYear}`);
        const data = await response.json();
        
        if (data.success) {
            topics[currentYear] = data.topics;
            renderTopics();
        }
    } catch (error) {
        console.error("Error loading topics:", error);
    }
}

// Load Committees from Google Sheets
async function loadCommittees() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getCommittees&year=${currentYear}`);
        const data = await response.json();
        
        if (data.success) {
            committees[currentYear] = data.committees;
            renderCommittees();
        }
    } catch (error) {
        console.error("Error loading committees:", error);
    }
}

// Render Topics
function renderTopics() {
    topicsList.innerHTML = topics[currentYear].map(topic => `
        <div class="topic-card ${topic.status}">
            <h3>${topic.title}</h3>
            <p><strong>المؤطر:</strong> ${topic.supervisor}</p>
            <div class="topic-meta">
                <span class="topic-profile">${topic.profile}</span>
                <span class="topic-status">${topic.status === 'accepted' ? 'مقبول' : 'قيد المراجعة'}</span>
            </div>
        </div>
    `).join('');
}

// Render Committees
function renderCommittees() {
    committeeList.innerHTML = committees[currentYear].map(committee => `
        <div class="committee-card">
            <h3>${committee.topic}</h3>
            <p><strong>المناقش الأول:</strong> ${committee.firstDiscussant}</p>
            <p><strong>المناقش الثاني:</strong> ${committee.secondDiscussant}</p>
        </div>
    `).join('');
}

// Initialize App
function initApp() {
    initializeDiscussantLimits();
    
    // Event Listeners
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    newTopicBtn.addEventListener('click', () => topicModal.classList.remove('hidden'));
    newCommitteeBtn.addEventListener('click', openCommitteeModal);
    topicForm.addEventListener('submit', submitTopicForm);
    committeeForm.addEventListener('submit', submitCommitteeForm);
    document.getElementById('cancel-modal-btn').addEventListener('click', () => topicModal.classList.add('hidden'));
    document.getElementById('cancel-committee-modal-btn').addEventListener('click', () => committeeModal.classList.add('hidden'));

    // Load initial data
    loadTopics();
    loadCommittees();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
