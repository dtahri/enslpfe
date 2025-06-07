// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
apiKey: "AIzaSyCC36epRow_C0pILQdmHZQxW-Qvtu-1U2k",
  authDomain: "ensl-7118d.firebaseapp.com",
  databaseURL: "https://ensl-7118d-default-rtdb.firebaseio.com",
  projectId: "ensl-7118d",
  storageBucket: "ensl-7118d.firebasestorage.app",
  messagingSenderId: "830633315062",
  appId: "1:830633315062:web:7036091381389edf7e7ad7"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

firebase.auth().signInWithEmailAndPassword("admin@example.com", "RgT2025EnSl")
  .then(user => console.log("Logged in:", user))
  .catch(error => console.error("Error:", error));

// User credentials (email/password combinations)
const userCredentials = [
    { email: "d.tahri@lagh-univ.dz", password: "bio&19905", role: "admin" },
    { email: "user1@example.com", password: "A3$dF", role: "user" },
    { email: "user2@example.com", password: "zX#7k", role: "user" },
    // Add all 45 users here following the same pattern
    { email: "user45@example.com", password: "S#o4j", role: "user" }
];

// Initial discussants list
const initialDiscussants = [
    "أ. برمضان الطيب",
    "أ. بن عابد هدى خديجة",
    "أ. بن مبارك هجيرة",
    "أ. بوبريمة أريج",
    "أ. بوصالح ليلى",
    "أ. بولنوار نور الدين",
    "أ. بوهالي عبد الباقي",
    "أ. جاب الله خلف الله",
    "أ. حاج سعيد حسينة",
    "أ. حاج عيسى توفيق",
    "أ. حمدي عائشة",
    "أ. خنيفي محمد أمين",
    "أ. دحمان سفيان",
    "أ. رايسي علي",
    "أ. سرسق التالية",
    "أ. شلغوم منال",
    "أ. صديقي السعيد",
    "أ. ضيف القندوز",
    "أ. طاهري الجيلالي",
    "أ. طليبة هالة",
    "أ. عويسي هاجر",
    "أ. فيلالي عبد السلام",
    "أ. قاسمي صفية",
    "أ. لبيض رضوان",
    "أ. لعربي ابراهيم",
    "أ. ماسنة فتيحة",
    "أ. مرباح كمال زين العابدين",
    "أ. معمري مليكة",
    "أ. ناجي فاطمة الزهراء"
];

// State variables
let currentUser = null;
let currentYear = new Date().getFullYear().toString();

// DOM Elements
const loginPage = document.getElementById('login-page');
const mainContent = document.getElementById('main-content');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
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
const loadingSpinner = document.getElementById('loading-spinner');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthState();
});

// Firebase Auth State Listener
function checkAuthState() {
  console.log("Setting up auth state listener...");
    auth.onAuthStateChanged(user => {
      console.log("Auth state changed:", user);
        if (user) {
          console.log("User signed in:", user.email);
            // User is signed in
            getUserRole(user.email).then(role => {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    role: role
                };
                
                loginPage.classList.add('hidden');
                mainContent.classList.remove('hidden');
                loadInitialData();
            });
        } else {
          console.log("No user signed in");
            // No user is signed in
            currentUser = null;
            loginPage.classList.remove('hidden');
            mainContent.classList.add('hidden');
        }
    });
}

// Get user role from database
async function getUserRole(email) {
    const sanitizedEmail = email.replace('.', '_');
    const snapshot = await database.ref('users/' + sanitizedEmail).once('value');
    return snapshot.val()?.role || 'user';
}

// Initialize all users (run this once)
async function initializeUsers() {
    try {
        for (const cred of userCredentials) {
            await auth.createUserWithEmailAndPassword(cred.email, cred.password)
                .then(() => {
                    // Save user role to database
                    const sanitizedEmail = cred.email.replace('.', '_');
                    database.ref('users/' + sanitizedEmail).set({
                        role: cred.role
                    });
                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        console.log('User already exists:', cred.email);
                    } else {
                        console.error('Error creating user:', error);
                    }
                });
        }
        console.log('All users initialized successfully');
    } catch (error) {
        console.error('Error initializing users:', error);
    }
}

// Initialize discussants (run this once)
async function initializeDiscussants() {
    try {
        const discussantsRef = database.ref('discussants');
        const discussants = {};
        
        initialDiscussants.forEach(name => {
            const id = name.replace(/\s+/g, '_');
            discussants[id] = {
                name: name,
                maxUsage: 3,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };
        });
        
        await discussantsRef.set(discussants);
        console.log('Discussants initialized successfully');
    } catch (error) {
        console.error('Error initializing discussants:', error);
    }
}

// Authentication Handler
async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        loginError.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور';
        return;
    }
    
    try {
        loadingSpinner.classList.remove('hidden');
        loginError.textContent = '';
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Get user role from database
        const sanitizedEmail = email.replace('.', '_');
        const roleSnapshot = await database.ref('users/' + sanitizedEmail).once('value');
        const role = roleSnapshot.val()?.role || 'user';
        
        currentUser = {
            uid: user.uid,
            email: user.email,
            role: role
        };
        
        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        loadInitialData();
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Specific error messages
        if (error.code === 'auth/user-not-found') {
            loginError.textContent = 'البريد الإلكتروني غير مسجل';
        } else if (error.code === 'auth/wrong-password') {
            loginError.textContent = 'كلمة المرور غير صحيحة';
        } else if (error.code === 'auth/invalid-email') {
            loginError.textContent = 'بريد إلكتروني غير صالح';
        } else {
            loginError.textContent = 'حدث خطأ أثناء تسجيل الدخول';
        }
        
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Logout Handler
function handleLogout() {
    auth.signOut();
}

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Data Loading Functions
function loadInitialData() {
    currentYearTitle.textContent = `نظام إدارة مواضيع التخرج - ${currentYear}`;
    loadDataForYear(currentYear);
}

function loadDataForYear(year) {
    loadingSpinner.classList.remove('hidden');
    
    // Load topics
    database.ref(`topics/${year}`).on('value', (snapshot) => {
        const topics = snapshot.val() || {};
        renderTopics(topics);
        
        if (document.getElementById('committee-modal').classList.contains('hidden') === false) {
            populateCommitteeForm();
        }
        
        loadingSpinner.classList.add('hidden');
    });
    
    // Load committees
    database.ref(`committees/${year}`).on('value', (snapshot) => {
        const committees = snapshot.val() || {};
        renderCommittees(committees);
    });
    
    // Load discussants
    database.ref('discussants').on('value', (snapshot) => {
        const discussants = snapshot.val() || {};
        window.discussants = discussants;
        
        if (document.getElementById('discussants-modal').classList.contains('hidden') === false) {
            renderDiscussantsList(discussants);
        }
    });
}

// Rendering Functions
function renderTopics(topics) {
    topicsList.innerHTML = '';
    
    if (Object.keys(topics).length === 0) {
        topicsList.innerHTML = '<p class="no-topics">لا توجد مواضيع مسجلة بعد</p>';
        downloadExcelBtn.classList.add('hidden');
        return;
    }
    
    if (isAdmin()) {
        downloadExcelBtn.classList.remove('hidden');
    } else {
        downloadExcelBtn.classList.add('hidden');
    }
    
    // Filter topics to show only current user's topics (unless admin)
    const userTopics = isAdmin() ? topics : 
        Object.fromEntries(Object.entries(topics).filter(([_, topic]) => topic.addedBy === currentUser.email));
    
    if (Object.keys(userTopics).length === 0) {
        topicsList.innerHTML = '<p class="no-topics">لا توجد مواضيع مسجلة لك</p>';
        return;
    }
    
    Object.entries(userTopics).forEach(([id, topic]) => {
        const topicCard = document.createElement('div');
        topicCard.className = `topic-card ${topic.status}`;
        
        const statusText = {
            'pending': 'قيد المراجعة',
            'accepted': 'مقبول',
            'rejected': 'مؤجل'
        }[topic.status];
        
        topicCard.innerHTML = `
            <h3>${topic.title}</h3>
            <p><strong>المؤطر:</strong> ${topic.supervisor}</p>
            <div class="topic-meta">
                <span class="topic-profile">${topic.profile}</span>
                <span class="topic-status ${topic.status}">${statusText}</span>
            </div>
            <div class="topic-actions">
                <button class="action-btn delete-btn" onclick="deleteTopic('${id}')">حذف</button>
                ${isAdmin() ? `
                <button class="action-btn accept-btn" onclick="updateTopicStatus('${id}', 'accepted')">قبول</button>
                <button class="action-btn reject-btn" onclick="updateTopicStatus('${id}', 'rejected')">تأجيل</button>
                <button class="action-btn change-profile-btn" onclick="changeTopicProfile('${id}')">تغيير الملمح</button>
                ` : ''}
            </div>
        `;
        
        topicsList.appendChild(topicCard);
    });
}

function renderCommittees(committees) {
    committeeList.innerHTML = '';
    
    if (Object.keys(committees).length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة بعد</p>';
        downloadCommitteeExcelBtn.classList.add('hidden');
        manageDiscussantsBtn.classList.add('hidden');
        return;
    }
    
    if (isAdmin()) {
        downloadCommitteeExcelBtn.classList.remove('hidden');
        manageDiscussantsBtn.classList.remove('hidden');
    } else {
        downloadCommitteeExcelBtn.classList.add('hidden');
        manageDiscussantsBtn.classList.add('hidden');
    }
    
    // Filter committees to show only current user's committees (unless admin)
    const userCommittees = isAdmin() ? committees : 
        Object.fromEntries(Object.entries(committees).filter(([_, committee]) => committee.addedBy === currentUser.email));
    
    if (Object.keys(userCommittees).length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة لك</p>';
        return;
    }
    
    Object.entries(userCommittees).forEach(([id, committee]) => {
        const committeeCard = document.createElement('div');
        committeeCard.className = 'committee-card';
        
        committeeCard.innerHTML = `
            <h3>${committee.topicTitle}</h3>
            <div class="committee-meta">
                <p><strong>المناقش الأول:</strong> ${committee.firstDiscussant}</p>
                <p><strong>المناقش الثاني:</strong> ${committee.secondDiscussant}</p>
            </div>
            <div class="topic-actions">
                <button class="action-btn delete-btn" onclick="deleteCommittee('${id}')">حذف</button>
            </div>
        `;
        
        committeeList.appendChild(committeeCard);
    });
}

// Form Handling Functions
async function handleAddTopic(e) {
    e.preventDefault();
    
    const supervisor = supervisorInput.value.trim();
    const title = topicTitleInput.value.trim();
    const profile = topicProfileSelect.value;
    
    if (!supervisor || !title || !profile) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    try {
        loadingSpinner.classList.remove('hidden');
        
        const newTopic = {
            supervisor,
            title,
            profile,
            status: 'pending',
            addedBy: currentUser.email,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        await database.ref(`topics/${currentYear}`).push(newTopic);
        
        topicModal.classList.add('hidden');
        topicForm.reset();
    } catch (error) {
        console.error('Error adding topic:', error);
        alert('حدث خطأ أثناء إضافة الموضوع');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

async function handleAddCommittee(e) {
    e.preventDefault();
    
    const topicId = committeeTopicSelect.value;
    const firstDiscussantId = firstDiscussantSelect.value;
    const secondDiscussantId = secondDiscussantSelect.value;
    
    if (!topicId || !firstDiscussantId || !secondDiscussantId) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    if (firstDiscussantId === secondDiscussantId) {
        alert('يجب اختيار مناقشين مختلفين');
        return;
    }
    
    try {
        loadingSpinner.classList.remove('hidden');
        
        // Get topic and discussant details
        const topicSnapshot = await database.ref(`topics/${currentYear}/${topicId}`).once('value');
        const topic = topicSnapshot.val();
        
        const firstDiscussant = window.discussants[firstDiscussantId];
        const secondDiscussant = window.discussants[secondDiscussantId];
        
        if (!topic || !firstDiscussant || !secondDiscussant) {
            throw new Error('Invalid selection');
        }
        
        const newCommittee = {
            topicId,
            topicTitle: topic.title,
            firstDiscussantId,
            firstDiscussant: firstDiscussant.name,
            secondDiscussantId,
            secondDiscussant: secondDiscussant.name,
            addedBy: currentUser.email,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        await database.ref(`committees/${currentYear}`).push(newCommittee);
        
        committeeModal.classList.add('hidden');
        committeeForm.reset();
    } catch (error) {
        console.error('Error adding committee:', error);
        alert('حدث خطأ أثناء إضافة اللجنة');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Discussant Management
async function loadDiscussants() {
    try {
        loadingSpinner.classList.remove('hidden');
        const snapshot = await database.ref('discussants').once('value');
        const discussants = snapshot.val() || {};
        renderDiscussantsList(discussants);
    } catch (error) {
        console.error('Error loading discussants:', error);
        alert('حدث خطأ أثناء تحميل قائمة المناقشين');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function renderDiscussantsList(discussants) {
    discussantsList.innerHTML = '';
    discussantToLimitSelect.innerHTML = '<option value="">اختر المناقش</option>';
    
    Object.entries(discussants).forEach(([id, discussant]) => {
        // Add to list
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${discussant.name} (الحد الأقصى: ${discussant.maxUsage || 2})</span>
            <button class="secondary-btn" onclick="deleteDiscussant('${id}')">حذف</button>
        `;
        discussantsList.appendChild(li);
        
        // Add to dropdown
        const option = document.createElement('option');
        option.value = id;
        option.textContent = discussant.name;
        discussantToLimitSelect.appendChild(option);
    });
}

async function handleAddDiscussant() {
    const name = newDiscussantInput.value.trim();
    
    if (!name) {
        alert('الرجاء إدخال اسم المناقش');
        return;
    }
    
    try {
        loadingSpinner.classList.remove('hidden');
        
        // Check if discussant already exists
        const existingDiscussants = Object.values(window.discussants || {}).map(d => d.name);
        if (existingDiscussants.includes(name)) {
            alert('هذا المناقش موجود بالفعل!');
            return;
        }
        
        const newDiscussant = {
            name,
            maxUsage: 2, // Default limit
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        const newDiscussantRef = await database.ref('discussants').push(newDiscussant);
        newDiscussantInput.value = '';
        
        // Update local discussants object
        window.discussants = window.discussants || {};
        window.discussants[newDiscussantRef.key] = newDiscussant;
        
        // Update the UI
        renderDiscussantsList(window.discussants);
    } catch (error) {
        console.error('Error adding discussant:', error);
        alert('حدث خطأ أثناء إضافة المناقش');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

async function handleUpdateDiscussantLimit() {
    const discussantId = discussantToLimitSelect.value;
    const maxUsage = parseInt(maxDiscussantUsageSelect.value);
    
    if (!discussantId) {
        alert('الرجاء اختيار مناقش');
        return;
    }
    
    if (isNaN(maxUsage) || maxUsage < 1 || maxUsage > 4) {
        alert('الحد الأقصى يجب أن يكون بين 1 و 4');
        return;
    }
    
    try {
        loadingSpinner.classList.remove('hidden');
        await database.ref(`discussants/${discussantId}/maxUsage`).set(maxUsage);
        alert('تم تحديث الحد الأقصى بنجاح');
        
        // Update local discussants object
        if (window.discussants && window.discussants[discussantId]) {
            window.discussants[discussantId].maxUsage = maxUsage;
        }
        
        // Update the UI
        renderDiscussantsList(window.discussants);
    } catch (error) {
        console.error('Error updating discussant limit:', error);
        alert('حدث خطأ أثناء التحديث');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Delete Functions
window.deleteTopic = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الموضوع؟')) return;
    
    try {
        loadingSpinner.classList.remove('hidden');
        await database.ref(`topics/${currentYear}/${id}`).remove();
    } catch (error) {
        console.error('Error deleting topic:', error);
        alert('حدث خطأ أثناء الحذف');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

window.deleteCommittee = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذه اللجنة؟')) return;
    
    try {
        loadingSpinner.classList.remove('hidden');
        await database.ref(`committees/${currentYear}/${id}`).remove();
    } catch (error) {
        console.error('Error deleting committee:', error);
        alert('حدث خطأ أثناء الحذف');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

window.deleteDiscussant = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المناقش؟ سيتم حذفه من جميع اللجان.')) return;
    
    try {
        loadingSpinner.classList.remove('hidden');
        
        // First check if discussant is used in any committees
        const committeesSnapshot = await database.ref(`committees/${currentYear}`).once('value');
        const committees = committeesSnapshot.val() || {};
        
        let isUsed = false;
        Object.values(committees).forEach(committee => {
            if (committee.firstDiscussantId === id || committee.secondDiscussantId === id) {
                isUsed = true;
            }
        });
        
        if (isUsed) {
            alert('لا يمكن حذف هذا المناقش لأنه مستخدم في لجان حالية');
            return;
        }
        
        await database.ref(`discussants/${id}`).remove();
        
        // Update local discussants object
        if (window.discussants && window.discussants[id]) {
            delete window.discussants[id];
        }
        
        // Update the UI
        renderDiscussantsList(window.discussants || {});
    } catch (error) {
        console.error('Error deleting discussant:', error);
        alert('حدث خطأ أثناء الحذف');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

// Excel Export Functions
async function downloadTopicsExcel() {
    try {
        loadingSpinner.classList.remove('hidden');
        
        const snapshot = await database.ref(`topics/${currentYear}`).once('value');
        const topics = snapshot.val() || {};
        
        const data = Object.values(topics).map(topic => ({
            'لقب المؤطر': topic.supervisor,
            'الموضوع': topic.title,
            'الملمح': topic.profile,
            'الحالة': topic.status === 'accepted' ? 'مقبول' : 
                     topic.status === 'rejected' ? 'مؤجل' : 'قيد المراجعة',
            'تاريخ الإضافة': new Date(topic.createdAt).toLocaleString('ar-EG')
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'المواضيع');
        XLSX.writeFile(workbook, `مواضيع_${currentYear}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('حدث خطأ أثناء التصدير');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

async function downloadCommitteesExcel() {
    try {
        loadingSpinner.classList.remove('hidden');
        
        const topicsSnapshot = await database.ref(`topics/${currentYear}`).once('value');
        const topics = topicsSnapshot.val() || {};
        
        const committeesSnapshot = await database.ref(`committees/${currentYear}`).once('value');
        const committees = committeesSnapshot.val() || {};
        
        const data = Object.values(committees).map(committee => {
            const topic = topics[committee.topicId] || {};
            return {
                'الموضوع': committee.topicTitle,
                'المناقش الأول': committee.firstDiscussant,
                'المناقش الثاني': committee.secondDiscussant,
                'لقب المؤطر': topic.supervisor || 'غير معروف',
                'الملمح': topic.profile || 'غير معروف'
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'لجان المناقشة');
        XLSX.writeFile(workbook, `لجان_المناقشة_${currentYear}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('حدث خطأ أثناء التصدير');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Helper Functions
async function populateCommitteeForm() {
    try {
        loadingSpinner.classList.remove('hidden');
        committeeTopicSelect.innerHTML = '<option value="">اختر الموضوع</option>';
        
        // Get accepted topics for current year
        const snapshot = await database.ref(`topics/${currentYear}`).once('value');
        const topics = snapshot.val() || {};
        
        Object.entries(topics).forEach(([id, topic]) => {
            if (topic.status === 'accepted') {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `${topic.title} (${topic.supervisor})`;
                committeeTopicSelect.appendChild(option);
            }
        });
        
        // Populate discussant dropdowns
        populateDiscussantDropdowns(window.discussants || {});
        committeeModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error populating committee form:', error);
        alert('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function populateDiscussantDropdowns(discussants) {
    firstDiscussantSelect.innerHTML = '<option value="">اختر المناقش الأول</option>';
    secondDiscussantSelect.innerHTML = '<option value="">اختر المناقش الثاني</option>';
    
    Object.entries(discussants).forEach(([id, discussant]) => {
        const option1 = document.createElement('option');
        option1.value = id;
        option1.textContent = `${discussant.name} (الحد: ${discussant.maxUsage || 2})`;
        firstDiscussantSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = id;
        option2.textContent = `${discussant.name} (الحد: ${discussant.maxUsage || 2})`;
        secondDiscussantSelect.appendChild(option2);
    });
    
    // Make dropdowns scrollable
    firstDiscussantSelect.size = 5;
    secondDiscussantSelect.size = 5;
}

// Update Topic Status
window.updateTopicStatus = async function(id, status) {
    if (!confirm(`هل أنت متأكد من تغيير حالة الموضوع إلى ${status === 'accepted' ? 'مقبول' : 'مؤجل'}؟`)) return;
    
    try {
        loadingSpinner.classList.remove('hidden');
        await database.ref(`topics/${currentYear}/${id}/status`).set(status);
    } catch (error) {
        console.error('Error updating topic status:', error);
        alert('حدث خطأ أثناء التحديث');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

// Change Topic Profile
window.changeTopicProfile = async function(id) {
    const newProfile = prompt('اختر الملمح الجديد:\n1. متوسط\n2. ثانوي', 'متوسط');
    
    if (newProfile && ['متوسط', 'ثانوي'].includes(newProfile)) {
        try {
            loadingSpinner.classList.remove('hidden');
            await database.ref(`topics/${currentYear}/${id}/profile`).set(newProfile);
        } catch (error) {
            console.error('Error changing topic profile:', error);
            alert('حدث خطأ أثناء التحديث');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    } else if (newProfile) {
        alert('الرجاء اختيار "متوسط" أو "ثانوي" فقط');
    }
};

// Event Listeners Setup
function setupEventListeners() {
    // Login/Logout
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Year Navigation
    yearNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentYear = btn.dataset.year;
            currentYearTitle.textContent = `نظام إدارة مواضيع التخرج - ${currentYear}`;
            loadDataForYear(currentYear);
        });
    });

    // Page Navigation
    subpageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            subpageButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const page = btn.dataset.page;
            topicsContent.classList.toggle('active', page === 'topics');
            committeeContent.classList.toggle('active', page === 'committee');
            
            if (page === 'topics') {
                renderTopics(window.currentTopics || {});
            } else {
                renderCommittees(window.currentCommittees || {});
            }
        });
    });

    // Topic Management
    newTopicBtn.addEventListener('click', () => {
        topicModal.classList.remove('hidden');
        topicForm.reset();
    });
    
    cancelModalBtn.addEventListener('click', () => {
        topicModal.classList.add('hidden');
        topicForm.reset();
    });
    
    topicForm.addEventListener('submit', handleAddTopic);

    // Committee Management
    newCommitteeBtn.addEventListener('click', populateCommitteeForm);
    
    cancelCommitteeModalBtn.addEventListener('click', () => {
        committeeModal.classList.add('hidden');
        committeeForm.reset();
    });
    
    committeeForm.addEventListener('submit', handleAddCommittee);

    // Discussant Management
    manageDiscussantsBtn.addEventListener('click', loadDiscussants);
    
    closeDiscussantsModalBtn.addEventListener('click', () => {
        discussantsModal.classList.add('hidden');
    });
    
    addDiscussantBtn.addEventListener('click', handleAddDiscussant);
    
    updateLimitBtn.addEventListener('click', handleUpdateDiscussantLimit);

    // Excel Downloads
    downloadExcelBtn.addEventListener('click', downloadTopicsExcel);
    downloadCommitteeExcelBtn.addEventListener('click', downloadCommitteesExcel);
}

// Initialize with first year
loadInitialData();
