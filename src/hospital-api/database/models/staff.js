import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

export default function StaffModel(sequelize) {
    const Staff = sequelize.define('Staff', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 128]
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [10, 20]
            }
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [1, 100]
            }
        },
        position: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [1, 100]
            }
        },
        employeeId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                len: [1, 50]
            }
        },
        role: {
            type: DataTypes.ENUM('doctor', 'nurse', 'admin', 'receptionist', 'pharmacist', 'lab_technician', 'other'),
            defaultValue: 'other',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastLoginIp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        permissions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false
        }
    }, {
        tableName: 'staff',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                unique: true,
                fields: ['employee_id']
            },
            {
                fields: ['role']
            },
            {
                fields: ['department']
            }
        ]
    });

    // Hash password before saving
    Staff.beforeCreate(async (staff) => {
        if (staff.password) {
            staff.password = await bcrypt.hash(staff.password, 10);
        }
    });

    // Hash password before updating if changed
    Staff.beforeUpdate(async (staff) => {
        if (staff.changed('password')) {
            staff.password = await bcrypt.hash(staff.password, 10);
        }
    });

    // Instance method to compare password
    Staff.prototype.comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    };

    // Instance method to get public data (without password)
    Staff.prototype.toJSON = function() {
        const values = { ...this.get() };
        delete values.password;
        delete values.passwordResetToken;
        delete values.passwordResetExpires;
        return values;
    };

    return Staff;
}

