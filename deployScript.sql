-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: chinki-schema
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `supplierID` int NOT NULL AUTO_INCREMENT,
  `accountName` varchar(128) NOT NULL,
  `aliasName` varchar(64) NOT NULL,
  `phone_Number` varchar(24) NOT NULL,
  `addressLine1` varchar(256) DEFAULT NULL,
  `addressLine2` varchar(256) DEFAULT NULL,
  `city` varchar(24) DEFAULT NULL,
  `state` varchar(24) DEFAULT NULL,
  `pincode` int DEFAULT NULL,
  `subGroup` enum('Sundry Creditors','Sundry Debtors') DEFAULT 'Sundry Creditors',
  `underGroup` varchar(32) DEFAULT NULL,
  `paymentTerm` int DEFAULT '0',
  `gstNumber` varchar(255) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`supplierID`),
  UNIQUE KEY `supplierID_UNIQUE` (`supplierID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'Nexus Consumer Care','NexusCC','9876543210','123, Main Street','Suite 4B','New York','NY',10001,'Sundry Creditors','Wholesale Suppliers',30,'22ABCDE1234F2Z5','contact@abcsupplies.com','2025-01-27 21:04:25','2025-02-21 20:58:17',NULL),(2,'2M Brothers','2MB','9769463022','Shop 1,2 Gurukul CHS','Opp Panvel Court','Panvel','Maharashtra',410206,'Sundry Debtors','Wholesale Distributor',100,'22302FFSGESF#','contact@2mb.com','2025-01-28 08:57:28','2025-02-10 01:04:14',NULL),(3,'Charbuja Sales','CSC1','9664660211','Shop 1 Vapi Town','Line 2','Vapi','Gujarat',396191,'Sundry Creditors','Retailer',60,'277FH123G','chinki@email.com','2025-02-09 19:14:45','2025-02-10 01:04:18',NULL),(4,'Nexus Consumer Care','Nexus CC','9876543210','123, Main Street','Suite 4B','New York','NY',10001,'Sundry Creditors','Wholesale Suppliers',30,'22ABCDE1234F2Z5','contact@abcsupplies.com','2025-02-21 20:54:48','2025-02-21 20:55:49','2025-02-21 20:55:49');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accountstransactions`
--

DROP TABLE IF EXISTS `accountstransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accountstransactions` (
  `transactionID` int NOT NULL AUTO_INCREMENT,
  `transactionType` enum('sales','purchase','payment','receipt') NOT NULL DEFAULT 'purchase',
  `challanNumber` varchar(255) DEFAULT NULL,
  `challanDate` date DEFAULT NULL,
  `documentNumber` varchar(255) DEFAULT NULL,
  `supplier` int NOT NULL,
  `inventory` int NOT NULL,
  `billNumber` varchar(255) DEFAULT NULL,
  `billDate` date DEFAULT NULL,
  `paymentType` enum('Cash','Online','Cheque','Other') DEFAULT NULL,
  `chequeNo` varchar(255) DEFAULT NULL,
  `chequeDate` date DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `finalAmt` float DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `actionBy` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`transactionID`),
  KEY `fk_supplier` (`supplier`),
  KEY `fk_inventoryDetails` (`inventory`),
  CONSTRAINT `fk_inventoryDetails` FOREIGN KEY (`inventory`) REFERENCES `inventory` (`inventoryID`) ON DELETE CASCADE,
  CONSTRAINT `fk_supplier` FOREIGN KEY (`supplier`) REFERENCES `accounts` (`supplierID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accountstransactions`
--

LOCK TABLES `accountstransactions` WRITE;
/*!40000 ALTER TABLE `accountstransactions` DISABLE KEYS */;
INSERT INTO `accountstransactions` VALUES (1,'receipt',NULL,NULL,'RV-0001',1,2,NULL,NULL,'Cash','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:03:57','2025-02-11 10:03:57',NULL,NULL),(2,'receipt',NULL,NULL,'RV-003',1,2,NULL,NULL,'Cash','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:40:10','2025-02-11 10:40:10',NULL,NULL),(3,'receipt',NULL,NULL,'RV-003',1,2,NULL,NULL,'Cash','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:41:20','2025-02-11 10:41:20',NULL,NULL),(4,'receipt',NULL,NULL,'RV-004',1,2,NULL,NULL,'Cash','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:43:06','2025-02-11 10:43:06',NULL,NULL),(5,'receipt',NULL,NULL,'RV-005',1,2,NULL,NULL,'Cheque','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:44:21','2025-02-11 10:44:21',NULL,NULL),(6,'receipt',NULL,NULL,'RV-006',1,2,NULL,NULL,'Cash','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:44:36','2025-02-11 10:44:36',NULL,NULL),(7,'receipt',NULL,NULL,'RV-007',1,2,NULL,NULL,'Other','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:44:52','2025-02-11 10:44:52',NULL,NULL),(8,'receipt',NULL,NULL,'RV-008',1,2,NULL,NULL,'Online','12023108410','2025-02-11','Receipt payment for bill number 1234',1000,'2025-02-11 10:45:01','2025-02-11 10:45:01',NULL,NULL),(9,'payment',NULL,NULL,'PV-001',1,2,NULL,NULL,'Cash','12023108410','2025-02-11','Receipt payment for bill number 1234',-1000,'2025-02-11 18:38:56','2025-02-11 18:38:56',NULL,NULL),(10,'purchase','12234','2025-02-11','GR-001',1,2,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-12 21:59:30','2025-02-12 21:59:30',NULL,NULL),(11,'purchase','12234','2025-02-11','GR-001',1,2,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-12 22:02:41','2025-02-12 22:02:41',NULL,NULL),(12,'purchase','12234','2025-02-11','GR-002',1,2,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-12 22:02:42','2025-02-12 22:02:42',NULL,NULL),(13,'purchase','12234','2025-02-11','GR-003',1,2,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 20:50:12','2025-02-14 20:50:12',NULL,NULL),(14,'purchase','12234','2025-02-11','GR-004',1,2,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 20:50:13','2025-02-14 20:50:13',NULL,NULL),(15,'purchase','12234','2025-02-11','GR-005',1,2,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 20:50:14','2025-02-14 20:50:14',NULL,NULL),(16,'purchase','12234','2025-02-11','GR-001',1,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 21:50:38','2025-02-14 21:50:38',NULL,NULL),(17,'purchase','12234','2025-02-11','GR-002',1,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 21:50:41','2025-02-14 21:50:41',NULL,NULL),(18,'purchase','12234','2025-02-11','GR-003',1,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 21:50:42','2025-02-14 21:50:42',NULL,NULL),(19,'purchase','12234','2025-02-11','GR-004',1,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 21:50:44','2025-02-14 21:50:44',NULL,NULL),(20,'purchase','12234','2025-02-11','GR-005',2,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 22:13:48','2025-02-14 22:13:48',NULL,NULL),(21,'purchase','12234','2025-02-11','GR-006',2,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-14 22:13:50','2025-02-14 22:13:50',NULL,NULL),(23,'purchase','12234','2025-02-11','GR-007',2,3,'12023108410','2025-02-11','Cash',NULL,NULL,'Good purchase',7500,'2025-02-15 09:27:47','2025-02-15 09:27:47',NULL,NULL),(24,'payment',NULL,NULL,'PV-001',1,3,NULL,NULL,'Cash',NULL,NULL,'Trial',-7777,'2025-02-16 18:31:51','2025-02-16 18:31:51',NULL,NULL),(25,'payment',NULL,NULL,'PV-002',1,2,NULL,NULL,'Cheque','12345','2025-02-11','1123',2000,'2025-02-16 18:32:48','2025-02-16 20:28:27',NULL,NULL),(26,'payment',NULL,NULL,'PV-003',2,2,NULL,NULL,'Online','12124','2025-02-17','Paid',2000,'2025-02-16 19:50:54','2025-02-16 20:37:45',NULL,'Mann'),(30,'receipt',NULL,NULL,'RV-010',2,2,NULL,NULL,'Cash',NULL,NULL,'Recevied',2000,'2025-02-17 10:07:08','2025-02-17 10:07:17',NULL,'Mann'),(35,'purchase',NULL,NULL,'GR-006',2,2,NULL,NULL,NULL,NULL,NULL,NULL,566.4,'2025-02-19 12:05:47','2025-02-19 12:05:47',NULL,'Mann'),(45,'purchase',NULL,NULL,'GR-010',1,2,NULL,NULL,NULL,NULL,NULL,NULL,280,'2025-02-19 21:07:29','2025-02-19 21:08:00',NULL,'Mann'),(47,'purchase',NULL,NULL,'GR-012',1,2,NULL,NULL,NULL,NULL,NULL,NULL,1180,'2025-02-19 21:15:59','2025-02-19 21:16:23',NULL,'Mann');
/*!40000 ALTER TABLE `accountstransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accountstransactionsdetails`
--

DROP TABLE IF EXISTS `accountstransactionsdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accountstransactionsdetails` (
  `transactionDetailID` int NOT NULL AUTO_INCREMENT,
  `accountTransaction` int NOT NULL,
  `productID` int NOT NULL,
  `quantity` int NOT NULL,
  `discountAmt` float NOT NULL,
  `amount` float NOT NULL,
  `wholeSalePrice` float NOT NULL,
  `cgstAmount` float NOT NULL DEFAULT '0',
  `sgstAmount` float NOT NULL DEFAULT '0',
  `igstAmount` float NOT NULL DEFAULT '0',
  `netAmount` float NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transactionDetailID`),
  KEY `fk_product_details` (`productID`),
  CONSTRAINT `fk_product_details` FOREIGN KEY (`productID`) REFERENCES `masterproduct` (`productID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accountstransactionsdetails`
--

LOCK TABLES `accountstransactionsdetails` WRITE;
/*!40000 ALTER TABLE `accountstransactionsdetails` DISABLE KEYS */;
INSERT INTO `accountstransactionsdetails` VALUES (1,13,1,10,0,1000,100,0,0,0,1000,'2025-02-14 20:50:12','2025-02-14 20:50:12'),(2,13,2,15,0,100,100,0,0,0,1500,'2025-02-14 20:50:12','2025-02-14 20:50:12'),(3,13,3,20,0,100,100,0,0,0,2000,'2025-02-14 20:50:12','2025-02-14 20:50:12'),(4,13,4,30,0,100,100,0,0,0,3000,'2025-02-14 20:50:12','2025-02-14 20:50:12'),(5,14,1,10,0,1000,100,0,0,0,1000,'2025-02-14 20:50:13','2025-02-14 20:50:13'),(6,14,2,15,0,100,100,0,0,0,1500,'2025-02-14 20:50:13','2025-02-14 20:50:13'),(7,14,3,20,0,100,100,0,0,0,2000,'2025-02-14 20:50:13','2025-02-14 20:50:13'),(8,14,4,30,0,100,100,0,0,0,3000,'2025-02-14 20:50:13','2025-02-14 20:50:13'),(9,15,1,10,0,1000,100,0,0,0,1000,'2025-02-14 20:50:14','2025-02-14 20:50:14'),(10,15,2,15,0,100,100,0,0,0,1500,'2025-02-14 20:50:14','2025-02-14 20:50:14'),(11,15,3,20,0,100,100,0,0,0,2000,'2025-02-14 20:50:14','2025-02-14 20:50:14'),(12,15,4,30,0,100,100,0,0,0,3000,'2025-02-14 20:50:14','2025-02-14 20:50:14'),(13,16,1,10,0,1000,100,0,0,0,1000,'2025-02-14 21:50:38','2025-02-14 21:50:38'),(14,16,2,15,0,100,100,0,0,0,1500,'2025-02-14 21:50:38','2025-02-14 21:50:38'),(15,16,3,20,0,100,100,0,0,0,2000,'2025-02-14 21:50:38','2025-02-14 21:50:38'),(16,16,4,30,0,100,100,0,0,0,3000,'2025-02-14 21:50:38','2025-02-14 21:50:38'),(17,17,1,10,0,1000,100,0,0,0,1000,'2025-02-14 21:50:41','2025-02-14 21:50:41'),(18,17,2,15,0,100,100,0,0,0,1500,'2025-02-14 21:50:41','2025-02-14 21:50:41'),(19,17,3,20,0,100,100,0,0,0,2000,'2025-02-14 21:50:41','2025-02-14 21:50:41'),(20,17,4,30,0,100,100,0,0,0,3000,'2025-02-14 21:50:41','2025-02-14 21:50:41'),(21,18,1,10,0,1000,100,0,0,0,1000,'2025-02-14 21:50:42','2025-02-14 21:50:42'),(22,18,2,15,0,100,100,0,0,0,1500,'2025-02-14 21:50:42','2025-02-14 21:50:42'),(23,18,3,20,0,100,100,0,0,0,2000,'2025-02-14 21:50:42','2025-02-14 21:50:42'),(24,18,4,30,0,100,100,0,0,0,3000,'2025-02-14 21:50:42','2025-02-14 21:50:42'),(25,19,1,10,0,1000,100,0,0,0,1000,'2025-02-14 21:50:44','2025-02-14 21:50:44'),(26,19,2,15,0,100,100,0,0,0,1500,'2025-02-14 21:50:44','2025-02-14 21:50:44'),(27,19,3,20,0,100,100,0,0,0,2000,'2025-02-14 21:50:44','2025-02-14 21:50:44'),(28,19,4,30,0,100,100,0,0,0,3000,'2025-02-14 21:50:44','2025-02-14 21:50:44'),(29,20,1,10,0,1000,100,0,0,0,1000,'2025-02-14 22:13:48','2025-02-14 22:13:48'),(30,20,2,15,0,100,100,0,0,0,1500,'2025-02-14 22:13:48','2025-02-14 22:13:48'),(31,20,3,20,0,100,100,0,0,0,2000,'2025-02-14 22:13:48','2025-02-14 22:13:48'),(32,20,4,30,0,100,100,0,0,0,3000,'2025-02-14 22:13:48','2025-02-14 22:13:48'),(33,21,1,10,0,1000,100,0,0,0,1000,'2025-02-14 22:13:50','2025-02-14 22:13:50'),(34,21,2,15,0,100,100,0,0,0,1500,'2025-02-14 22:13:50','2025-02-14 22:13:50'),(35,21,3,20,0,100,100,0,0,0,2000,'2025-02-14 22:13:50','2025-02-14 22:13:50'),(36,21,4,30,0,100,100,0,0,0,3000,'2025-02-14 22:13:50','2025-02-14 22:13:50'),(38,23,1,10,0,1000,100,0,0,0,1000,'2025-02-15 09:27:47','2025-02-15 09:27:47'),(39,23,2,15,0,100,100,0,0,0,1500,'2025-02-15 09:27:47','2025-02-15 09:27:47'),(40,23,3,20,0,100,100,0,0,0,2000,'2025-02-15 09:27:47','2025-02-15 09:27:47'),(41,23,4,30,0,100,100,0,0,0,3000,'2025-02-15 09:27:47','2025-02-15 09:27:47'),(42,35,1,4,0,300,100,27,27,0,354,'2025-02-19 12:05:47','2025-02-19 12:05:47'),(43,35,2,3,0,180,90,16,16,0,212,'2025-02-19 12:05:47','2025-02-19 12:05:47'),(63,45,7,1,0,100,100,90,90,0,280,'2025-02-19 21:08:00','2025-02-19 21:08:00'),(69,47,1,10,0,1000,100,90,90,0,1180,'2025-02-19 21:16:23','2025-02-19 21:16:23');
/*!40000 ALTER TABLE `accountstransactionsdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adminusers`
--

DROP TABLE IF EXISTS `adminusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminusers` (
  `userName` varchar(24) NOT NULL,
  `firstName` varchar(24) NOT NULL,
  `lastName` varchar(24) NOT NULL,
  `password` varchar(128) NOT NULL,
  `role` enum('superadmin','admin','storeadmin','store') DEFAULT 'store',
  `phnnumber` varchar(10) DEFAULT NULL,
  `emailid` varchar(45) DEFAULT NULL,
  `addressLine1` varchar(60) DEFAULT NULL,
  `addressLine2` varchar(60) DEFAULT NULL,
  `city` varchar(24) DEFAULT NULL,
  `state` varchar(24) DEFAULT NULL,
  `pincode` int DEFAULT NULL,
  `photo` varchar(256) DEFAULT NULL,
  `dateOfJoining` date DEFAULT NULL,
  `designation` varchar(24) DEFAULT NULL,
  `employeeId` varchar(10) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `inventory` json DEFAULT NULL,
  PRIMARY KEY (`userName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminusers`
--

LOCK TABLES `adminusers` WRITE;
/*!40000 ALTER TABLE `adminusers` DISABLE KEYS */;
INSERT INTO `adminusers` VALUES ('mannpatel','Mann','Patel','$2a$10$CTq8Xzdi3C3nl0voCbHBAOpRQh0uOfN0ulHU/SEZq/h3XOs7lVx2O','superadmin','8779690230','mannp3005@gmail.com','201, H3, Parksight CHS','Sector 6, Near Mahatma School, Khanda Colony','Panvel','Maharashtra',410206,'','2025-01-01','Chief Technology Officer','EMP004','2025-01-14 21:52:18','2025-02-14 12:17:42',NULL,'[2, 3]'),('preetpatel','Preet','Patel','$2a$10$1iJ5sOW.Ce40eXhCqVrpcObt736LdrBtmECctnQIZP8PRMz2P35Na','store','9323464022','preetmp525@gmail.com','201, H3, Parksight CHS','Sector 6, Near Mahatma School, Khanda Colony','Panvel','Maharashtra',410206,'','2025-01-01','Chief Marketing Officer','EMP004','2025-01-16 12:28:24','2025-02-15 21:49:35',NULL,'[2]');
/*!40000 ALTER TABLE `adminusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billmaster`
--

DROP TABLE IF EXISTS `billmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billmaster` (
  `billID` int NOT NULL AUTO_INCREMENT,
  `inventoryID` int NOT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `supplier` int DEFAULT NULL,
  `invoiceNumber` int NOT NULL,
  `billNumber` varchar(255) NOT NULL,
  `customerType` enum('new', 'existing', 'facebook', 'chinki-van') DEFAULT 'new',
  `paymentType` enum('cash','online','others') DEFAULT 'cash',
  `finalAmount` float NOT NULL,
  `finalAmountF` float NOT NULL,
  `rewardPointsUsed` float NOT NULL,
  `offerID` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `couponID` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`billID`),
  KEY `fk_billinventory` (`inventoryID`),
  KEY `fk_phoneNumber` (`phoneNumber`),
  KEY `fk_billsupplier` (`supplier`),
  KEY `FK_BillMaster_Offer` (`offerID`),
  CONSTRAINT `fk_billinventory` FOREIGN KEY (`inventoryID`) REFERENCES `inventory` (`inventoryID`) ON DELETE CASCADE,
  CONSTRAINT `FK_BillMaster_Offer` FOREIGN KEY (`offerID`) REFERENCES `offers` (`offerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_billsupplier` FOREIGN KEY (`supplier`) REFERENCES `accounts` (`supplierID`) ON DELETE SET NULL,
  CONSTRAINT `fk_phoneNumber` FOREIGN KEY (`phoneNumber`) REFERENCES `users` (`phoneNumber`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billmaster`
--

LOCK TABLES `billmaster` WRITE;
/*!40000 ALTER TABLE `billmaster` DISABLE KEYS */;
INSERT INTO `billmaster` VALUES (1,2,NULL,NULL,1,'SCS-0001','new','cash',360,240,0,NULL,'2025-03-13 09:22:59','2025-03-13 09:22:59',NULL,NULL),(2,2,NULL,NULL,1,'SCS-0002','new','cash',360,0,0,NULL,'2025-03-13 09:47:35','2025-03-13 09:47:35',NULL,NULL),(3,2,NULL,NULL,2,'SCS-0003','new','cash',480,240,0,NULL,'2025-03-13 09:56:18','2025-03-13 09:56:18',NULL,NULL),(4,2,NULL,NULL,3,'SCS-0004','new','cash',360,240,0,NULL,'2025-03-13 09:56:45','2025-03-13 09:56:45',NULL,NULL),(5,2,NULL,NULL,4,'SCS-0005','new','cash',240,120,0,NULL,'2025-03-13 09:56:52','2025-03-13 09:56:52',NULL,NULL),(6,2,'9323464022',NULL,5,'SCS-0006','new','cash',240,120,0,NULL,'2025-03-13 09:57:24','2025-03-13 09:57:24',NULL,NULL),(7,2,'9323464022',NULL,6,'SCS-0007','new','cash',240,120,0,NULL,'2025-03-13 10:03:42','2025-03-13 10:03:42',NULL,NULL),(8,2,'9323464022',NULL,7,'SCS-0008','new','cash',240,120,0,NULL,'2025-03-13 10:05:21','2025-03-13 10:05:21',NULL,NULL),(10,2,'9323464022',NULL,8,'SCS-0009','new','cash',240,120,0,NULL,'2025-03-13 10:40:59','2025-03-13 10:40:59',NULL,NULL),(11,2,'9323464022',NULL,9,'SCS-0010','new','cash',110,120,10,NULL,'2025-03-13 10:42:56','2025-03-13 10:42:56',NULL,NULL),(12,2,'9323464022',NULL,10,'SCS-0011','new','cash',600,600,0,2,'2025-03-13 10:51:10','2025-03-13 10:51:10',NULL,'06518E7');
/*!40000 ALTER TABLE `billmaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billtransactiondetails`
--

DROP TABLE IF EXISTS `billtransactiondetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billtransactiondetails` (
  `billTransactionDetailID` int NOT NULL AUTO_INCREMENT,
  `billID` int NOT NULL,
  `productID` int NOT NULL,
  `productName` varchar(128) NOT NULL,
  `productType` enum('finished','estimated') DEFAULT 'finished',
  `quantity` int NOT NULL,
  `mrp` float NOT NULL,
  `discountPerc` float NOT NULL,
  `rate` float NOT NULL,
  `amount` float NOT NULL,
  `gstPerc` float NOT NULL,
  `cgstAmount` float NOT NULL DEFAULT '0',
  `sgstAmount` float NOT NULL DEFAULT '0',
  `igstAmount` float NOT NULL DEFAULT '0',
  `netAmount` float NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`billTransactionDetailID`),
  KEY `billID` (`billID`),
  KEY `productID` (`productID`),
  CONSTRAINT `billtransactiondetails_ibfk_1` FOREIGN KEY (`billID`) REFERENCES `billmaster` (`billID`) ON DELETE CASCADE,
  CONSTRAINT `billtransactiondetails_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `masterproduct` (`productID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billtransactiondetails`
--

LOCK TABLES `billtransactiondetails` WRITE;
/*!40000 ALTER TABLE `billtransactiondetails` DISABLE KEYS */;
INSERT INTO `billtransactiondetails` VALUES (1,1,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',2,150,20,120,102,18,9,9,0,240,'2025-03-13 09:22:59','2025-03-13 09:22:59'),(2,1,2,'Chinki Product 2','estimated',1,150,20,120,102,18,9,9,0,120,'2025-03-13 09:22:59','2025-03-13 09:22:59'),(3,2,2,'Chinki Product 2','estimated',2,150,20,120,120,0,0,0,0,240,'2025-03-13 09:47:35','2025-03-13 09:47:35'),(4,2,3,'Chinki Product 2','estimated',1,150,20,120,120,0,0,0,0,120,'2025-03-13 09:47:35','2025-03-13 09:47:35'),(5,3,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',2,150,20,120,102,18,9,9,0,240,'2025-03-13 09:56:18','2025-03-13 09:56:18'),(6,3,2,'Chinki Product 2','estimated',2,150,20,120,120,0,0,0,0,240,'2025-03-13 09:56:18','2025-03-13 09:56:18'),(7,4,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',2,150,20,120,102,18,9,9,0,240,'2025-03-13 09:56:45','2025-03-13 09:56:45'),(8,4,3,'Chinki Product 2','estimated',1,150,20,120,120,0,0,0,0,120,'2025-03-13 09:56:46','2025-03-13 09:56:46'),(9,5,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',1,150,20,120,102,18,9,9,0,120,'2025-03-13 09:56:52','2025-03-13 09:56:52'),(10,5,4,'Chinki Product 4','estimated',1,150,20,120,102,18,9,9,0,120,'2025-03-13 09:56:52','2025-03-13 09:56:52'),(11,6,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',1,150,20,120,102,18,9,9,0,120,'2025-03-13 09:57:24','2025-03-13 09:57:24'),(12,6,2,'Chinki Product 2','estimated',1,150,20,120,120,0,0,0,0,120,'2025-03-13 09:57:24','2025-03-13 09:57:24'),(13,7,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',1,150,20,120,102,18,9,9,0,120,'2025-03-13 10:03:42','2025-03-13 10:03:42'),(14,7,2,'Chinki Product 2','estimated',1,150,20,120,120,0,0,0,0,120,'2025-03-13 10:03:42','2025-03-13 10:03:42'),(15,8,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',1,150,20,120,102,18,9,9,0,120,'2025-03-13 10:05:21','2025-03-13 10:05:21'),(16,8,2,'Chinki Product 2','estimated',1,150,20,120,120,0,0,0,0,120,'2025-03-13 10:05:21','2025-03-13 10:05:21'),(19,10,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',1,150,20,120,101.69,18,9.15,9.15,0,120,'2025-03-13 10:40:59','2025-03-13 10:40:59'),(20,10,3,'Chinki Product 2','estimated',1,150,20,120,120,0,0,0,0,120,'2025-03-13 10:40:59','2025-03-13 10:40:59'),(21,11,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',1,150,20,120,101.69,18,9.15,9.15,0,120,'2025-03-13 10:42:56','2025-03-13 10:42:56'),(22,12,1,'Multisurface Cleaner - Refresh 1 Ltr','finished',5,150,20,120,101.69,18,9.15,9.15,0,600,'2025-03-13 10:51:10','2025-03-13 10:51:10');
/*!40000 ALTER TABLE `billtransactiondetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `couponID` varchar(7) NOT NULL,
  `offerID` int NOT NULL,
  `isRedeemed` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`couponID`),
  KEY `FK_Coupons_Offers` (`offerID`),
  CONSTRAINT `FK_Coupons_Offers` FOREIGN KEY (`offerID`) REFERENCES `offers` (`offerID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('06518E7',2,1,'2025-03-10 10:15:15','2025-03-13 10:51:10'),('19946F6',2,0,'2025-03-10 10:14:11','2025-03-10 10:14:11'),('300E374',2,0,'2025-03-10 10:13:13','2025-03-10 10:13:13'),('34AA054',2,0,'2025-03-10 10:14:11','2025-03-10 10:14:11'),('37C829C',2,0,'2025-03-10 10:15:15','2025-03-10 10:15:15'),('4302673',2,0,'2025-03-10 10:13:13','2025-03-10 10:13:13'),('8426B20',2,0,'2025-03-10 10:15:15','2025-03-10 10:15:15'),('8A2D70F',2,0,'2025-03-10 10:15:15','2025-03-10 10:15:15'),('AA9654E',2,0,'2025-03-10 10:13:13','2025-03-10 10:13:13'),('B8987DE',2,0,'2025-03-10 10:13:13','2025-03-10 10:13:13'),('B8A8B9E',2,0,'2025-03-10 10:14:11','2025-03-10 10:14:11'),('B8FD3B7',2,0,'2025-03-10 10:14:11','2025-03-10 10:14:11'),('DDA3AF2',2,0,'2025-03-10 10:15:15','2025-03-10 10:15:15'),('F2D3E47',2,0,'2025-03-10 10:13:13','2025-03-10 10:13:13'),('FA05918',2,0,'2025-03-10 10:14:11','2025-03-10 10:14:11');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventoryID` int NOT NULL AUTO_INCREMENT,
  `inventoryName` varchar(255) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT NULL,
  `addressLine2` varchar(255) DEFAULT NULL,
  `addressLine3` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` int DEFAULT NULL,
  `billNumber` varchar(255) NOT NULL DEFAULT 'a-0',
  `invoiceNumber` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `paymentVoucherDocNo` varchar(255) DEFAULT 'PV-000',
  `receiptVoucherDocNo` varchar(255) DEFAULT 'RV-000',
  `goodsReceiptDocNo` varchar(255) DEFAULT 'GR-000',
  `bankAmount` int NOT NULL DEFAULT '0',
  `cashAmount` int NOT NULL DEFAULT '0',
  `otherAmount` int NOT NULL DEFAULT '0',
  `phoneNumber` varchar(255) DEFAULT NULL,
  `inventoryNameAbbri` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`inventoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (2,'Shree Charbhuja Sales','Vapi Town','Vapi Town','Vapi Town','Vapi','Gujarat',396191,'SCS-0011',10,'2025-02-02 14:33:01','2025-03-13 10:51:10',NULL,'PV-007','RV-011','GR-013',-5500,5000,-5000,'8779690230','SCS'),(3,'2M Brothers','Panvel','Panvel','Panvel','Panvel','Maharashtra',410206,'a-0',0,'2025-02-02 19:33:01','2025-03-13 02:11:39',NULL,'PV-003','RV-003','GR-008',0,-7777,0,NULL,'2M'),(4,'Inventory 3','Panvel','Panvel','Panvel','Panvel','Maharashtra',410206,'a-0',0,'2025-02-21 12:04:33','2025-03-13 02:11:43',NULL,'PV-001','RV-001','GR-001',0,0,0,NULL,'TST');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventoryaccountbalance`
--

DROP TABLE IF EXISTS `inventoryaccountbalance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventoryaccountbalance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventoryID` int NOT NULL,
  `accountID` int NOT NULL,
  `openingBalance` decimal(10,2) DEFAULT '0.00',
  `closingBalance` decimal(10,2) DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inventoryID` (`inventoryID`),
  KEY `accountID` (`accountID`),
  CONSTRAINT `inventoryaccountbalance_ibfk_1` FOREIGN KEY (`inventoryID`) REFERENCES `inventory` (`inventoryID`) ON DELETE CASCADE,
  CONSTRAINT `inventoryaccountbalance_ibfk_2` FOREIGN KEY (`accountID`) REFERENCES `accounts` (`supplierID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventoryaccountbalance`
--

LOCK TABLES `inventoryaccountbalance` WRITE;
/*!40000 ALTER TABLE `inventoryaccountbalance` DISABLE KEYS */;
INSERT INTO `inventoryaccountbalance` VALUES (1,2,1,10.00,20.00,'2025-02-21 10:55:15','2025-02-21 21:03:13'),(2,3,1,0.00,0.00,'2025-02-21 10:55:15','2025-02-21 10:55:15'),(3,2,2,0.00,0.00,'2025-02-21 10:55:15','2025-02-21 10:55:15'),(4,2,3,0.00,0.00,'2025-02-21 10:55:15','2025-02-21 10:55:15'),(5,3,2,0.00,0.00,'2025-02-21 10:55:15','2025-02-21 10:55:15'),(6,3,3,0.00,0.00,'2025-02-21 10:55:15','2025-02-21 10:55:15'),(7,4,1,0.00,0.00,'2025-02-21 12:04:33','2025-02-21 12:04:33'),(8,4,3,0.00,0.00,'2025-02-21 12:04:33','2025-02-21 12:04:33'),(9,4,2,0.00,0.00,'2025-02-21 12:04:33','2025-02-21 12:04:33'),(10,2,4,0.00,0.00,'2025-02-21 20:54:48','2025-02-21 20:54:48'),(11,4,4,0.00,0.00,'2025-02-21 20:54:48','2025-02-21 20:54:48'),(12,3,4,0.00,0.00,'2025-02-21 20:54:48','2025-02-21 20:54:48');
/*!40000 ALTER TABLE `inventoryaccountbalance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorydetails`
--

DROP TABLE IF EXISTS `inventorydetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorydetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventoryID` int NOT NULL,
  `productID` int NOT NULL,
  `quantity` int DEFAULT '0',
  `lowWarning` int DEFAULT '20',
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inventory` (`inventoryID`),
  KEY `fk_product` (`productID`),
  CONSTRAINT `fk_inventory` FOREIGN KEY (`inventoryID`) REFERENCES `inventory` (`inventoryID`) ON DELETE CASCADE,
  CONSTRAINT `fk_product` FOREIGN KEY (`productID`) REFERENCES `masterproduct` (`productID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorydetails`
--

LOCK TABLES `inventorydetails` WRITE;
/*!40000 ALTER TABLE `inventorydetails` DISABLE KEYS */;
INSERT INTO `inventorydetails` VALUES (1,2,1,93,100,'active','2025-02-02 14:33:01','2025-03-13 10:51:10',NULL),(2,2,2,102,20,'active','2025-02-02 14:33:01','2025-03-13 10:05:21',NULL),(3,2,3,119,20,'active','2025-02-02 14:33:01','2025-03-13 10:40:59',NULL),(5,3,1,70,20,'active','2025-02-02 19:33:01','2025-02-15 09:27:47',NULL),(6,3,2,105,20,'active','2025-02-02 19:33:01','2025-02-15 09:27:47',NULL),(7,3,3,140,20,'active','2025-02-02 19:33:01','2025-02-15 09:27:47',NULL),(8,3,4,210,20,'active','2025-02-02 19:33:01','2025-02-15 09:27:47',NULL),(26,2,4,181,20,'active','2025-02-02 22:01:59','2025-03-13 09:56:52',NULL),(27,2,6,0,20,'active','2025-02-06 14:31:16','2025-02-19 12:14:44',NULL),(28,3,6,0,20,'active','2025-02-06 14:31:16','2025-02-06 14:31:16',NULL),(29,2,7,11,20,'active','2025-02-06 14:31:32','2025-02-19 21:08:00',NULL),(30,3,7,0,20,'active','2025-02-06 14:31:32','2025-02-06 14:31:32',NULL),(31,2,8,0,20,'active','2025-02-06 14:31:42','2025-02-06 14:31:42',NULL),(32,3,8,0,20,'active','2025-02-06 14:31:42','2025-02-06 14:31:42',NULL),(33,2,9,0,20,'active','2025-02-06 14:31:49','2025-02-19 21:14:01',NULL),(34,3,9,0,20,'active','2025-02-06 14:31:49','2025-02-06 14:31:49',NULL),(35,2,10,0,20,'active','2025-02-06 14:31:57','2025-02-06 14:31:57',NULL),(36,3,10,0,20,'active','2025-02-06 14:31:57','2025-02-06 14:31:57',NULL),(39,2,12,0,20,'active','2025-02-06 14:32:14','2025-02-06 14:32:14',NULL),(40,3,12,0,20,'active','2025-02-06 14:32:14','2025-02-06 14:32:14',NULL),(41,2,13,0,20,'active','2025-02-06 14:32:21','2025-02-06 14:32:21',NULL),(42,3,13,0,20,'active','2025-02-06 14:32:21','2025-02-06 14:32:21',NULL),(43,2,14,0,20,'active','2025-02-06 16:12:16','2025-02-06 16:12:16',NULL),(44,3,14,0,20,'active','2025-02-06 16:12:16','2025-02-06 16:12:16',NULL),(45,2,15,0,20,'active','2025-02-18 20:54:10','2025-02-18 20:54:10',NULL),(46,3,15,0,20,'active','2025-02-18 20:54:10','2025-02-18 20:54:10',NULL),(47,2,16,0,20,'active','2025-02-18 20:54:34','2025-02-18 20:54:34',NULL),(48,3,16,0,20,'active','2025-02-18 20:54:34','2025-02-18 20:54:34',NULL),(49,2,17,1,20,'active','2025-02-18 20:55:02','2025-02-19 20:43:07',NULL),(50,3,17,0,20,'active','2025-02-18 20:55:02','2025-02-18 20:55:02',NULL),(51,2,18,0,20,'active','2025-02-18 20:55:26','2025-02-18 20:55:26',NULL),(52,3,18,0,20,'active','2025-02-18 20:55:26','2025-02-18 20:55:26',NULL),(53,4,1,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(54,4,2,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(55,4,3,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(56,4,4,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(57,4,6,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(58,4,7,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(59,4,8,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(60,4,9,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(61,4,10,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(62,4,12,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(63,4,13,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(64,4,14,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(65,4,15,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(66,4,16,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(67,4,17,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL),(68,4,18,0,20,'active','2025-02-21 12:04:33','2025-02-21 12:04:33',NULL);
/*!40000 ALTER TABLE `inventorydetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorytransaction`
--

DROP TABLE IF EXISTS `inventorytransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorytransaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventoryID` int NOT NULL,
  `productID` int NOT NULL,
  `accountTransactionID` int DEFAULT NULL,
  `billID` int DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `type` enum('add','subtract','modify') DEFAULT 'subtract',
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_traInventory` (`inventoryID`),
  KEY `fk_traProduct` (`productID`),
  KEY `fk_accountTransaction` (`accountTransactionID`),
  KEY `fk_billMaster` (`billID`),
  CONSTRAINT `fk_accountTransaction` FOREIGN KEY (`accountTransactionID`) REFERENCES `accountstransactions` (`transactionID`) ON DELETE CASCADE,
  CONSTRAINT `fk_billMaster` FOREIGN KEY (`billID`) REFERENCES `billmaster` (`billID`) ON DELETE CASCADE,
  CONSTRAINT `fk_traInventory` FOREIGN KEY (`inventoryID`) REFERENCES `inventory` (`inventoryID`) ON DELETE CASCADE,
  CONSTRAINT `fk_traProduct` FOREIGN KEY (`productID`) REFERENCES `masterproduct` (`productID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorytransaction`
--

LOCK TABLES `inventorytransaction` WRITE;
/*!40000 ALTER TABLE `inventorytransaction` DISABLE KEYS */;
INSERT INTO `inventorytransaction` VALUES (1,3,1,23,NULL,10,'add','GOODS RECEIPT :GR-007','2025-02-15 09:27:47','2025-02-15 09:27:47',NULL,NULL),(2,3,2,23,NULL,15,'add','GOODS RECEIPT :GR-007','2025-02-15 09:27:47','2025-02-15 09:27:47',NULL,NULL),(3,3,3,23,NULL,20,'add','GOODS RECEIPT :GR-007','2025-02-15 09:27:47','2025-02-15 09:27:47',NULL,NULL),(4,3,4,23,NULL,30,'add','GOODS RECEIPT :GR-007','2025-02-15 09:27:47','2025-02-15 09:27:47',NULL,NULL),(5,2,1,35,NULL,4,'add','GOODS RECEIPT :GR-006','2025-02-19 12:05:47','2025-02-19 12:05:47',NULL,NULL),(6,2,2,35,NULL,3,'add','GOODS RECEIPT :GR-006','2025-02-19 12:05:47','2025-02-19 12:05:47',NULL,NULL),(12,2,7,45,NULL,10,'add','GOODS RECEIPT :GR-010','2025-02-19 21:07:29','2025-02-19 21:07:29',NULL,NULL),(14,2,1,47,NULL,1,'add','GOODS RECEIPT :GR-012','2025-02-19 21:15:59','2025-02-19 21:15:59',NULL,NULL),(15,2,1,NULL,NULL,9,'subtract','RECONCILIATION','2025-03-06 19:37:20','2025-03-06 19:37:20',NULL,'Found and lost some'),(16,2,2,NULL,NULL,7,'add','RECONCILIATION','2025-03-06 19:37:20','2025-03-06 19:37:20',NULL,'Found and lost some'),(17,2,1,NULL,NULL,9,'subtract','RECONCILIATION','2025-03-06 19:38:13','2025-03-06 19:38:13',NULL,'Found and lost some'),(18,2,1,NULL,NULL,9,'add','RECONCILIATION','2025-03-06 19:38:44','2025-03-06 19:38:44',NULL,'123'),(19,2,1,NULL,NULL,10,'subtract','RECONCILIATION','2025-03-06 19:41:37','2025-03-06 19:41:37',NULL,''),(20,2,1,NULL,NULL,10,'subtract','RECONCILIATION','2025-03-06 19:42:32','2025-03-06 19:42:32',NULL,''),(21,2,2,NULL,NULL,10,'add','RECONCILIATION','2025-03-06 19:42:32','2025-03-06 19:42:32',NULL,''),(22,2,1,NULL,1,2,'subtract','Sale','2025-03-13 09:22:59','2025-03-13 09:22:59',NULL,NULL),(23,2,2,NULL,1,1,'subtract','Sale','2025-03-13 09:22:59','2025-03-13 09:22:59',NULL,NULL),(24,2,2,NULL,2,2,'subtract','Sale','2025-03-13 09:47:35','2025-03-13 09:47:35',NULL,NULL),(25,2,3,NULL,2,1,'subtract','Sale','2025-03-13 09:47:35','2025-03-13 09:47:35',NULL,NULL),(26,2,1,NULL,3,2,'subtract','Sale','2025-03-13 09:56:18','2025-03-13 09:56:18',NULL,NULL),(27,2,2,NULL,3,2,'subtract','Sale','2025-03-13 09:56:18','2025-03-13 09:56:18',NULL,NULL),(28,2,1,NULL,4,2,'subtract','Sale','2025-03-13 09:56:46','2025-03-13 09:56:46',NULL,NULL),(29,2,3,NULL,4,1,'subtract','Sale','2025-03-13 09:56:46','2025-03-13 09:56:46',NULL,NULL),(30,2,1,NULL,5,1,'subtract','Sale','2025-03-13 09:56:52','2025-03-13 09:56:52',NULL,NULL),(31,2,4,NULL,5,1,'subtract','Sale','2025-03-13 09:56:52','2025-03-13 09:56:52',NULL,NULL),(32,2,1,NULL,6,1,'subtract','Sale','2025-03-13 09:57:24','2025-03-13 09:57:24',NULL,NULL),(33,2,2,NULL,6,1,'subtract','Sale','2025-03-13 09:57:24','2025-03-13 09:57:24',NULL,NULL),(34,2,1,NULL,7,1,'subtract','Sale','2025-03-13 10:03:42','2025-03-13 10:03:42',NULL,NULL),(35,2,2,NULL,7,1,'subtract','Sale','2025-03-13 10:03:42','2025-03-13 10:03:42',NULL,NULL),(36,2,1,NULL,8,1,'subtract','Sale','2025-03-13 10:05:21','2025-03-13 10:05:21',NULL,NULL),(37,2,2,NULL,8,1,'subtract','Sale','2025-03-13 10:05:21','2025-03-13 10:05:21',NULL,NULL),(40,2,1,NULL,10,1,'subtract','Sale','2025-03-13 10:40:59','2025-03-13 10:40:59',NULL,NULL),(41,2,3,NULL,10,1,'subtract','Sale','2025-03-13 10:41:00','2025-03-13 10:41:00',NULL,NULL),(42,2,1,NULL,11,1,'subtract','Sale','2025-03-13 10:42:56','2025-03-13 10:42:56',NULL,NULL),(43,2,1,NULL,12,5,'subtract','Sale','2025-03-13 10:51:10','2025-03-13 10:51:10',NULL,NULL);
/*!40000 ALTER TABLE `inventorytransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `masterproduct`
--

DROP TABLE IF EXISTS `masterproduct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `masterproduct` (
  `productName` varchar(128) NOT NULL,
  `aliasName` varchar(64) NOT NULL,
  `barcode` varchar(48) NOT NULL,
  `productType` enum('finished','estimated') DEFAULT 'finished',
  `img` varchar(256) DEFAULT NULL,
  `mrp` float NOT NULL,
  `discount` float NOT NULL,
  `sellingPrice` float NOT NULL,
  `wholeSalePrice` float NOT NULL,
  `gst` float NOT NULL,
  `hsnCode` varchar(24) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `productID` int NOT NULL AUTO_INCREMENT,
  `category` varchar(24) DEFAULT 'others',
  PRIMARY KEY (`productID`),
  UNIQUE KEY `barcode` (`barcode`),
  UNIQUE KEY `barcode_2` (`barcode`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `masterproduct`
--

LOCK TABLES `masterproduct` WRITE;
/*!40000 ALTER TABLE `masterproduct` DISABLE KEYS */;
INSERT INTO `masterproduct` VALUES ('Multisurface Cleaner - Refresh 1 Ltr','Product 1','1010001','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-01-16 16:40:22','2025-02-07 20:26:26',NULL,1,'others'),('Chinki Product 2','Product 2','1010002','estimated','../../../../assets/img/products/chinki-product-none.png',150,20,120,90,0,'H-123','active','2025-01-16 16:41:28','2025-03-13 09:46:27',NULL,2,'others'),('Chinki Product 2','Product 2','1010003','estimated','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,0,'H-123','active','2025-01-22 19:52:34','2025-03-13 09:46:33',NULL,3,'others'),('Chinki Product 4','Product 4','1010004','estimated','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-02 19:30:45','2025-02-08 00:04:22',NULL,4,'others'),('Chinki Product 5','Product 5','1010005','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:31:16','2025-02-08 00:04:22',NULL,6,'others'),('Chinki Product 6','Product 6','1010006','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:31:32','2025-02-08 00:04:22',NULL,7,'others'),('Chinki Product 7','Product 7','1010007','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:31:42','2025-02-08 00:04:22',NULL,8,'others'),('Chinki Product 8','Product 8','1010008','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:31:49','2025-02-08 00:04:22',NULL,9,'others'),('Chinki Product 9','Product 9','1010009','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:31:57','2025-02-08 00:04:22',NULL,10,'others'),('Chinki Product 11','Product 11','1010011','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:32:14','2025-02-08 00:04:22',NULL,12,'others'),('Chinki Product 12','Product 12','1010012','finished','../../../../assets/img/products/chinki-product-none.png',150,20,120,100,18,'H-123','active','2025-02-06 14:32:21','2025-02-08 00:04:22',NULL,13,'others'),('Mann Product 1','MP1','10777','estimated','../../../../assets/img/products/chinki-product-none.png',200,50,100,50,0,'124','active','2025-02-06 16:12:16','2025-02-08 00:04:22',NULL,14,''),('Product 13','Product 13','1010013','finished','',150,33,100,80,18,'1234','active','2025-02-18 20:54:10','2025-02-18 20:54:10',NULL,15,'others'),('Product 14','Product 14','1010014','finished','',500,20,400,300,18,'12','active','2025-02-18 20:54:34','2025-02-18 20:54:34',NULL,16,'others'),('Product 15','Product 15','1010015','finished','',800,38,500,450,18,'123','active','2025-02-18 20:55:02','2025-02-18 20:55:02',NULL,17,'others'),('Product 16','Product 16','1010016','finished','',1000,10,900,700,18,'','active','2025-02-18 20:55:26','2025-02-18 20:55:26',NULL,18,'others');
/*!40000 ALTER TABLE `masterproduct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `offerID` int NOT NULL AUTO_INCREMENT,
  `offerType` enum('free_product','flat_discount') NOT NULL,
  `minOrderValue` decimal(10,2) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `inventory` json NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `freeProductID` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `offerName` varchar(128) NOT NULL,
  `discountPerc` decimal(10,2) DEFAULT NULL,
  `isCoupon` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`offerID`),
  KEY `FK_Offers_Product` (`freeProductID`),
  CONSTRAINT `FK_Offers_Product` FOREIGN KEY (`freeProductID`) REFERENCES `masterproduct` (`productID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES (1,'flat_discount',200.00,50.00,'[2, 3, 4]',1,NULL,'2025-03-09 20:29:20','2025-03-10 19:40:08','Anniversary Offer - 20% OFF',20.00,0),(2,'free_product',750.00,NULL,'[2, 3, 4]',1,2,'2025-03-09 20:30:05','2025-03-10 10:13:13','Holi Offer - Free 3 in 1',NULL,1),(3,'free_product',300.00,NULL,'[2, 3, 4]',0,1,'2025-03-10 11:11:02','2025-03-10 18:52:34','Mann Offer',NULL,0),(4,'free_product',400.00,NULL,'[4, 3, 2]',1,2,'2025-03-10 18:52:48','2025-03-10 18:53:10','Mann Test',NULL,0);
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rewardspoint`
--

DROP TABLE IF EXISTS `rewardspoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rewardspoint` (
  `rewardID` int NOT NULL AUTO_INCREMENT,
  `billID` int NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `pointsAmount` float DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rewardID`),
  KEY `fk_rewards_bill` (`billID`),
  KEY `fk_rewards_user` (`phoneNumber`),
  CONSTRAINT `fk_rewards_bill` FOREIGN KEY (`billID`) REFERENCES `billmaster` (`billID`) ON DELETE CASCADE,
  CONSTRAINT `fk_rewards_user` FOREIGN KEY (`phoneNumber`) REFERENCES `users` (`phoneNumber`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rewardspoint`
--

LOCK TABLES `rewardspoint` WRITE;
/*!40000 ALTER TABLE `rewardspoint` DISABLE KEYS */;
INSERT INTO `rewardspoint` VALUES (1,6,'9323464022',0,'2025-03-13 09:57:24'),(2,7,'9323464022',0,'2025-03-13 10:03:42'),(3,8,'9323464022',0,'2025-03-13 10:05:21'),(5,10,'9323464022',0.24,'2025-03-13 10:41:00'),(6,11,'9323464022',-10,'2025-03-13 10:42:56'),(7,11,'9323464022',0.11,'2025-03-13 10:42:56'),(8,12,'9323464022',0.6,'2025-03-13 10:51:10');
/*!40000 ALTER TABLE `rewardspoint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `phoneNumber` varchar(15) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT NULL,
  `addressLine2` varchar(255) DEFAULT NULL,
  `addressLine3` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` int DEFAULT NULL,
  `rewardPoint` float DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `customerType` enum('new', 'existing', 'facebook', 'chinki-van') DEFAULT 'new',
  PRIMARY KEY (`phoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('8779690230','Mannnn Test','Pmukh','Pmkhdn','Line 3','Panvel','Maharashtra',410206,0,'2025-03-09 12:30:05','2025-03-09 12:30:05','new'),('9320463022','Rajeshri Patel','201, H-3, Parksight CHS','Sector 8','Near Mahatma School','Panvel','Maharashtra',410206,0,'2025-03-07 21:01:29','2025-03-07 21:25:06','existing'),('9323463022','Binu Patel','C-506, Pramukh Residency','Chala Road','','Vapi ','Gujarat',396191,0,'2025-03-07 21:04:51','2025-03-07 21:04:51','existing'),('9323464022','Mann Patel','Flat 2-1, H3 Parksight CHS','Near Mahatma School','Sector 8, Khanda Colony','Panvel','Maharashtra',410206,80.95,'2025-01-28 20:46:58','2025-03-13 10:51:10','new'),('9664660211','Preet Patel','N-401, The Park','Chala Road','Vapi','Vapi','Gujarat',396191,0,'2025-01-28 20:48:31','2025-03-07 21:25:24','existing');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-13 18:33:49
