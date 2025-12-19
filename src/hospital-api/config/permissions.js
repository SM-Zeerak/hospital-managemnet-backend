/**
 * Hospital API Permissions Configuration
 * 
 * This file defines all available permissions organized by modules.
 * Each permission follows the pattern: module:action
 * 
 * Examples:
 * - staff:create - Can create staff
 * - staff:view - Can view staff
 * - patient:create - Can create patients
 */

export const PERMISSIONS = {
    // Staff Management Permissions
    STAFF: {
        CREATE: 'staff:create',
        VIEW: 'staff:view',
        UPDATE: 'staff:update',
        DELETE: 'staff:delete',
        LIST: 'staff:list'
    },

    // Patient Management Permissions
    PATIENT: {
        CREATE: 'patient:create',
        VIEW: 'patient:view',
        UPDATE: 'patient:update',
        DELETE: 'patient:delete',
        LIST: 'patient:list'
    },

    // Appointment Management Permissions
    APPOINTMENT: {
        CREATE: 'appointment:create',
        VIEW: 'appointment:view',
        UPDATE: 'appointment:update',
        DELETE: 'appointment:delete',
        LIST: 'appointment:list',
        CANCEL: 'appointment:cancel'
    },

    // Medical Records Permissions
    MEDICAL_RECORD: {
        CREATE: 'medical_record:create',
        VIEW: 'medical_record:view',
        UPDATE: 'medical_record:update',
        DELETE: 'medical_record:delete',
        LIST: 'medical_record:list'
    },

    // Prescription Permissions
    PRESCRIPTION: {
        CREATE: 'prescription:create',
        VIEW: 'prescription:view',
        UPDATE: 'prescription:update',
        DELETE: 'prescription:delete',
        LIST: 'prescription:list'
    },

    // Lab Test Permissions
    LAB_TEST: {
        CREATE: 'lab_test:create',
        VIEW: 'lab_test:view',
        UPDATE: 'lab_test:update',
        DELETE: 'lab_test:delete',
        LIST: 'lab_test:list'
    },

    // Billing Permissions
    BILLING: {
        CREATE: 'billing:create',
        VIEW: 'billing:view',
        UPDATE: 'billing:update',
        DELETE: 'billing:delete',
        LIST: 'billing:list',
        PAYMENT: 'billing:payment'
    },

    // Inventory Permissions
    INVENTORY: {
        CREATE: 'inventory:create',
        VIEW: 'inventory:view',
        UPDATE: 'inventory:update',
        DELETE: 'inventory:delete',
        LIST: 'inventory:list'
    },

    // Reports Permissions
    REPORTS: {
        VIEW: 'reports:view',
        EXPORT: 'reports:export',
        ANALYTICS: 'reports:analytics'
    },

    // Settings Permissions
    SETTINGS: {
        VIEW: 'settings:view',
        UPDATE: 'settings:update'
    }
};

/**
 * Role-based default permissions
 * These are automatically assigned based on staff role
 */
export const ROLE_PERMISSIONS = {
    doctor: [
        PERMISSIONS.PATIENT.VIEW,
        PERMISSIONS.PATIENT.UPDATE,
        PERMISSIONS.APPOINTMENT.CREATE,
        PERMISSIONS.APPOINTMENT.VIEW,
        PERMISSIONS.APPOINTMENT.UPDATE,
        PERMISSIONS.MEDICAL_RECORD.CREATE,
        PERMISSIONS.MEDICAL_RECORD.VIEW,
        PERMISSIONS.MEDICAL_RECORD.UPDATE,
        PERMISSIONS.PRESCRIPTION.CREATE,
        PERMISSIONS.PRESCRIPTION.VIEW,
        PERMISSIONS.LAB_TEST.VIEW,
        PERMISSIONS.REPORTS.VIEW
    ],
    nurse: [
        PERMISSIONS.PATIENT.VIEW,
        PERMISSIONS.APPOINTMENT.VIEW,
        PERMISSIONS.APPOINTMENT.UPDATE,
        PERMISSIONS.MEDICAL_RECORD.VIEW,
        PERMISSIONS.MEDICAL_RECORD.CREATE,
        PERMISSIONS.PRESCRIPTION.VIEW,
        PERMISSIONS.LAB_TEST.VIEW
    ],
    admin: [
        PERMISSIONS.STAFF.CREATE,
        PERMISSIONS.STAFF.VIEW,
        PERMISSIONS.STAFF.UPDATE,
        PERMISSIONS.STAFF.DELETE,
        PERMISSIONS.STAFF.LIST,
        PERMISSIONS.PATIENT.CREATE,
        PERMISSIONS.PATIENT.VIEW,
        PERMISSIONS.PATIENT.UPDATE,
        PERMISSIONS.PATIENT.DELETE,
        PERMISSIONS.PATIENT.LIST,
        PERMISSIONS.APPOINTMENT.CREATE,
        PERMISSIONS.APPOINTMENT.VIEW,
        PERMISSIONS.APPOINTMENT.UPDATE,
        PERMISSIONS.APPOINTMENT.DELETE,
        PERMISSIONS.APPOINTMENT.LIST,
        PERMISSIONS.BILLING.CREATE,
        PERMISSIONS.BILLING.VIEW,
        PERMISSIONS.BILLING.UPDATE,
        PERMISSIONS.BILLING.LIST,
        PERMISSIONS.INVENTORY.CREATE,
        PERMISSIONS.INVENTORY.VIEW,
        PERMISSIONS.INVENTORY.UPDATE,
        PERMISSIONS.INVENTORY.LIST,
        PERMISSIONS.REPORTS.VIEW,
        PERMISSIONS.REPORTS.EXPORT,
        PERMISSIONS.SETTINGS.VIEW,
        PERMISSIONS.SETTINGS.UPDATE
    ],
    receptionist: [
        PERMISSIONS.PATIENT.CREATE,
        PERMISSIONS.PATIENT.VIEW,
        PERMISSIONS.PATIENT.UPDATE,
        PERMISSIONS.APPOINTMENT.CREATE,
        PERMISSIONS.APPOINTMENT.VIEW,
        PERMISSIONS.APPOINTMENT.UPDATE,
        PERMISSIONS.APPOINTMENT.CANCEL,
        PERMISSIONS.BILLING.CREATE,
        PERMISSIONS.BILLING.VIEW,
        PERMISSIONS.BILLING.PAYMENT
    ],
    pharmacist: [
        PERMISSIONS.PRESCRIPTION.VIEW,
        PERMISSIONS.PRESCRIPTION.UPDATE,
        PERMISSIONS.INVENTORY.VIEW,
        PERMISSIONS.INVENTORY.UPDATE
    ],
    lab_technician: [
        PERMISSIONS.LAB_TEST.CREATE,
        PERMISSIONS.LAB_TEST.VIEW,
        PERMISSIONS.LAB_TEST.UPDATE,
        PERMISSIONS.PATIENT.VIEW
    ],
    other: []
};

/**
 * Get all available permissions as a flat array
 */
export function getAllPermissions() {
    return Object.values(PERMISSIONS).flatMap(module => Object.values(module));
}

/**
 * Get default permissions for a role
 */
export function getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Validate if permissions are valid
 */
export function validatePermissions(permissions) {
    const allPermissions = getAllPermissions();
    const invalid = permissions.filter(p => !allPermissions.includes(p));
    
    if (invalid.length > 0) {
        throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
    }
    
    return true;
}

