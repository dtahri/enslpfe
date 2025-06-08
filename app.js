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

// Password to email mapping
const userCredentials = {
    'RgT2025EnSl': 'admin@thesis.com',
    'A3$dF': 'user1@thesis.com',
    'zX#7k': 'user2@thesis.com',
    'm9@Lp': 'user3@thesis.com',
    'Q2!vB': 'user4@thesis.com'
};

// Login Function
async function login() {
    const password = passwordInput.value.trim();
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
        currentUser = password;
        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        loadSavedData();
        loginError.textContent = '';
        passwordInput.value = '';
    }
}

// Logout Function
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        currentUser = null;
        mainContent.classList.add('hidden');
        loginPage.classList.remove('hidden');
    }
}

// Load Data from Supabase
async function loadSavedData() {
    try {
        // Load topics for current year
        const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select('*')
            .eq('year', currentYear);
        
        if (topicsError) throw topicsError;

        // Load committees for current year
        const { data: committeesData, error: committeesError } = await supabase
            .from('committees')
            .select('*')
            .eq('year', currentYear);
        
        if (committeesError) throw committeesError;

        // Load discussants
        const { data: discussantsData, error: discussantsError } = await supabase
            .from('discussants')
            .select('*');
        
        if (discussantsError) throw discussantsError;

        // Update UI
        renderTopics(topicsData || []);
        renderCommittees(committeesData || []);
        
        // Initialize discussant limits and usage
        discussantsData.forEach(discussant => {
            if (!discussantLimits[discussant.name]) {
                discussantLimits[discussant.name] = discussant.maxUsage || 3;
            }
        });
        updateDiscussantUsage();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save Topic to Supabase
async function saveTopic(topic) {
    try {
        const { error } = await supabase
            .from('topics')
            .upsert([{ ...topic, year: currentYear }]);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error saving topic:', error);
        return false;
    }
}

// Save Committee to Supabase
async function saveCommittee(committee) {
    try {
        const { error } = await supabase
            .from('committees')
            .upsert([{ ...committee, year: currentYear }]);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error saving committee:', error);
        return false;
    }
}

// Save Discussant to Supabase
async function saveDiscussant(discussant) {
    try {
        const { error } = await supabase
            .from('discussants')
            .upsert([{ name: discussant, maxUsage: 3 }]);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error saving discussant:', error);
        return false;
    }
}

// Update Discussant Limit in Supabase
async function updateDiscussantLimitInDB(discussant, newLimit) {
    try {
        const { error } = await supabase
            .from('discussants')
            .update({ maxUsage: newLimit })
            .eq('name', discussant);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating discussant limit:', error);
        return false;
    }
}

// Delete Topic from Supabase
async function deleteTopicFromDB(topicId) {
    try {
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', topicId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting topic:', error);
        return false;
    }
}

// Delete Committee from Supabase
async function deleteCommitteeFromDB(committeeId) {
    try {
        const { error } = await supabase
            .from('committees')
            .delete()
            .eq('id', committeeId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting committee:', error);
        return false;
    }
}

// Delete Discussant from Supabase
async function deleteDiscussantFromDB(discussantName) {
    try {
        const { error } = await supabase
            .from('discussants')
            .delete()
            .eq('name', discussantName);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting discussant:', error);
        return false;
    }
}

// Update Discussant Usage Count
async function updateDiscussantUsage() {
    try {
        const { data: committeesData, error } = await supabase
            .from('committees')
            .select('firstDiscussant, secondDiscussant');
        
        if (error) throw error;

        const usage = {};
        committeesData.forEach(committee => {
            usage[committee.firstDiscussant] = (usage[committee.firstDiscussant] || 0) + 1;
            usage[committee.secondDiscussant] = (usage[committee.secondDiscussant] || 0) + 1;
        });

        discussantUsage = usage;
    } catch (error) {
        console.error('Error updating discussant usage:', error);
    }
}

// Render Topics
async function renderTopics(topicsData) {
    topicsList.innerHTML = '';
    
    if (!topicsData || topicsData.length === 0) {
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
        ? topicsData 
        : topicsData.filter(topic => topic.addedBy === currentUser);
    
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
            deleteBtn.onclick = () => deleteTopic(topic.id);
            actionsDiv.appendChild(deleteBtn);
        }
        
        if (currentUser === 'RgT2025EnSl') {
            if (topic.status !== 'accepted') {
                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'action-btn accept-btn';
                acceptBtn.innerHTML = '✓ مقبول';
                acceptBtn.onclick = () => updateTopicStatus(topic.id, 'accepted');
                actionsDiv.appendChild(acceptBtn);
            }
            
            if (topic.status !== 'rejected') {
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'action-btn reject-btn';
                rejectBtn.innerHTML = '✗ مؤجل';
                rejectBtn.onclick = () => updateTopicStatus(topic.id, 'rejected');
                actionsDiv.appendChild(rejectBtn);
            }
            
            const changeProfileBtn = document.createElement('button');
            changeProfileBtn.className = 'action-btn change-profile-btn';
            changeProfileBtn.innerHTML = 'تغيير الملمح';
            changeProfileBtn.onclick = () => changeTopicProfile(topic.id);
            actionsDiv.appendChild(changeProfileBtn);
        }
        
        if (actionsDiv.children.length > 0) {
            topicCard.appendChild(actionsDiv);
        }
        
        topicsList.appendChild(topicCard);
    });
}

// Render Committees
async function renderCommittees(committeesData) {
    committeeList.innerHTML = '';
    
    if (currentUser === 'RgT2025EnSl') {
        downloadCommitteeExcelBtn.classList.remove('hidden');
        manageDiscussantsBtn.classList.remove('hidden');
    } else {
        downloadCommitteeExcelBtn.classList.add('hidden');
        manageDiscussantsBtn.classList.add('hidden');
    }
    
    if (!committeesData || committeesData.length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة بعد</p>';
        return;
    }
    
    // Filter committees to show only current user's committees (unless admin)
    const userCommittees = currentUser === 'RgT2025EnSl' 
        ? committeesData 
        : committeesData.filter(committee => committee.addedBy === currentUser);
    
    if (userCommittees.length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة لك</p>';
        return;
    }
    
    userCommittees.forEach((committee, index) => {
        const committeeCard = document.createElement('div');
        committeeCard.className = 'committee-card';
        
        committeeCard.innerHTML = `
            <h3>${committee.topic}</h3>
            <div class="committee-meta">
                <p><strong>المناقش الأول:</strong> ${committee.firstDiscussant}</p>
                <p><strong>المناقش الثاني:</strong> ${committee.secondDiscussant}</p>
                <p><strong>المؤطر:</strong> ${committee.supervisor || 'غير معروف'}</p>
                <p><strong>الملمح:</strong> ${committee.profile || 'غير معروف'}</p>
            </div>
        `;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'topic-actions';
        
        if (committee.addedBy === currentUser || currentUser === 'RgT2025EnSl') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = 'حذف';
            deleteBtn.onclick = () => deleteCommittee(committee.id);
            actionsDiv.appendChild(deleteBtn);
        }
        
        committeeCard.appendChild(actionsDiv);
        committeeList.appendChild(committeeCard);
    });
}

// Delete Topic
async function deleteTopic(topicId) {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
        const success = await deleteTopicFromDB(topicId);
        if (success) {
            loadSavedData();
        }
    }
}

// Delete Committee
async function deleteCommittee(committeeId) {
    if (confirm('هل أنت متأكد من حذف هذه اللجنة؟')) {
        const success = await deleteCommitteeFromDB(committeeId);
        if (success) {
            await updateDiscussantUsage();
            loadSavedData();
        }
    }
}

// Update Topic Status
async function updateTopicStatus(topicId, status) {
    try {
        const { error } = await supabase
            .from('topics')
            .update({ status })
            .eq('id', topicId);
        
        if (!error) {
            loadSavedData();
        }
    } catch (error) {
        console.error('Error updating topic status:', error);
    }
}

// Change Topic Profile
async function changeTopicProfile(topicId) {
    const newProfile = prompt('اختر الملمح الجديد:\n1. متوسط\n2. ثانوي');
    
    if (newProfile && ['متوسط', 'ثانوي'].includes(newProfile)) {
        try {
            const { error } = await supabase
                .from('topics')
                .update({ profile: newProfile })
                .eq('id', topicId);
            
            if (!error) {
                loadSavedData();
            }
        } catch (error) {
            console.error('Error updating topic profile:', error);
        }
    } else if (newProfile) {
        alert('الرجاء اختيار "متوسط" أو "ثانوي" فقط');
    }
}

// Open Committee Modal
async function openCommitteeModal() {
    // Fill topics select with only current user's accepted topics (or all if admin)
    committeeTopicSelect.innerHTML = '<option value="">اختر الموضوع</option>';
    
    try {
        const { data: topicsData, error } = await supabase
            .from('topics')
            .select('*')
            .eq('year', currentYear)
            .eq('status', 'accepted');
        
        if (!error) {
            const userTopics = currentUser === 'RgT2025EnSl' 
                ? topicsData 
                : topicsData.filter(topic => topic.addedBy === currentUser);
            
            userTopics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.title;
                option.textContent = topic.title;
                committeeTopicSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading topics:', error);
    }
    
    // Fill discussants selects
    updateDiscussantSelects();
    committeeModal.classList.remove('hidden');
}

// Update Discussant Selects with limits enforcement
async function updateDiscussantSelects() {
    firstDiscussantSelect.innerHTML = '<option value="">اختر المناقش الأول</option>';
    secondDiscussantSelect.innerHTML = '<option value="">اختر المناقش الثاني</option>';
    
    try {
        const { data: discussantsData, error } = await supabase
            .from('discussants')
            .select('*');
        
        if (!error) {
            discussantsData.forEach(discussant => {
                const count = discussantUsage[discussant.name] || 0;
                const limit = discussantLimits[discussant.name] || 3;
                const disabled = count >= limit;
                
                const option1 = document.createElement('option');
                option1.value = discussant.name;
                option1.textContent = `${discussant.name} (${count}/${limit})`;
                option1.disabled = disabled;
                firstDiscussantSelect.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = discussant.name;
                option2.textContent = `${discussant.name} (${count}/${limit})`;
                option2.disabled = disabled;
                secondDiscussantSelect.appendChild(option2);
            });
        }
    } catch (error) {
        console.error('Error loading discussants:', error);
    }
    
    // Make dropdowns scrollable
    firstDiscussantSelect.size = 10;
    secondDiscussantSelect.size = 10;
}

// Open Discussants Management Modal
async function openDiscussantsModal() {
    discussantsList.innerHTML = '';
    
    try {
        const { data: discussantsData, error } = await supabase
            .from('discussants')
            .select('*');
        
        if (!error) {
            // Populate discussants list
            discussantsData.forEach((discussant, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${discussant.name}</span>
                    <span class="remove-discussant" data-name="${discussant.name}">×</span>
                `;
                discussantsList.appendChild(li);
            });
            
            // Set up remove discussant events
            document.querySelectorAll('.remove-discussant').forEach(btn => {
                btn.addEventListener('click', function() {
                    const discussantName = this.getAttribute('data-name');
                    
                    // Check if discussant is in use
                    if (discussantUsage[discussantName] > 0) {
                        alert('لا يمكن حذف هذا المناقش لأنه مستخدم في لجان حالية');
                        return;
                    }
                    
                    if (confirm(`هل أنت متأكد من حذف ${discussantName}؟`)) {
                        deleteDiscussant(discussantName);
                    }
                });
            });
            
            // Populate discussant limit controls
            discussantToLimitSelect.innerHTML = '<option value="">اختر المناقش</option>';
            discussantsData.forEach(discussant => {
                const option = document.createElement('option');
                option.value = discussant.name;
                option.textContent = discussant.name;
                discussantToLimitSelect.appendChild(option);
            });
            
            discussantToLimitSelect.disabled = discussantsData.length === 0;
            maxDiscussantUsageSelect.disabled = discussantsData.length === 0;
            updateLimitBtn.disabled = discussantsData.length === 0;
            
            // Set up discussant limit change
            discussantToLimitSelect.addEventListener('change', function() {
                if (this.value) {
                    const currentLimit = discussantLimits[this.value] || 3;
                    maxDiscussantUsageSelect.value = currentLimit;
                }
            });
        }
    } catch (error) {
        console.error('Error loading discussants:', error);
    }
    
    discussantsModal.classList.remove('hidden');
}

// Add New Discussant
async function addNewDiscussant() {
    const name = newDiscussantInput.value.trim();
    
    if (!name) {
        alert('الرجاء إدخال اسم المناقش');
        return;
    }
    
    try {
        // Check if discussant already exists
        const { data: existingDiscussant, error: checkError } = await supabase
            .from('discussants')
            .select('*')
            .eq('name', name)
            .single();
        
        if (existingDiscussant && !checkError) {
            alert('هذا المناقش موجود بالفعل!');
            return;
        }
        
        // Add new discussant
        const { error } = await supabase
            .from('discussants')
            .insert([{ name, maxUsage: 3 }]);
        
        if (!error) {
            newDiscussantInput.value = '';
            openDiscussantsModal();
        }
    } catch (error) {
        console.error('Error adding discussant:', error);
    }
}

// Delete Discussant
async function deleteDiscussant(discussantName) {
    const success = await deleteDiscussantFromDB(discussantName);
    if (success) {
        openDiscussantsModal();
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
    
    const success = await updateDiscussantLimitInDB(discussant, newLimit);
    if (success) {
        discussantLimits[discussant] = newLimit;
        openDiscussantsModal();
    }
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
    loadSavedData();
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
}

// Download Topics as Excel
function downloadAsExcel() {
    // Get current topics
    const topicsForExcel = document.querySelectorAll('.topic-card');
    const excelData = Array.from(topicsForExcel).map(topicCard => {
        return {
            'لقب المؤطر': topicCard.querySelector('p').textContent.replace('المؤطر:', '').trim(),
            'الموضوع': topicCard.querySelector('h3').textContent,
            'الملمح': topicCard.querySelector('.topic-profile').textContent,
            'الحالة': topicCard.querySelector('.topic-status').textContent,
            'تاريخ الإضافة': new Date().toLocaleString('ar-EG')
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المواضيع');
    XLSX.writeFile(workbook, `مواضيع_${currentYear}.xlsx`);
}

// Download Committees as Excel
function downloadCommitteesAsExcel() {
    // Get current committees
    const committeesForExcel = document.querySelectorAll('.committee-card');
    const excelData = Array.from(committeesForExcel).map(committeeCard => {
        const metaElements = committeeCard.querySelectorAll('.committee-meta p');
        return {
            'الموضوع': committeeCard.querySelector('h3').textContent,
            'المناقش الأول': metaElements[0].textContent.replace('المناقش الأول:', '').trim(),
            'المناقش الثاني': metaElements[1].textContent.replace('المناقش الثاني:', '').trim(),
            'المؤطر': metaElements[2].textContent.replace('المؤطر:', '').trim(),
            'الملمح': metaElements[3].textContent.replace('الملمح:', '').trim()
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'لجان المناقشة');
    XLSX.writeFile(workbook, `لجان_المناقشة_${currentYear}.xlsx`);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            // Find which password matches this email
            const password = Object.keys(userCredentials).find(
                key => userCredentials[key] === session.user.email
            );
            
            if (password) {
                currentUser = password;
                mainContent.classList.remove('hidden');
                loginPage.classList.add('hidden');
                loadSavedData();
            }
        }
    });

    // Event listeners
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

// Global variables for discussant management
let discussantLimits = {};
let discussantUsage = {};
