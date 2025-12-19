import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

export default function SuperAdminModel(sequelize) {
    const SuperAdmin = sequelize.define('SuperAdmin', {
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 255]
            }
        },
        role: {
            type: DataTypes.ENUM('super-admin', 'admin'),
            defaultValue: 'super-admin',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastLoginIp: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'super_admins',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ]
    });

    // Hash password before saving
    SuperAdmin.beforeCreate(async (superAdmin) => {
        if (superAdmin.password) {
            superAdmin.password = await bcrypt.hash(superAdmin.password, 10);
        }
    });

    // Hash password before updating if changed
    SuperAdmin.beforeUpdate(async (superAdmin) => {
        if (superAdmin.changed('password')) {
            superAdmin.password = await bcrypt.hash(superAdmin.password, 10);
        }
    });

    // Instance method to compare password
    SuperAdmin.prototype.comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    };

    // Instance method to get public data (without password)
    SuperAdmin.prototype.toJSON = function() {
        const values = { ...this.get() };
        delete values.password;
        return values;
    };

    return SuperAdmin;
}

