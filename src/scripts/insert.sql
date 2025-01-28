-- ADMIN USER SCRIPT

CREATE TABLE `adminUsers` (
    `userName` VARCHAR(24) NOT NULL,
    `firstName` VARCHAR(24) NOT NULL,
    `lastName` VARCHAR(24) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `role` ENUM('superadmin', 'admin', 'storeadmin', 'store', 'factoryadmin', 'factory', 'crmmaster', 'crm') DEFAULT 'store',
    `branch` VARCHAR(24) NOT NULL,
    `phnnumber` VARCHAR(10) DEFAULT NULL,
    `emailid` VARCHAR(45) DEFAULT NULL,
    `addressLine1` VARCHAR(256) DEFAULT NULL,
    `addressLine2` VARCHAR(256) DEFAULT NULL,
    `city` VARCHAR(24) DEFAULT NULL,
    `state` VARCHAR(24) DEFAULT NULL,
    `pincode` INT DEFAULT NULL,
    `photo` VARCHAR(256) DEFAULT NULL,
    `dateOfJoining` DATETIME DEFAULT NULL,
    `designation` VARCHAR(24) DEFAULT NULL,
    `employeeId` VARCHAR(10) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`userName`),
    UNIQUE KEY `userName_UNIQUE` (`userName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- PRODUCTS SCRIPT

CREATE TABLE `masterProduct` (
    `productName` VARCHAR(128) NOT NULL,
    `aliasName` VARCHAR(64) NOT NULL,
    `barcode` VARCHAR(48) NOT NULL,
    `productType` ENUM('finished', 'estimated') DEFAULT 'finished',
    `img` VARCHAR(256) DEFAULT NULL,
    `mrp` INT NOT NULL,
    `discount` INT NOT NULL,
    `sellingPrice` INT NOT NULL,
    `wholeSalePrice` INT NOT NULL,
    `gst` INT NOT NULL,
    `hsnCode` VARCHAR(24) DEFAULT NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ACCOUNTS SCRIPT

CREATE TABLE `accounts` (
    `supplierID` INT NOT NULL AUTO_INCREMENT,
    `accountName` VARCHAR(128) NOT NULL,
    `aliasName` VARCHAR(64) NOT NULL,
    `phone_Number` VARCHAR(24) NOT NULL,
    `addressLine1` VARCHAR(256) DEFAULT NULL,
    `addressLine2` VARCHAR(256) DEFAULT NULL,
    `city` VARCHAR(24) DEFAULT NULL,
    `state` VARCHAR(24) DEFAULT NULL,
    `pincode` INT DEFAULT NULL,
    `subGroup` ENUM('Sundry Creditors', 'Sundry Debtors') DEFAULT 'Sundry Creditors',
    `underGroup` VARCHAR(32) DEFAULT NULL,
    `paymentTerm` INT DEFAULT 0,
    `gstNumber` VARCHAR(255) DEFAULT NULL,
    `openingBalanceCredit` INT DEFAULT 0,
    `openingBalanceDebit` INT DEFAULT 0,
    `email` VARCHAR(128) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`supplierID`),
    UNIQUE KEY `supplierID_UNIQUE` (`supplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- USERS SCRIPT

CREATE TABLE Users (
    phoneNumber VARCHAR(15) PRIMARY KEY, -- Primary key
    name VARCHAR(255),                   -- Name of the user
    addressLine1 VARCHAR(255),           -- Address line 1
    addressLine2 VARCHAR(255),           -- Address line 2
    addressLine3 VARCHAR(255),           -- Address line 3
    city VARCHAR(100),                   -- City
    state VARCHAR(100),                  -- State
    pincode INT,                         -- Pincode
    rewardPoint INT DEFAULT 0,           -- Reward points, defaults to 0
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when created
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Auto-updates when the record is modified
);
