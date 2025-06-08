// SheetDB.js - Complete Google Sheets Database Handler
class SheetDB {
    // Configuration
    static config = {
        apiBase: 'https://opensheet.elk.sh',
        sheetIds: {
            topics: 'https://docs.google.com/spreadsheets/d/1-6xM4sGfzGv2UX0ovo_jHLf5RC1FOoitBeyHTjaZns0/edit?usp=sharing',
            committees: 'https://docs.google.com/spreadsheets/d/1_c33hENM9uRwGnfxnBc_0ol86vD5x1t3mFT-tlRjNpc/edit?usp=sharing',
            discussants: 'https://docs.google.com/spreadsheets/d/1RoV8gTJlMluZqKIpD9eWu1PidDE3v6bimZ_8_8nbqEo/edit?usp=sharing',
            users: '1YOUR_USERS_SHEET_ID'
        },
        cache: {
            enabled: true,
            duration: 30000 // 30 seconds
        }
    };

    // Cache storage
    static cache = {
        topics: { data: null, timestamp: 0 },
        committees: { data: null, timestamp: 0 },
        discussants: { data: null, timestamp: 0 }
    };

    // ========================
    // CORE METHODS
    // ========================

    static async fetchSheet(sheetName) {
        // Check cache first
        if (this.config.cache.enabled && 
            this.cache[sheetName] && 
            Date.now() - this.cache[sheetName].timestamp < this.config.cache.duration) {
            return this.cache[sheetName].data;
        }

        try {
            const url = `${this.config.apiBase}/${this.config.sheetIds[sheetName]}/${sheetName}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            // Update cache
            if (this.config.cache.enabled) {
                this.cache[sheetName] = {
                    data: data,
                    timestamp: Date.now()
                };
            }
            
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${sheetName}:`, error);
            return [];
        }
    }

    static async appendToSheet(sheetName, record) {
        try {
            const url = `${this.config.apiBase}/${this.config.sheetIds[sheetName]}/${sheetName}/append`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([record])
            });
            
            // Invalidate cache
            if (this.config.cache.enabled) {
                this.cache[sheetName].timestamp = 0;
            }
            
            return response.ok;
        } catch (error) {
            console.error(`Failed to append to ${sheetName}:`, error);
            return false;
        }
    }

    // ========================
    // TOPICS METHODS
    // ========================

    static async getTopics(year = null) {
        const topics = await this.fetchSheet('topics');
        return year ? topics.filter(t => t.year === year) : topics;
    }

    static async addTopic(topicData) {
        const completeData = {
            ...topicData,
            id: `topic-${Date.now()}`,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        return await this.appendToSheet('topics', completeData);
    }

    static async updateTopicStatus(topicId, newStatus) {
        // Note: Requires Google Apps Script backend for full implementation
        console.warn("Update functionality requires backend implementation");
        return false;
    }

    // ========================
    // COMMITTEES METHODS
    // ========================

    static async getCommittees(year = null) {
        const committees = await this.fetchSheet('committees');
        return year ? committees.filter(c => c.year === year) : committees;
    }

    static async addCommittee(committeeData) {
        const completeData = {
            ...committeeData,
            id: `committee-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        return await this.appendToSheet('committees', completeData);
    }

    // ========================
    // DISCUSSANTS METHODS
    // ========================

    static async getDiscussants() {
        return await this.fetchSheet('discussants');
    }

    static async addDiscussant(name) {
        return await this.appendToSheet('discussants', {
            id: `discussant-${Date.now()}`,
            name: name,
            maxUsage: 3
        });
    }

    // ========================
    // AUTHENTICATION
    // ========================

    static async validateUser(password) {
        try {
            const users = await this.fetchSheet('users');
            return users.find(u => u.password === password);
        } catch (error) {
            console.error("Authentication failed:", error);
            return null;
        }
    }
}

// Fallback to localStorage if sheets fail
class LocalFallback {
    static storageKey = 'thesisSystemFallback';
    
    static async getData(type) {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        return data[type] || [];
    }
    
    static async saveData(type, newData) {
        const currentData = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        currentData[type] = [...(currentData[type] || []), newData];
        localStorage.setItem(this.storageKey, JSON.stringify(currentData));
        return true;
    }
}

// Export with fallback mechanism
export default (async function() {
    // Test connection to sheets
    try {
        await SheetDB.fetchSheet('topics');
        return SheetDB;
    } catch (e) {
        console.warn("Falling back to localStorage");
        return LocalFallback;
    }
})();
