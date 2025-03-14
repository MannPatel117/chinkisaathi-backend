import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import bcrypt from 'bcryptjs'; // Import bcryptjs (or bcrypt)

    const hashPassword = (password) => {
        // Generate a salt and hash the password
        const saltRounds = 10;  // Number of salt rounds (higher = more secure)
        return bcrypt.hashSync(password, saltRounds);  // Hash password and return
    };


const sequelize = initialSequelize();

export const adminUsers =(await sequelize).define('AdminUsers',{
    userName:{
        type: DataTypes.STRING(24),
        allowNull: false,
        primaryKey: true,
        unique: true,  
    },
    firstName:{
        type: DataTypes.STRING(24),
        allowNull: false,
    },
    lastName:{
        type: DataTypes.STRING(24),
        allowNull: false,
    },
    password:{
        type: DataTypes.STRING(128),
        allowNull: false,
        set(value) {
            this.setDataValue('password', hashPassword(value)); // Hash before saving
        },
    },
    role:{
        type: DataTypes.ENUM('superadmin', 'admin', 'storeadmin', 'store', 'factoryadmin', 'factory', 'crmmaster', 'crm'),
        defaultValue: 'store',
    },
    inventory: {
        type: DataTypes.JSON,  // Store array as JSON
        allowNull: true,
        defaultValue: [],
    },
    phnnumber:{
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    emailid:{
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    addressLine1:{
        type: DataTypes.STRING(256),
        allowNull: true,
    },
    addressLine2:{
        type: DataTypes.STRING(256),
        allowNull: true,
    },
    city:{
        type: DataTypes.STRING(24),
        allowNull: true,
    },
    state:{
        type: DataTypes.STRING(24),
        allowNull: true, 
    },
    pincode:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    photo:{
        type: DataTypes.STRING(256),
        allowNull: true, 
    },
    dateOfJoining:{
        type: DataTypes.DATE,
        allowNull: true,
    },
    designation:{
        type: DataTypes.STRING(24),
        allowNull: true,
    },
    employeeId:{
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    },{
        tableName: 'adminusers',
        timestamps: true,   // Enables createdAt and updatedAt
        paranoid: true, 
    });
    

