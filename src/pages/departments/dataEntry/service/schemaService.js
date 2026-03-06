import api from '../../../../services/api.js';
import { getFallbackSchema, getAllFallbackDepartments } from '../departmentSchema.jsx';

export const schemaService = {
    /**
     * Get schema for current user's department
     */
    async getDepartmentSchema(deptCode) {
        try {
            console.log('Fetching schema for:', deptCode);
            const response = await api.get(`/schemas/${deptCode}`);
            console.log('Schema response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching schema, using fallback:', error);

            // Use fallback schema based on department code
            const fallbackSchema = getFallbackSchema(deptCode);
            console.log('Using fallback schema:', fallbackSchema);

            // Add a toast notification to inform user
            if (typeof window !== 'undefined' && window.addToast) {
                window.addToast('Mode dégradé: utilisation des schémas par défaut', 'warning', 5000);
            }

            return fallbackSchema;
        }
    },

    /**
     * Get all available departments with their schemas
     */
    async getAllDepartments() {
        try {
            const response = await api.get('/schemas');
            return response.data;
        } catch (error) {
            console.error('Error fetching departments, using fallback:', error);
            return getAllFallbackDepartments();
        }
    },

    /**
     * Get numeric fields for a department
     */
    async getNumericFields(deptCode) {
        try {
            const schema = await this.getDepartmentSchema(deptCode);
            return schema.fields.filter(f => f.type === 'number');
        } catch (error) {
            console.error('Error getting numeric fields:', error);
            const fallback = getFallbackSchema(deptCode);
            return fallback.fields.filter(f => f.type === 'number');
        }
    },

    /**
     * Get fields for table display
     */
    async getTableFields(deptCode) {
        try {
            const schema = await this.getDepartmentSchema(deptCode);
            return schema.fields;
        } catch (error) {
            console.error('Error getting table fields:', error);
            const fallback = getFallbackSchema(deptCode);
            return fallback.fields;
        }
    },

    /**
     * Get department color
     */
    async getDepartmentColor(deptCode) {
        try {
            const schema = await this.getDepartmentSchema(deptCode);
            return schema.color || 'from-cyan-600 to-blue-600';
        } catch (error) {
            const fallback = getFallbackSchema(deptCode);
            return fallback.color || 'from-cyan-600 to-blue-600';
        }
    }
};