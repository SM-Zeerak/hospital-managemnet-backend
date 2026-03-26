## Guards API Permissions

This file lists all permission keys used by the `guards-api` module and seeded by `20240101006000-seed-guards-core.cjs`.

Each permission has a **title**, **permission key**, and **description**.

### Dashboard

- **Title**: Dashboard view  
  **Permission**: `dashboard.view`  
  **Description**: View dashboard

### Users

- **Title**: Users create  
  **Permission**: `users.create`  
  **Description**: Create users

- **Title**: Users view  
  **Permission**: `users.view`  
  **Description**: View users list and details

- **Title**: Users update  
  **Permission**: `users.update`  
  **Description**: Update users

- **Title**: Users delete  
  **Permission**: `users.delete`  
  **Description**: Delete users

### Roles

- **Title**: Roles create  
  **Permission**: `roles.create`  
  **Description**: Create roles

- **Title**: Roles view  
  **Permission**: `roles.view`  
  **Description**: View roles

- **Title**: Roles update  
  **Permission**: `roles.update`  
  **Description**: Update roles

- **Title**: Roles delete  
  **Permission**: `roles.delete`  
  **Description**: Delete roles

### Permissions

- **Title**: Permissions view  
  **Permission**: `permissions.view`  
  **Description**: View permissions

### Guards

- **Title**: Guards create  
  **Permission**: `guards.create`  
  **Description**: Create guards

- **Title**: Guards view  
  **Permission**: `guards.view`  
  **Description**: View guards list and details

- **Title**: Guards update  
  **Permission**: `guards.update`  
  **Description**: Update guards

- **Title**: Guards delete  
  **Permission**: `guards.delete`  
  **Description**: Delete guards

- **Title**: Guard documents manage  
  **Permission**: `guards.documents.manage`  
  **Description**: Add / update / delete guard documents

### Uploads

- **Title**: Uploads manage  
  **Permission**: `uploads.manage`  
  **Description**: Upload and delete files via upload module

### Admin

- **Title**: Admin view settings  
  **Permission**: `admin.view`  
  **Description**: View admin settings

- **Title**: Admin update settings  
  **Permission**: `admin.update`  
  **Description**: Update admin settings

### Super Admin

- The `super-admin` role is seeded with **all** of the above permissions.
- Default Super Admin user:
  - **Email**: `superadmin@guards.com`
  - **Password**: `SuperAdmin@123`

