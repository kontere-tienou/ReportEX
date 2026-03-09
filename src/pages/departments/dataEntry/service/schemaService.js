import api from '../../../../services/api.js';
import { getFallbackSchema, getAllFallbackDepartments } from '../departmentSchema.jsx';

export const schemaService = {
    /**
     * Get schema for current user's department
     */
    async getDepartmentSchema(deptCode) {
        try {
            if (!deptCode) {
                throw new Error('Department code is required');
            }
            // Clean the department code
            const cleanCode = deptCode.trim().toUpperCase();
            const response = await api.get(`/schemas/${cleanCode}`);

            if (!response.data) {
                throw new Error('No schema data received');
            }
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching schema:', error);
            throw new Error(`Schema not found for department: ${deptCode}`);
        }
    },

    /**
     * Get schema with fallback for UI components that can handle it
     */
    async getDepartmentSchemaWithFallback(deptCode) {
        try {
            return await this.getDepartmentSchema(deptCode);
        } catch (error) {
            console.warn('Using fallback schema for:', deptCode);

            const fallbackSchema = getFallbackSchema(deptCode);

            // Only show toast in browser environment for non-critical components
            if (typeof window !== 'undefined' && window.addToast &&
                // Don't show for data pages, only for UI components
                !window.location.pathname.includes('/data')) {
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
     * Get numeric fields for a department - with fallback for UI
     */
    async getNumericFields(deptCode) {
        try {
            const schema = await this.getDepartmentSchemaWithFallback(deptCode);
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
    },

    /**
     * Validate if a department code exists
     */
    async validateDepartmentCode(deptCode) {
        try {
            await this.getDepartmentSchema(deptCode);
            return true;
        } catch (error) {
            return false;
        }
    }
};