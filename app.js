// Supabase Configuration
const supabaseUrl = 'https://nxiapowjelkojmhfkvpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWFwb3dqZWxrb2ptaGZrdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjg4MjAsImV4cCI6MjA2NDkwNDgyMH0.FXwcIBgxzV9OfHt5PLN2O9swVxKae6yjQYYlJx_yrKs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// State variables
let currentUser = null;
let currentYear = new Date().getFullYear().toString();
let currentTopics = [];
let currentCommittees = [];
let currentDiscussants = [];

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

// Authentication
async function checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .single();

        currentUser = {
            email: session.user.email,
            role: userData?.role || 'user'
        };
        
        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        loadInitialData();
    }
}

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
        
        // First check if user exists in our users table
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (userError || !user) {
            throw new Error('Invalid credentials');
        }

        // Then sign in with Supabase Auth
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;

        currentUser = {
            email: email,
            role: user.role
        };

        loginPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        loadInitialData();
        
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function handleLogout() {
    supabase.auth.signOut();
    currentUser = null;
    loginPage.classList.remove('hidden');
    mainContent.classList.add('hidden');
}

// Data Loading
async function loadInitialData() {
    currentYearTitle.textContent = `نظام إدارة مواضيع التخرج - ${currentYear}`;
    await Promise.all([
        loadTopics(),
        loadCommittees(),
        loadDiscussants()
    ]);
}

async function loadTopics() {
    try {
        loadingSpinner.classList.remove('hidden');
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('year', currentYear)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        currentTopics = data || [];
        renderTopics();
    } catch (error) {
        console.error('Error loading topics:', error);
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

async function loadCommittees() {
    try {
        const { data, error } = await supabase
            .from('committees')
            .select('*, topics(title)')
            .eq('year', currentYear);

        if (error) throw error;
        
        currentCommittees = data || [];
        renderCommittees();
    } catch (error) {
        console.error('Error loading committees:', error);
    }
}

async function loadDiscussants() {
    try {
        const { data, error } = await supabase
            .from('discussants')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        
        currentDiscussants = data || [];
    } catch (error) {
        console.error('Error loading discussants:', error);
    }
}

// Data Manipulation
async function addTopic(topicData) {
    try {
        loadingSpinner.classList.remove('hidden');
        const { error } = await supabase
            .from('topics')
            .insert([{
                ...topicData,
                year: currentYear,
                added_by: currentUser.email,
                status: 'pending'
            }]);

        if (error) throw error;
        
        await loadTopics();
        topicModal.classList.add('hidden');
        topicForm.reset();
    } catch (error) {
        console.error('Error adding topic:', error);
        alert('حدث خطأ أثناء إضافة الموضوع');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

async function addCommittee(committeeData) {
    try {
        loadingSpinner.classList.remove('hidden');
        const { error } = await supabase
            .from('committees')
            .insert([{
                ...committeeData,
                year: currentYear,
                added_by: currentUser.email
            }]);

        if (error) throw error;
        
        await loadCommittees();
        committeeModal.classList.add('hidden');
        committeeForm.reset();
    } catch (error) {
        console.error('Error adding committee:', error);
        alert('حدث خطأ أثناء إضافة اللجنة');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Render Functions
function renderTopics() {
    topicsList.innerHTML = '';
    
    if (currentTopics.length === 0) {
        topicsList.innerHTML = '<p class="no-topics">لا توجد مواضيع مسجلة بعد</p>';
        downloadExcelBtn.classList.add('hidden');
        return;
    }
    
    if (isAdmin()) {
        downloadExcelBtn.classList.remove('hidden');
    } else {
        downloadExcelBtn.classList.add('hidden');
    }

    const filteredTopics = isAdmin() 
        ? currentTopics 
        : currentTopics.filter(t => t.added_by === currentUser.email);

    if (filteredTopics.length === 0) {
        topicsList.innerHTML = '<p class="no-topics">لا توجد مواضيع مسجلة لك</p>';
        return;
    }

    filteredTopics.forEach(topic => {
        const statusClass = `status-${topic.status}`;
        const statusText = {
            'pending': 'قيد المراجعة',
            'accepted': 'مقبول',
            'rejected': 'مؤجل'
        }[topic.status];

        const topicCard = document.createElement('div');
        topicCard.className = `card topic-card`;
        topicCard.innerHTML = `
            <h3>${topic.title}</h3>
            <p><strong>المؤطر:</strong> ${topic.supervisor}</p>
            <div class="topic-meta">
                <span class="topic-profile">${topic.profile}</span>
                <span class="topic-status ${statusClass}">${statusText}</span>
            </div>
            <div class="topic-actions">
                ${isAdmin() ? `
                <button class="action-btn accept-btn" onclick="updateTopicStatus(${topic.id}, 'accepted')">قبول</button>
                <button class="action-btn reject-btn" onclick="updateTopicStatus(${topic.id}, 'rejected')">تأجيل</button>
                ` : ''}
                <button class="action-btn delete-btn" onclick="deleteTopic(${topic.id})">حذف</button>
            </div>
        `;
        topicsList.appendChild(topicCard);
    });
}

function renderCommittees() {
    committeeList.innerHTML = '';
    
    if (currentCommittees.length === 0) {
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

    const filteredCommittees = isAdmin()
        ? currentCommittees
        : currentCommittees.filter(c => c.added_by === currentUser.email);

    if (filteredCommittees.length === 0) {
        committeeList.innerHTML = '<p class="no-topics">لا توجد لجان مناقشة مسجلة لك</p>';
        return;
    }

    filteredCommittees.forEach(committee => {
        const committeeCard = document.createElement('div');
        committeeCard.className = 'committee-card card';
        
        committeeCard.innerHTML = `
            <h3>${committee.topics?.title || 'موضوع غير معروف'}</h3>
            <div class="committee-meta">
                <p><strong>المناقش الأول:</strong> ${committee.first_discussant}</p>
                <p><strong>المناقش الثاني:</strong> ${committee.second_discussant}</p>
            </div>
            <div class="topic-actions">
                <button class="action-btn delete-btn" onclick="deleteCommittee(${committee.id})">حذف</button>
            </div>
        `;
        committeeList.appendChild(committeeCard);
    });
}

async function renderDiscussantsModal() {
    discussantsList.innerHTML = '';
    discussantToLimitSelect.innerHTML = '<option value="">اختر المناقش</option>';
    
    currentDiscussants.forEach(discussant => {
        // Add to list
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${discussant.name} (الحد الأقصى: ${discussant.max_usage || 2})</span>
            <button class="secondary-btn" onclick="deleteDiscussant(${discussant.id})">حذف</button>
        `;
        discussantsList.appendChild(li);
        
        // Add to dropdown
        const option = document.createElement('option');
        option.value = discussant.id;
        option.textContent = discussant.name;
        discussantToLimitSelect.appendChild(option);
    });
}

// Form Handlers
async function handleTopicSubmit(e) {
    e.preventDefault();
    
    const supervisor = supervisorInput.value.trim();
    const title = topicTitleInput.value.trim();
    const profile = topicProfileSelect.value;
    
    if (!supervisor || !title || !profile) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    await addTopic({
        title,
        supervisor,
        profile
    });
}

async function handleCommitteeSubmit(e) {
    e.preventDefault();
    
    const topicId = committeeTopicSelect.value;
    const firstDiscussant = firstDiscussantSelect.value;
    const secondDiscussant = secondDiscussantSelect.value;
    
    if (!topicId || !firstDiscussant || !secondDiscussant) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    if (firstDiscussant === secondDiscussant) {
        alert('يجب اختيار مناقشين مختلفين');
        return;
    }
    
    await addCommittee({
        topic_id: topicId,
        first_discussant: firstDiscussant,
        second_discussant: secondDiscussant
    });
}

// Helper Functions
function isAdmin() {
    return currentUser?.role === 'admin';
}

async function populateCommitteeForm() {
    try {
        loadingSpinner.classList.remove('hidden');
        committeeTopicSelect.innerHTML = '<option value="">اختر الموضوع</option>';
        
        // Get accepted topics
        const { data: topics } = await supabase
            .from('topics')
            .select('id, title, supervisor')
            .eq('year', currentYear)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = `${topic.title} (${topic.supervisor})`;
            committeeTopicSelect.appendChild(option);
        });
        
        // Populate discussants
        firstDiscussantSelect.innerHTML = '<option value="">اختر المناقش الأول</option>';
        secondDiscussantSelect.innerHTML = '<option value="">اختر المناقش الثاني</option>';
        
        currentDiscussants.forEach(discussant => {
            const option1 = document.createElement('option');
            option1.value = discussant.name;
            option1.textContent = discussant.name;
            firstDiscussantSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = discussant.name;
            option2.textContent = discussant.name;
            secondDiscussantSelect.appendChild(option2);
        });
        
        committeeModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error populating committee form:', error);
        alert('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Delete Functions
window.deleteTopic = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الموضوع؟')) return;
    
    try {
        loadingSpinner.classList.remove('hidden');
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        await loadTopics();
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
        const { error } = await supabase
            .from('committees')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        await loadCommittees();
    } catch (error) {
        console.error('Error deleting committee:', error);
        alert('حدث خطأ أثناء الحذف');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

window.deleteDiscussant = async function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المناقش؟')) return;
    
    try {
        loadingSpinner.classList.remove('hidden');
        const { error } = await supabase
            .from('discussants')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        await loadDiscussants();
        await renderDiscussantsModal();
    } catch (error) {
        console.error('Error deleting discussant:', error);
        alert('حدث خطأ أثناء الحذف');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

// Status Updates
window.updateTopicStatus = async function(id, status) {
    try {
        loadingSpinner.classList.remove('hidden');
        const { error } = await supabase
            .from('topics')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        
        await loadTopics();
    } catch (error) {
        console.error('Error updating topic status:', error);
        alert('حدث خطأ أثناء التحديث');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
};

// Excel Export
window.downloadTopicsExcel = async function() {
    try {
        loadingSpinner.classList.remove('hidden');
        
        const data = currentTopics.map(topic => ({
            'لقب المؤطر': topic.supervisor,
            'الموضوع': topic.title,
            'الملمح': topic.profile,
            'الحالة': topic.status === 'accepted' ? 'مقبول' : 
                     topic.status === 'rejected' ? 'مؤجل' : 'قيد المراجعة',
            'تاريخ الإضافة': new Date(topic.created_at).toLocaleString('ar-EG')
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
};

window.downloadCommitteesExcel = async function() {
    try {
        loadingSpinner.classList.remove('hidden');
        
        const data = currentCommittees.map(committee => ({
            'الموضوع': committee.topics?.title || 'غير معروف',
            'المناقش الأول': committee.first_discussant,
            'المناقش الثاني': committee.second_discussant,
            'تاريخ الإضافة': new Date(committee.created_at).toLocaleString('ar-EG')
        }));
        
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
};

// Event Listeners
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
            loadInitialData();
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
        });
    });

    // Topic Management
    newTopicBtn.addEventListener('click', () => {
        topicModal.classList.remove('hidden');
        topicForm.reset();
    });
    
    cancelModalBtn.addEventListener('click', () => {
        topicModal.classList.add('hidden');
    });
    
    topicForm.addEventListener('submit', handleTopicSubmit);

    // Committee Management
    newCommitteeBtn.addEventListener('click', populateCommitteeForm);
    
    cancelCommitteeModalBtn.addEventListener('click', () => {
        committeeModal.classList.add('hidden');
    });
    
    committeeForm.addEventListener('submit', handleCommitteeSubmit);

    // Discussant Management
    manageDiscussantsBtn.addEventListener('click', async () => {
        await renderDiscussantsModal();
        discussantsModal.classList.remove('hidden');
    });
    
    closeDiscussantsModalBtn.addEventListener('click', () => {
        discussantsModal.classList.add('hidden');
    });
    
    addDiscussantBtn.addEventListener('click', async () => {
        const name = newDiscussantInput.value.trim();
        if (!name) return;
        
        try {
            loadingSpinner.classList.remove('hidden');
            const { error } = await supabase
                .from('discussants')
                .insert([{ name }]);

            if (error) throw error;
            
            newDiscussantInput.value = '';
            await loadDiscussants();
            await renderDiscussantsModal();
        } catch (error) {
            console.error('Error adding discussant:', error);
            alert('حدث خطأ أثناء الإضافة');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });
    
    updateLimitBtn.addEventListener('click', async () => {
        const discussantId = discussantToLimitSelect.value;
        const maxUsage = parseInt(maxDiscussantUsageSelect.value);
        
        if (!discussantId) return;
        
        try {
            loadingSpinner.classList.remove('hidden');
            const { error } = await supabase
                .from('discussants')
                .update({ max_usage: maxUsage })
                .eq('id', discussantId);

            if (error) throw error;
            
            await loadDiscussants();
            await renderDiscussantsModal();
            alert('تم تحديث الحد الأقصى بنجاح');
        } catch (error) {
            console.error('Error updating limit:', error);
            alert('حدث خطأ أثناء التحديث');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    // Excel Downloads
    downloadExcelBtn.addEventListener('click', downloadTopicsExcel);
    downloadCommitteeExcelBtn.addEventListener('click', downloadCommitteesExcel);
}
