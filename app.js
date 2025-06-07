// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
            apiKey: "AIzaSyCC36epRow_C0pILQdmHZQxW-Qvtu-1U2k",
            authDomain: "ensl-7118d.firebaseapp.com",
            databaseURL: "https://ensl-7118d-default-rtdb.firebaseio.com",
            projectId: "ensl-7118d",
            storageBucket: "ensl-7118d.firebasestorage.app",
            messagingSenderId: "830633315062",
            appId: "1:830633315062:web:7036091381389edf7e7ad7",
            measurementId: "G-2EL41ZJNFP"
        };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

let currentUser = null;
let currentYear = '2025';
// Data Structures
let topics = {
    '2025': [],
    '2026': [],
    '2027': [],
    '2028': []
};

let committees = {
    '2025': [],
    '2026': [],
    '2027': [],
    '2028': []
};

let discussants = [
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

let discussantLimits = {};
let discussantUsage = {};

// Initialize default limits
function initializeDiscussantLimits() {
    discussants.forEach(discussant => {
        if (!discussantLimits[discussant]) {
            discussantLimits[discussant] = 3; // Default limit
        }
    });
}

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

// Load Saved Data
function loadSavedData() {
    const savedTopics = localStorage.getItem('academicTopics');
    const savedCommittees = localStorage.getItem('academicCommittees');
    const savedDiscussants = localStorage.getItem('academicDiscussants');
    const savedDiscussantLimits = localStorage.getItem('academicDiscussantLimits');
    const savedDiscussantUsage = localStorage.getItem('academicDiscussantUsage');

    if (savedTopics) topics = JSON.parse(savedTopics);
    if (savedCommittees) committees = JSON.parse(savedCommittees);
    if (savedDiscussants) discussants = JSON.parse(savedDiscussants);
    if (savedDiscussantLimits) discussantLimits = JSON.parse(savedDiscussantLimits);
    if (savedDiscussantUsage) discussantUsage = JSON.parse(savedDiscussantUsage);

    initializeDiscussantLimits();
    updateDiscussantUsage();
}

// Save Data
function saveData() {
    localStorage.setItem('academicTopics', JSON.stringify(topics));
    localStorage.setItem('academicCommittees', JSON.stringify(committees));
    localStorage.setItem('academicDiscussants', JSON.stringify(discussants));
    localStorage.setItem('academicDiscussantLimits', JSON.stringify(discussantLimits));
    localStorage.setItem('academicDiscussantUsage', JSON.stringify(discussantUsage));
}

// Update Discussant Usage Count
function updateDiscussantUsage() {
    discussantUsage = {};
    Object.values(committees).forEach(yearCommittees => {
        yearCommittees.forEach(committee => {
            discussantUsage[committee.firstDiscussant] = (discussantUsage[committee.firstDiscussant] || 0) + 1;
            discussantUsage[committee.secondDiscussant] = (discussantUsage[committee.secondDiscussant] || 0) + 1;
        });
    });
    saveData();
}

// Download Topics as Excel
function downloadAsExcel() {
    const excelData = topics[currentYear].map(topic => ({
        'لقب المؤطر': topic.supervisor,
        'الموضوع': topic.title,
        'الملمح': topic.profile,
        'الحالة': topic.status === 'accepted' ? 'مقبول' : 
                 topic.status === 'rejected' ? 'مؤجل' : 'قيد المراجعة',
        'تاريخ الإضافة': new Date(topic.timestamp).toLocaleString('ar-EG')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المواضيع');
    XLSX.writeFile(workbook, `مواضيع_${currentYear}.xlsx`);
}

// Download Committees as Excel
function downloadCommitteesAsExcel() {
    const excelData = committees[currentYear].map(committee => {
        const topicInfo = topics[currentYear].find(t => t.title === committee.topic) || {};
        return {
            'الموضوع': committee.topic,
            'المناقش الأول': committee.firstDiscussant,
            'المناقش الثاني': committee.secondDiscussant,
            'لقب المؤطر': topicInfo.supervisor || 'غير معروف',
            'الملمح': topicInfo.profile || 'غير معروف'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'لجان المناقشة');
    XLSX.writeFile(workbook, `لجان_المناقشة_${currentYear}.xlsx`);
}

// Render Topics
function renderTopics() {
    topicsList.innerHTML = '';
    
    if (topics[currentYear].length === 0) {
        topicsList.innerHTML = '<p class="no-topics">لا توجد مواضيع مسجلة بعد</p>';
        return;
    }
    
    if (currentUser === 'RgT2025EnSl') {
        downloadExcelBtn.classList.remove('hidden');
    } else {
        downloadExcelBtn.classList.add('hidden');
    }
    
    // Filter topics to show only current user's topics (unless admin)
    const userTopics = currentUser === 'RgT2025EnSl' 
        ? topics[currentYear] 
        : topics[currentYear].filter(topic => topic.addedBy === currentUser);
    
    if (userTopics.length === 0) {
        topicsList.innerHTML = '<p class="no-topics">لا توجد مواضيع مسجلة لك</p>';
        return;
    }
    
    userTopics.forEach((topic, index) => {
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
        `;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'topic-actions';
        
        if (topic.addedBy === currentUser || currentUser === 'RgT2025EnSl') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = 'حذف';
            deleteBtn.onclick = () => deleteTopic(topic.addedBy === currentUser ? 
                topics[currentYear].findIndex(t => t.timestamp === topic.timestamp) : 
                index);
            actionsDiv.appendChild(deleteBtn);
        }
        
        if (currentUser === 'RgT2025EnSl') {
            if (topic.status !== 'accepted') {
                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'action-btn accept-btn';
                acceptBtn.innerHTML = '? مقبول';
                acceptBtn.onclick = () => updateTopicStatus(index, 'accepted');
                actionsDiv.appendChild(acceptBtn);
            }
            
            if (topic.status !== 'rejected') {
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'action-btn reject-btn';
                rejectBtn.innerHTML = '? مؤجل';
                rejectBtn.onclick = () => updateTopicStatus(index, 'rejected');
                actionsDiv.appendChild(rejectBtn);
            }
            
            const changeProfileBtn = document.createElement('button');
            changeProfileBtn.className = 'action-btn change-profile-btn';
            changeProfileBtn.innerHTML = 'تغيير الملمح';
            changeProfileBtn.onclick = () => changeTopicProfile(index);
            actionsDiv.appendChild(changeProfileBtn);
        }
        
        if (actionsDiv.children.length > 0) {
            topicCard.appendChild(actionsDiv);
        }
        
        topicsList.appendChild(topicCard);
    });
}

// Render Committees
function renderCommittees() {
    committeeList.innerHTML = '';
    
    if (currentUser === 'RgT2025EnSl') {
        downloadCommitteeExcelBtn.classList.remove('hidden');
        manageDiscussantsBtn.classList.remove('hidden');
    } else {
        downloadCommitteeExcelBtn.classList.add('hidden');
        manageDiscussantsBtn.classList.add('hidden');
    }
    
    if (committees[currentYear].length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة بعد</p>';
        return;
    }
    
    // Filter committees to show only current user's committees (unless admin)
    const userCommittees = currentUser === 'RgT2025EnSl' 
        ? committees[currentYear] 
        : committees[currentYear].filter(committee => committee.addedBy === currentUser);
    
    if (userCommittees.length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة لك</p>';
        return;
    }
    
    userCommittees.forEach((committee, index) => {
        const committeeCard = document.createElement('div');
        committeeCard.className = 'committee-card';
        
        const topicInfo = topics[currentYear].find(t => t.title === committee.topic) || {};
        
        committeeCard.innerHTML = `
            <h3>${committee.topic}</h3>
            <div class="committee-meta">
                <p><strong>المناقش الأول:</strong> ${committee.firstDiscussant}</p>
                <p><strong>المناقش الثاني:</strong> ${committee.secondDiscussant}</p>
                <p><strong>المؤطر:</strong> ${topicInfo.supervisor || 'غير معروف'}</p>
                <p><strong>الملمح:</strong> ${topicInfo.profile || 'غير معروف'}</p>
            </div>
        `;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'topic-actions';
        
        if (committee.addedBy === currentUser || currentUser === 'RgT2025EnSl') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = 'حذف';
            deleteBtn.onclick = () => deleteCommittee(index);
            actionsDiv.appendChild(deleteBtn);
        }
        
        committeeCard.appendChild(actionsDiv);
        committeeList.appendChild(committeeCard);
    });
}

// Delete Topic
function deleteTopic(index) {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
        topics[currentYear].splice(index, 1);
        saveData();
        renderTopics();
    }
}

// Delete Committee
function deleteCommittee(index) {
    if (confirm('هل أنت متأكد من حذف هذه اللجنة؟')) {
        // Update discussant usage before deleting
        const committee = committees[currentYear][index];
        discussantUsage[committee.firstDiscussant]--;
        discussantUsage[committee.secondDiscussant]--;
        
        committees[currentYear].splice(index, 1);
        saveData();
        renderCommittees();
    }
}

// Update Topic Status
function updateTopicStatus(index, status) {
    topics[currentYear][index].status = status;
    saveData();
    renderTopics();
}

// Change Topic Profile
function changeTopicProfile(index) {
    const newProfile = prompt('اختر الملمح الجديد:\n1. متوسط\n2. ثانوي', topics[currentYear][index].profile);
    
    if (newProfile && ['متوسط', 'ثانوي'].includes(newProfile)) {
        topics[currentYear][index].profile = newProfile;
        saveData();
        renderTopics();
    } else if (newProfile) {
        alert('الرجاء اختيار "متوسط" أو "ثانوي" فقط');
    }
}

// Open Committee Modal
function openCommitteeModal() {
    // Fill topics select with only current user's accepted topics (or all if admin)
    committeeTopicSelect.innerHTML = '<option value="">اختر الموضوع</option>';
    
    const userTopics = currentUser === 'RgT2025EnSl' 
        ? topics[currentYear].filter(t => t.status === 'accepted')
        : topics[currentYear].filter(t => t.addedBy === currentUser && t.status === 'accepted');
    
    userTopics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.title;
        option.textContent = topic.title;
        committeeTopicSelect.appendChild(option);
    });
    
    // Fill discussants selects
    updateDiscussantSelects();
    
    committeeModal.classList.remove('hidden');
}

// Update Discussant Selects with limits enforcement
function updateDiscussantSelects() {
    firstDiscussantSelect.innerHTML = '<option value="">اختر المناقش الأول</option>';
    secondDiscussantSelect.innerHTML = '<option value="">اختر المناقش الثاني</option>';
    
    discussants.forEach(discussant => {
        const count = discussantUsage[discussant] || 0;
        const limit = discussantLimits[discussant] || 3;
        const disabled = count >= limit;
        
        const option1 = document.createElement('option');
        option1.value = discussant;
        option1.textContent = `${discussant} (${count}/${limit})`;
        option1.disabled = disabled;
        firstDiscussantSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = discussant;
        option2.textContent = `${discussant} (${count}/${limit})`;
        option2.disabled = disabled;
        secondDiscussantSelect.appendChild(option2);
    });
    
    // Make dropdowns scrollable
    firstDiscussantSelect.size = 10;
    secondDiscussantSelect.size = 10;
    firstDiscussantSelect.style.overflowY = 'auto';
    secondDiscussantSelect.style.overflowY = 'auto';
}

// Update Discussant Limit with full enforcement
function updateDiscussantLimit() {
    const discussant = discussantToLimitSelect.value;
    const newLimit = parseInt(maxDiscussantUsageSelect.value);
    
    if (!discussant) {
        alert('الرجاء اختيار مناقش');
        return;
    }
    
    if (isNaN(newLimit) || newLimit < 1 || newLimit > 4) {
        alert('الحد الأقصى يجب أن يكون بين 1 و 4');
        return;
    }
    
    const currentUsage = discussantUsage[discussant] || 0;
    if (currentUsage > newLimit) {
        alert(`لا يمكن تعيين الحد إلى ${newLimit} لأن المناقش مستخدم ${currentUsage} مرات حالياً`);
        return;
    }
    
    discussantLimits[discussant] = newLimit;
    saveData();
    updateDiscussantSelects(); // Update all selects immediately
    openDiscussantsModal();
}

// Open Discussants Management Modal
function openDiscussantsModal() {
    discussantsList.innerHTML = '';
    
    // Populate discussants list
    discussants.forEach((discussant, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${discussant}</span>
            <span class="remove-discussant" data-index="${index}">×</span>
        `;
        discussantsList.appendChild(li);
    });
    
    // Set up remove discussant events
    document.querySelectorAll('.remove-discussant').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const discussant = discussants[index];
            
            // Check if discussant is in use
            if (discussantUsage[discussant] > 0) {
                alert('لا يمكن حذف هذا المناقش لأنه مستخدم في لجان حالية');
                return;
            }
            
            if (confirm(`هل أنت متأكد من حذف ${discussant}؟`)) {
                discussants.splice(index, 1);
                delete discussantLimits[discussant];
                saveData();
                openDiscussantsModal();
            }
        });
    });
    
    // Populate discussant limit controls
    discussantToLimitSelect.innerHTML = '<option value="">اختر المناقش</option>';
    discussants.forEach(discussant => {
        const option = document.createElement('option');
        option.value = discussant;
        option.textContent = discussant;
        discussantToLimitSelect.appendChild(option);
    });
    
    discussantToLimitSelect.disabled = discussants.length === 0;
    maxDiscussantUsageSelect.disabled = discussants.length === 0;
    updateLimitBtn.disabled = discussants.length === 0;
    
    // Set up discussant limit change
    discussantToLimitSelect.addEventListener('change', function() {
        if (this.value) {
            const currentLimit = discussantLimits[this.value] || 3;
            maxDiscussantUsageSelect.value = currentLimit;
        }
    });
    
    discussantsModal.classList.remove('hidden');
}

// Add New Discussant
function addNewDiscussant() {
    const name = newDiscussantInput.value.trim();
    
    if (!name) {
        alert('الرجاء إدخال اسم المناقش');
        return;
    }
    
    if (discussants.includes(name)) {
        alert('هذا المناقش موجود بالفعل!');
        return;
    }
    
    discussants.push(name);
    discussantLimits[name] = 3; // Default limit
    newDiscussantInput.value = '';
    saveData();
    openDiscussantsModal();
}

// Update Discussant Limit
function updateDiscussantLimit() {
    const discussant = discussantToLimitSelect.value;
    const newLimit = parseInt(maxDiscussantUsageSelect.value);
    
    if (!discussant) {
        alert('الرجاء اختيار مناقش');
        return;
    }
    
    if (isNaN(newLimit) || newLimit < 1 || newLimit > 4) {
        alert('الحد الأقصى يجب أن يكون بين 1 و 4');
        return;
    }
    
    const currentUsage = discussantUsage[discussant] || 0;
    if (currentUsage > newLimit) {
        alert(`لا يمكن تعيين الحد إلى ${newLimit} لأن المناقش مستخدم ${currentUsage} مرات حالياً`);
        return;
    }
    
    discussantLimits[discussant] = newLimit;
    saveData();
    openDiscussantsModal();
}

// Submit Topic Form
function submitTopicForm(e) {
    e.preventDefault();
    
    const supervisor = supervisorInput.value.trim();
    const title = topicTitleInput.value.trim();
    const profile = topicProfileSelect.value;
    
    if (!supervisor || !title || !profile) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const newTopic = {
        supervisor,
        title,
        profile,
        status: 'pending',
        addedBy: currentUser,
        timestamp: new Date().toISOString()
    };
    
    topics[currentYear].push(newTopic);
    saveData();
    topicModal.classList.add('hidden');
    topicForm.reset();
    renderTopics();
}

// Submit Committee Form
function submitCommitteeForm(e) {
    e.preventDefault();
    
    const topic = committeeTopicSelect.value;
    const firstDiscussant = firstDiscussantSelect.value;
    const secondDiscussant = secondDiscussantSelect.value;
    
    if (!topic || !firstDiscussant || !secondDiscussant) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    if (firstDiscussant === secondDiscussant) {
        alert('لا يمكن اختيار نفس المناقش مرتين');
        return;
    }
    
    const newCommittee = {
        topic,
        firstDiscussant,
        secondDiscussant,
        addedBy: currentUser,
        timestamp: new Date().toISOString()
    };
    
    committees[currentYear].push(newCommittee);
    
    // Update discussant usage
    discussantUsage[firstDiscussant] = (discussantUsage[firstDiscussant] || 0) + 1;
    discussantUsage[secondDiscussant] = (discussantUsage[secondDiscussant] || 0) + 1;
    
    saveData();
    committeeModal.classList.add('hidden');
    committeeForm.reset();
    renderCommittees();
}

// Change Year
function changeYear(year) {
    currentYear = year;
    currentYearTitle.textContent = `السنة الجامعية: ${year}`;
    
    // Update active year button
    yearNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.year === year);
    });
    
    // Render content for the new year
    const activeSubpage = document.querySelector('.subpages-tabs button.active').dataset.page;
    if (activeSubpage === 'topics') {
        renderTopics();
    } else {
        renderCommittees();
    }
}

// Change Subpage
function changeSubpage(subpage) {
    // Update active subpage button
    subpageButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === subpage);
    });
    
    // Show the selected content
    topicsContent.classList.toggle('hidden', subpage !== 'topics');
    committeeContent.classList.toggle('hidden', subpage !== 'committee');
    
    // Render the appropriate content
    if (subpage === 'topics') {
        renderTopics();
    } else {
        renderCommittees();
    }
}

// Login Function
function login() {
    const password = passwordInput.value.trim();
    
    if (validPasswords.includes(password)) {
        currentUser = password;
        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        
        // Initialize the default view
        changeYear(currentYear);
        changeSubpage('topics');
        
        loginError.textContent = '';
        passwordInput.value = '';
    } else {
        loginError.textContent = 'كلمة المرور غير صحيحة';
    }
}

// Logout Function
function logout() {
    currentUser = null;
    mainContent.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    
    // Login/Logout
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
    
    // Navigation
    yearNavButtons.forEach(btn => {
        btn.addEventListener('click', () => changeYear(btn.dataset.year));
    });
    
    subpageButtons.forEach(btn => {
        btn.addEventListener('click', () => changeSubpage(btn.dataset.page));
    });
    
    // Topic Management
    newTopicBtn.addEventListener('click', () => topicModal.classList.remove('hidden'));
    cancelModalBtn.addEventListener('click', () => topicModal.classList.add('hidden'));
    topicForm.addEventListener('submit', submitTopicForm);
    
    // Committee Management
    newCommitteeBtn.addEventListener('click', openCommitteeModal);
    cancelCommitteeModalBtn.addEventListener('click', () => committeeModal.classList.add('hidden'));
    committeeForm.addEventListener('submit', submitCommitteeForm);
    
    // Discussant Management
    manageDiscussantsBtn.addEventListener('click', openDiscussantsModal);
    closeDiscussantsModalBtn.addEventListener('click', () => discussantsModal.classList.add('hidden'));
    addDiscussantBtn.addEventListener('click', addNewDiscussant);
    updateLimitBtn.addEventListener('click', updateDiscussantLimit);
    
    // Excel Downloads
    downloadExcelBtn.addEventListener('click', downloadAsExcel);
    downloadCommitteeExcelBtn.addEventListener('click', downloadCommitteesAsExcel);
});
