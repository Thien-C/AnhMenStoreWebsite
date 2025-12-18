const BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'http://localhost:3000'; // For admin pages

class API {
    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    static async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { message: "Lỗi kết nối Server" };
        }
    }

    static async post(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { message: "Lỗi kết nối Server" };
        }
    }

    // --- BỔ SUNG THÊM 2 HÀM NÀY ---
    static async put(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { message: "Lỗi kết nối Server" };
        }
    }
    
    static async delete(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { message: "Lỗi kết nối Server" };
        }
    }
}