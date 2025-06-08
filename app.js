// Google Sheets Configuration
const scriptURL = 'https://script.google.com/macros/s/AKfycbxj0PZslps0fvAycAuvY1sAy7ODbzR37_ceB5Rspagah9sk76NE6rV7lBGKMWz-zsI0/exec'; // Replace with your deployment URL
let currentUser = null;
let currentYear = '2025';

// Data Structures
let topics = {};
let committees = {};
let discussants = [];
let discussantLimits = {};
let discussantUsage = {};

// Initialize years
['2025', '2026', '2027', '2028'].forEach(year => {
    topics[year] = [];
    committees[year] = [];
});

// DOM Elements (same as before)
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

// Initialize Discussant Limits
function initializeDiscussantLimits() {
    discussants.forEach(discussant => {
        if (!discussantLimits[discussant]) {
            discussantLimits[discussant] = 3; // Default limit
        }
    });
}

// Load Data from Google Sheets
async function loadSavedData() {
    try {
        const response = await fetch(`${scriptURL}?action=getAllData`);
        const data = await response.json();
        
        if (data.success) {
            topics = data.topics;
            committees = data.committees;
            discussants = data.discussants;
            discussantLimits = data.discussantLimits;
            discussantUsage = data.discussantUsage;
            
            initializeDiscussantLimits();
            updateDiscussantUsage();
        } else {
            console.error('Error loading data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Save Data to Google Sheets
async function saveData(type, data) {
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveData',
                type: type,
                data: data,
                year: currentYear
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Error saving data:', result.message);
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
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
}

// Download Topics as Excel (same as before)
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

// Download Committees as Excel (same as before)
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

// Render Topics (same as before)
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
                acceptBtn.innerHTML = '✓ مقبول';
                acceptBtn.onclick = () => updateTopicStatus(index, 'accepted');
                actionsDiv.appendChild(acceptBtn);
            }
            
            if (topic.status !== 'rejected') {
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'action-btn reject-btn';
                rejectBtn.innerHTML = '✗ مؤجل';
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

// Render Committees (same as before)
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
async function deleteTopic(index) {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
        const topicToDelete = topics[currentYear][index];
        topics[currentYear].splice(index, 1);
        
        try {
            await saveData('deleteTopic', { timestamp: topicToDelete.timestamp });
            renderTopics();
        } catch (error) {
            console.error('Error deleting topic:', error);
            alert('حدث خطأ أثناء حذف الموضوع');
            topics[currentYear].splice(index, 0, topicToDelete); // Revert if error
        }
    }
}

// Delete Committee
async function deleteCommittee(index) {
    if (confirm('هل أنت متأكد من حذف هذه اللجنة؟')) {
        const committee = committees[currentYear][index];
        committees[currentYear].splice(index, 1);
        
        // Update discussant usage before deleting
        discussantUsage[committee.firstDiscussant]--;
        discussantUsage[committee.secondDiscussant]--;
        
        try {
            await saveData('deleteCommittee', { timestamp: committee.timestamp });
            renderCommittees();
        } catch (error) {
            console.error('Error deleting committee:', error);
            alert('حدث خطأ أثناء حذف اللجنة');
            committees[currentYear].splice(index, 0, committee); // Revert if error
        }
    }
}

// Update Topic Status
async function updateTopicStatus(index, status) {
    const originalStatus = topics[currentYear][index].status;
    topics[currentYear][index].status = status;
    
    try {
        await saveData('updateTopicStatus', {
            timestamp: topics[currentYear][index].timestamp,
            status: status
        });
        renderTopics();
    } catch (error) {
        console.error('Error updating topic status:', error);
        topics[currentYear][index].status = originalStatus; // Revert if error
        alert('حدث خطأ أثناء تحديث حالة الموضوع');
    }
}

// Change Topic Profile
async function changeTopicProfile(index) {
    const newProfile = prompt('اختر الملمح الجديد:\n1. متوسط\n2. ثانوي', topics[currentYear][index].profile);
    
    if (newProfile && ['متوسط', 'ثانوي'].includes(newProfile)) {
        const originalProfile = topics[currentYear][index].profile;
        topics[currentYear][index].profile = newProfile;
        
        try {
            await saveData('changeTopicProfile', {
                timestamp: topics[currentYear][index].timestamp,
                profile: newProfile
            });
            renderTopics();
        } catch (error) {
            console.error('Error changing topic profile:', error);
            topics[currentYear][index].profile = originalProfile; // Revert if error
            alert('حدث خطأ أثناء تغيير ملمح الموضوع');
        }
    } else if (newProfile) {
        alert('الرجاء اختيار "متوسط" أو "ثانوي" فقط');
    }
}

// Open Committee Modal (same as before)
function openCommitteeModal() {
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
    
    updateDiscussantSelects();
    committeeModal.classList.remove('hidden');
}

// Update Discussant Selects with limits enforcement (same as before)
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
    
    firstDiscussantSelect.size = 10;
    secondDiscussantSelect.size = 10;
    firstDiscussantSelect.style.overflowY = 'auto';
    secondDiscussantSelect.style.overflowY = 'auto';
}

// Open Discussants Management Modal (same as before)
function openDiscussantsModal() {
    discussantsList.innerHTML = '';
    
    discussants.forEach((discussant, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${discussant}</span>
            <span class="remove-discussant" data-index="${index}">×</span>
        `;
        discussantsList.appendChild(li);
    });
    
    document.querySelectorAll('.remove-discussant').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const discussant = discussants[index];
            
            if (discussantUsage[discussant] > 0) {
                alert('لا يمكن حذف هذا المناقش لأنه مستخدم في لجان حالية');
                return;
            }
            
            if (confirm(`هل أنت متأكد من حذف ${discussant}؟`)) {
                removeDiscussant(index);
            }
        });
    });
    
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
    
    discussantToLimitSelect.addEventListener('change', function() {
        if (this.value) {
            const currentLimit = discussantLimits[this.value] || 3;
            maxDiscussantUsageSelect.value = currentLimit;
        }
    });
    
    discussantsModal.classList.remove('hidden');
}

// Remove Discussant
async function removeDiscussant(index) {
    const discussantToRemove = discussants[index];
    discussants.splice(index, 1);
    delete discussantLimits[discussantToRemove];
    
    try {
        await saveData('removeDiscussant', { discussant: discussantToRemove });
        openDiscussantsModal();
    } catch (error) {
        console.error('Error removing discussant:', error);
        discussants.splice(index, 0, discussantToRemove); // Revert if error
        discussantLimits[discussantToRemove] = 3; // Revert limit
        alert('حدث خطأ أثناء حذف المناقش');
    }
}

// Add New Discussant
async function addNewDiscussant() {
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
    discussantLimits[name] = 3;
    newDiscussantInput.value = '';
    
    try {
        await saveData('addDiscussant', { 
            discussant: name,
            limit: 3
        });
        openDiscussantsModal();
    } catch (error) {
        console.error('Error adding discussant:', error);
        discussants.pop(); // Revert if error
        delete discussantLimits[name]; // Revert limit
        alert('حدث خطأ أثناء إضافة المناقش');
    }
}

// Update Discussant Limit
async function updateDiscussantLimit() {
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
    
    const originalLimit = discussantLimits[discussant] || 3;
    discussantLimits[discussant] = newLimit;
    
    try {
        await saveData('updateDiscussantLimit', {
            discussant: discussant,
            limit: newLimit
        });
        openDiscussantsModal();
    } catch (error) {
        console.error('Error updating discussant limit:', error);
        discussantLimits[discussant] = originalLimit; // Revert if error
        alert('حدث خطأ أثناء تحديث حد المناقش');
    }
}

// Submit Topic Form
async function submitTopicForm(e) {
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
    
    try {
        await saveData('addTopic', newTopic);
        topicModal.classList.add('hidden');
        topicForm.reset();
        renderTopics();
    } catch (error) {
        console.error('Error adding topic:', error);
        topics[currentYear].pop(); // Revert if error
        alert('حدث خطأ أثناء إضافة الموضوع');
    }
}

// Submit Committee Form
async function submitCommitteeForm(e) {
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
    discussantUsage[firstDiscussant] = (discussantUsage[firstDiscussant] || 0) + 1;
    discussantUsage[secondDiscussant] = (discussantUsage[secondDiscussant] || 0) + 1;
    
    try {
        await saveData('addCommittee', newCommittee);
        committeeModal.classList.add('hidden');
        committeeForm.reset();
        renderCommittees();
    } catch (error) {
        console.error('Error adding committee:', error);
        committees[currentYear].pop(); // Revert if error
        discussantUsage[firstDiscussant]--; // Revert usage
        discussantUsage[secondDiscussant]--; // Revert usage
        alert('حدث خطأ أثناء إضافة اللجنة');
    }
}

// Change Year (same as before)
function changeYear(year) {
    currentYear = year;
    currentYearTitle.textContent = `السنة الجامعية: ${year}`;
    
    yearNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.year === year);
    });
    
    const activeSubpage = document.querySelector('.subpages-tabs button.active').dataset.page;
    if (activeSubpage === 'topics') {
        renderTopics();
    } else {
        renderCommittees();
    }
}

// Change Subpage (same as before)
function changeSubpage(subpage) {
    subpageButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === subpage);
    });
    
    topicsContent.classList.toggle('hidden', subpage !== 'topics');
    committeeContent.classList.toggle('hidden', subpage !== 'committee');
    
    if (subpage === 'topics') {
        renderTopics();
    } else {
        renderCommittees();
    }
}

// Login Function (same as before)
function login() {
    const password = passwordInput.value.trim();
    
    if (validPasswords.includes(password)) {
        currentUser = password;
        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        
        changeYear(currentYear);
        changeSubpage('topics');
        
        loginError.textContent = '';
        passwordInput.value = '';
    } else {
        loginError.textContent = 'كلمة المرور غير صحيحة';
    }
}

// Logout Function (same as before)
function logout() {
    currentUser = null;
    mainContent.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

// Event Listeners (same as before)
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
    
    yearNavButtons.forEach(btn => {
        btn.addEventListener('click', () => changeYear(btn.dataset.year));
    });
    
    subpageButtons.forEach(btn => {
        btn.addEventListener('click', () => changeSubpage(btn.dataset.page));
    });
    
    newTopicBtn.addEventListener('click', () => topicModal.classList.remove('hidden'));
    cancelModalBtn.addEventListener('click', () => topicModal.classList.add('hidden'));
    topicForm.addEventListener('submit', submitTopicForm);
    
    newCommitteeBtn.addEventListener('click', openCommitteeModal);
    cancelCommitteeModalBtn.addEventListener('click', () => committeeModal.classList.add('hidden'));
    committeeForm.addEventListener('submit', submitCommitteeForm);
    
    manageDiscussantsBtn.addEventListener('click', openDiscussantsModal);
    closeDiscussantsModalBtn.addEventListener('click', () => discussantsModal.classList.add('hidden'));
    addDiscussantBtn.addEventListener('click', addNewDiscussant);
    updateLimitBtn.addEventListener('click', updateDiscussantLimit);
    
    downloadExcelBtn.addEventListener('click', downloadAsExcel);
    downloadCommitteeExcelBtn.addEventListener('click', downloadCommitteesAsExcel);
});
