# Hospital API Permissions System

## Overview

The permissions system allows fine-grained control over what actions staff members can perform in the hospital management system.

## Permission Format

Permissions follow the pattern: `module:action`

Examples:
- `staff:create` - Can create new staff members
- `patient:view` - Can view patient information
- `appointment:cancel` - Can cancel appointments

## Available Modules and Actions

### Staff Management
- `staff:create` - Create new staff
- `staff:view` - View staff details
- `staff:update` - Update staff information
- `staff:delete` - Delete staff
- `staff:list` - List all staff

### Patient Management
- `patient:create` - Create new patients
- `patient:view` - View patient details
- `patient:update` - Update patient information
- `patient:delete` - Delete patients
- `patient:list` - List all patients

### Appointment Management
- `appointment:create` - Create appointments
- `appointment:view` - View appointments
- `appointment:update` - Update appointments
- `appointment:delete` - Delete appointments
- `appointment:list` - List appointments
- `appointment:cancel` - Cancel appointments

### Medical Records
- `medical_record:create` - Create medical records
- `medical_record:view` - View medical records
- `medical_record:update` - Update medical records
- `medical_record:delete` - Delete medical records
- `medical_record:list` - List medical records

### Prescriptions
- `prescription:create` - Create prescriptions
- `prescription:view` - View prescriptions
- `prescription:update` - Update prescriptions
- `prescription:delete` - Delete prescriptions
- `prescription:list` - List prescriptions

### Lab Tests
- `lab_test:create` - Create lab tests
- `lab_test:view` - View lab tests
- `lab_test:update` - Update lab tests
- `lab_test:delete` - Delete lab tests
- `lab_test:list` - List lab tests

### Billing
- `billing:create` - Create bills
- `billing:view` - View bills
- `billing:update` - Update bills
- `billing:delete` - Delete bills
- `billing:list` - List bills
- `billing:payment` - Process payments

### Inventory
- `inventory:create` - Create inventory items
- `inventory:view` - View inventory
- `inventory:update` - Update inventory
- `inventory:delete` - Delete inventory items
- `inventory:list` - List inventory

### Reports
- `reports:view` - View reports
- `reports:export` - Export reports
- `reports:analytics` - Access analytics

### Settings
- `settings:view` - View settings
- `settings:update` - Update settings

## Role-Based Default Permissions

When creating staff, if permissions are not explicitly provided, default permissions are assigned based on role:

### Doctor
- Patient viewing and updating
- Appointment management
- Medical record creation and management
- Prescription creation
- Lab test viewing
- Report viewing

### Nurse
- Patient viewing
- Appointment viewing and updating
- Medical record viewing and creation
- Prescription viewing
- Lab test viewing

### Admin
- Full access to all modules (except medical records creation)
- Staff management
- Settings management
- Reports and analytics

### Receptionist
- Patient creation and management
- Appointment management
- Billing creation and payment processing

### Pharmacist
- Prescription viewing and updating
- Inventory viewing and updating

### Lab Technician
- Lab test creation and management
- Patient viewing

## Usage

### Creating Staff with Permissions

```json
POST /api/v1/hospital/staff
{
  "email": "doctor@hospital.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "doctor",
  "permissions": [
    "patient:view",
    "patient:update",
    "appointment:create",
    "medical_record:create"
  ]
}
```

If `permissions` is not provided, default permissions for the role will be used.

### Checking Permissions in Routes

```javascript
app.get('/patients', {
  preHandler: [
    app.authGuard,
    app.requirePermission('patient:list')
  ]
}, handler);
```

### Super Admin Access

Super admins automatically have all permissions and can:
- Create staff with any permissions
- Access all endpoints
- Override permission checks

## API Endpoint

Get all available permissions:

```
GET /api/v1/hospital/permissions
```

Returns list of all permissions and modules.

