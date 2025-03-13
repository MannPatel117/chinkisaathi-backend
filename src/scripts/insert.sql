-- INVENTORY SCRIPT

CREATE TABLE `inventory` (
    `inventoryID` INT PRIMARY KEY AUTO_INCREMENT,
    `inventoryName` VARCHAR(255),
    `inventoryNameAbbri` VARCHAR(10),
    `phoneNumber` VARCHAR(255),
    `addressLine1` VARCHAR(255),
    `addressLine2` VARCHAR(255),
    `addressLine3` VARCHAR(255),
    `city` VARCHAR(100),
    `state` VARCHAR(100),
    `pincode` INT,
    `billNumber` VARCHAR(255) NOT NULL DEFAULT "a-0",
    `invoiceNumber` INT NOT NULL DEFAULT 0,
    `bankAmount`  INT NOT NULL DEFAULT 0,
    `cashAmount`  INT NOT NULL DEFAULT 0,
    `otherAmount`  INT NOT NULL DEFAULT 0,
    `paymentVoucherDocNo` VARCHAR(255) DEFAULT "PV-001",
    `receiptVoucherDocNo` VARCHAR(255) DEFAULT "RV-001",
    `goodsReceiptDocNo` VARCHAR(255) DEFAULT "GR-001",
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME NULL
);


-- ADMIN USER SCRIPT

CREATE TABLE `adminUsers` (
    `userName` VARCHAR(24) NOT NULL,
    `firstName` VARCHAR(24) NOT NULL,
    `lastName` VARCHAR(24) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `role` ENUM('superadmin', 'admin', 'storeadmin', 'store', 'factoryadmin', 'factory', 'crmmaster', 'crm') DEFAULT 'store',
    `inventory` JSON DEFAULT '[]',
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
    `productID` INT NOT NULL AUTO_INCREMENT,
    `productName` VARCHAR(128) NOT NULL,
    `aliasName` VARCHAR(64) NOT NULL,
    `barcode` VARCHAR(48) NOT NULL,
    `productType` ENUM('finished', 'estimated') DEFAULT 'finished',
    `img` VARCHAR(256) DEFAULT NULL,
    `mrp` FLOAT NOT NULL,
    `discount` FLOAT NOT NULL,
    `sellingPrice` FLOAT NOT NULL,
    `wholeSalePrice` FLOAT NOT NULL,
    `gst` FLOAT NOT NULL,
    `hsnCode` VARCHAR(24) DEFAULT NULL,
    `category` VARCHAR(24) DEFAULT "others",
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`productID`)
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
    customerType ENUM('new', 'existing') DEFAULT 'new',
    addressLine1 VARCHAR(255),           -- Address line 1
    addressLine2 VARCHAR(255),           -- Address line 2
    addressLine3 VARCHAR(255),           -- Address line 3
    city VARCHAR(100),                   -- City
    state VARCHAR(100),                  -- State
    pincode INT,                         -- Pincode
    rewardPoint FLOAT DEFAULT 0,           -- Reward points, defaults to 0
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when created
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL;
);

-- INVENTORY DETAILS

CREATE TABLE inventoryDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventoryID INT NOT NULL,
    productID INT NOT NULL,
    quantity INT DEFAULT 0,
    lowWarning INT DEFAULT 20,
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,  -- ✅ Change `;` to `,`

    -- ✅ Move constraints inside the table definition
    CONSTRAINT fk_inventory FOREIGN KEY (inventoryID) REFERENCES inventory(inventoryID) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (productID) REFERENCES masterProduct(productID) ON DELETE CASCADE
);


-- ACCOUNTS TRANSACTION

CREATE TABLE accountsTransactions (
    transactionID INT PRIMARY KEY AUTO_INCREMENT,
    transactionType ENUM('sales', 'purchase', 'payment', 'receipt') NOT NULL DEFAULT 'purchase',
    `from` INT NULL,
    `to` INT NULL,
    challanNumber VARCHAR(255) NULL,
    challanDate DATE NULL,
    documentNumber VARCHAR(255) NULL,
    supplier INT NOT NULL,
    inventory INT NOT NULL,
    billNumber VARCHAR(255) NULL,
    billDate DATE NULL,
    paymentType ENUM('Cash', 'Online', 'Cheque', 'Other') NULL,
    chequeNo VARCHAR(255) NULL,
    chequeDate DATE NULL,
    remark VARCHAR(255) NULL,
    finalAmt FLOAT NULL,
    actionBy VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,  -- ✅ Change `;` to `,`

    -- ✅ Move constraints inside the table definition
    FOREIGN KEY (supplier) REFERENCES accounts(supplierID) ON DELETE CASCADE,
    FOREIGN KEY (inventory) REFERENCES inventory(inventoryID) ON DELETE CASCADE
);

-- ACCOUNTS DETAILS

CREATE TABLE accountsTransactionsDetails (
    transactionDetailID INT PRIMARY KEY AUTO_INCREMENT,
    accountTransaction INT NOT NULL,
    productID INT NOT NULL,
    quantity INT NOT NULL,
    discountAmt FLOAT NOT NULL,
    amount FLOAT NOT NULL,
    wholeSalePrice FLOAT NOT NULL,
    cgstAmount FLOAT NOT NULL DEFAULT 0,
    sgstAmount FLOAT NOT NULL DEFAULT 0,
    igstAmount FLOAT NOT NULL DEFAULT 0,
    netAmount FLOAT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_details FOREIGN KEY (productID) 
        REFERENCES masterProduct(productID) ON DELETE CASCADE
);

-- INVENTORY TRANSACTION

CREATE TABLE InventoryTransaction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventoryID INT NOT NULL,
    productID INT NOT NULL,
    accountTransactionID INT NULL,
    billID INT NULL,
    quantity INT DEFAULT 0,
    type ENUM('add', 'subtract', 'modify') DEFAULT 'subtract',
    reason VARCHAR(255) NULL,
    remark VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,  -- ✅ Supports soft delete (if using `paranoid: true` in Sequelize)

    -- ✅ Foreign Key Constraints
    CONSTRAINT fk_traInventory FOREIGN KEY (inventoryID) REFERENCES inventory(inventoryID) ON DELETE CASCADE,
    CONSTRAINT fk_traProduct FOREIGN KEY (productID) REFERENCES masterProduct(productID) ON DELETE CASCADE,
    CONSTRAINT fk_accountTransaction FOREIGN KEY (accountTransactionID) REFERENCES accountsTransactions(transactionID) ON DELETE CASCADE,
    CONSTRAINT fk_billMaster FOREIGN KEY (billID) REFERENCES billMaster(billID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- BILL MASTER

CREATE TABLE billMaster (
    billID INT PRIMARY KEY AUTO_INCREMENT,
    inventoryID INT NOT NULL,
    phoneNumber VARCHAR(15) NULL,  -- ✅ Match User's primary key (assuming it's a VARCHAR)
    supplier INT NULL,
    invoiceNumber INT NOT NULL,
    billNumber VARCHAR(255) NOT NULL,
    customerType ENUM('new', 'existing') DEFAULT 'new',
    paymentType ENUM('cash', 'online', 'others') DEFAULT 'cash',
    finalAmount FLOAT NOT NULL,
    finalAmountF FLOAT NOT NULL,
    rewardPointsUsed FLOAT NOT NULL,
    offerID INT NULL,
    couponID VARCHAR(7) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,  -- ✅ Supports soft delete (if using `paranoid: true` in Sequelize)

    -- ✅ Foreign Key Constraints
    CONSTRAINT fk_billinventory FOREIGN KEY (inventoryID) REFERENCES inventory(inventoryID) ON DELETE CASCADE,
    CONSTRAINT fk_phoneNumber FOREIGN KEY (phoneNumber) REFERENCES users(phoneNumber) ON DELETE SET NULL,
    CONSTRAINT fk_billsupplier FOREIGN KEY (supplier) REFERENCES accounts(supplierID) ON DELETE SET NULL,
    CONSTRAINT `FK_BillMaster_Offer` FOREIGN KEY (`offerID`) REFERENCES `offers` (`offerID`) ON DELETE CASCADE ON UPDATE CASCADE;
    CONSTRAINT `FK_BillMaster_Coupon` FOREIGN KEY (`couponID`) REFERENCES `coupons` (`couponID`) ON DELETE CASCADE ON UPDATE CASCADE;
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- OFFER 

CREATE TABLE `offers` (
  `offerID` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `offerName` VARCHAR(128) NOT NULL,
  `offerType` ENUM('free_product', 'flat_discount') NOT NULL,
  `minOrderValue` DECIMAL(10,2) DEFAULT NULL,
  `discountPerc` DECIMAL(10,2) DEFAULT NULL,
  `discountAmount` DECIMAL(10,2) DEFAULT NULL,
  `inventory` JSON NOT NULL,  -- Stores an array of numbers as JSON
  `isActive` BOOLEAN NOT NULL,
  `isCoupon` BOOLEAN NOT NULL DEFAULT FALSE,
  `freeProductID` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `FK_Offers_Product`
    FOREIGN KEY (`freeProductID`)
    REFERENCES `masterproduct` (`productID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);


-- INVENTORY ACCOUNTS

CREATE TABLE inventoryAccountBalance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventoryID INT NOT NULL,
    accountID INT NOT NULL,
    openingBalance DECIMAL(10,2) DEFAULT 0,
    closingBalance DECIMAL(10,2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventoryID) REFERENCES inventory(inventoryID) ON DELETE CASCADE,
    FOREIGN KEY (accountID) REFERENCES accounts(supplierID) ON DELETE CASCADE
);


-- REWARD POINT

CREATE TABLE rewardsPoint (
    rewardID INT PRIMARY KEY AUTO_INCREMENT,
    billID INT NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL,
    pointsAmount INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Constraints
    CONSTRAINT fk_rewards_bill FOREIGN KEY (billID) REFERENCES billMaster(billID) ON DELETE CASCADE,
    CONSTRAINT fk_rewards_user FOREIGN KEY (phoneNumber) REFERENCES users(phoneNumber) ON DELETE CASCADE
);




-- COUPONS
CREATE TABLE `coupons` (
  `couponID` VARCHAR(7) PRIMARY KEY,
  `offerID` INT NOT NULL,
  `isRedeemed` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `FK_Coupons_Offers`
    FOREIGN KEY (`offerID`)
    REFERENCES `offers` (`offerID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


-- BILL DETAILS

CREATE TABLE billTransactionDetails (
    billTransactionDetailID INT PRIMARY KEY AUTO_INCREMENT,
    billID INT NOT NULL,
    productID INT NOT NULL,
    productName VARCHAR(128) NOT NULL,
    productType ENUM('finished', 'estimated') DEFAULT 'finished',
    quantity INT NOT NULL,
    mrp FLOAT NOT NULL,
    discountPerc FLOAT NOT NULL,
    rate FLOAT NOT NULL,
    amount FLOAT NOT NULL,
    gstPerc FLOAT NOT NULL,
    cgstAmount FLOAT NOT NULL DEFAULT 0,
    sgstAmount FLOAT NOT NULL DEFAULT 0,
    igstAmount FLOAT NOT NULL DEFAULT 0,
    netAmount FLOAT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (billID) REFERENCES BillMaster(billID) ON DELETE CASCADE,
    FOREIGN KEY (productID) REFERENCES masterproduct(productID) ON DELETE CASCADE
);


   