// utils/departmentUtils.js
import { departmentCodeMap } from './departmentMapping';

/**
 * Resolve department code from multiple sources
 */
export const resolveDepartmentCode = (deptName, user) => {

    // Priority 1: From URL with mapping
    if (deptName) {
        const mappedCode = departmentCodeMap[deptName.toLowerCase()];
        if (mappedCode) {
            return mappedCode;
        }
        // Try uppercase directly
        const upperCode = deptName.toUpperCase();
        return upperCode;
    }

    // Priority 2: From user object
    if (user?.department?.code) {
        const userCode = user.department.code.toUpperCase();
        return userCode;
    }

    // Priority 3: From user department name
    if (user?.department?.name) {
        // Try to find in reverse mapping
        const reverseEntry = Object.entries(departmentCodeMap).find(
            ([key, value]) => value === user.department.name.toUpperCase()
        );
        if (reverseEntry) {
            return reverseEntry[1];
        }
    }

    console.error('❌ Could not resolve department code');
    return null;
};

/**
 * Validate if a department code exists in backend
 */
export const validateDepartmentCode = async (deptCode) => {
    if (!deptCode) return false;

    try {
        // You can add a validation endpoint or check against known codes
        const validCodes = [
            'IMPRESSION', 'CONFECTION', 'TEINTURE', 'PRODUCTION',
            'INFORMATIQUE', 'RH', 'ACHATS', 'BUREAU_ETUDE', 'COMMERCIAL',
            'COMPTABILITE', 'DG'
        ];
        return validCodes.includes(deptCode);
    } catch (error) {
        return false;
    }
};