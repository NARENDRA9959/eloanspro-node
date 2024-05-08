-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 07, 2024 at 12:47 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eloanspro`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(1000) NOT NULL,
  `email` varchar(1000) NOT NULL,
  `password` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`) VALUES
(1, 'Elixrpro', 'elixrpro@gmail.com', '$2a$12$h54Tcqb.uihMa/uuFBBfsenAzeuKMMwBIlfPsNdRJSnMWcsSkYWUa'),
(2, 'Narendra', 'cnarendra329@gmail.com', '$2a$12$/TTEujM9bjNMimGQiqvt0elWipks6ZzImnYMjmBBQW1o952Do1o5u'),
(3, 'ADMIN', 'admin@winway.com', '$2a$12$bCtCX6Yodga6MKHamNoV8Om31oBgU1res90K/mPfYMr5taRQPuG/u'),
(4, 'Kalyonnii', 'kalyonnii@gmail.com', '$2a$12$/TTEujM9bjNMimGQiqvt0elWipks6ZzImnYMjmBBQW1o952Do1o5u');

-- --------------------------------------------------------

--
-- Table structure for table `bankdocuments`
--

CREATE TABLE `bankdocuments` (
  `id` int(11) NOT NULL,
  `bankDocumentsId` varchar(1000) NOT NULL,
  `bankName` varchar(1000) NOT NULL,
  `program` varchar(1000) NOT NULL,
  `documents` text NOT NULL,
  `createdBy` varchar(1000) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(1000) NOT NULL,
  `bankdocumentsInternalStatus` varchar(100) NOT NULL,
  `lastBankdocumentsInternalStatus` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bankdocuments`
--

INSERT INTO `bankdocuments` (`id`, `bankDocumentsId`, `bankName`, `program`, `documents`, `createdBy`, `createdOn`, `lastUpdatedBy`, `bankdocumentsInternalStatus`, `lastBankdocumentsInternalStatus`) VALUES
(1, 'C-1457936', 'STANDARD CHARTED BANK	', 'INCOME', 'Full Set', 'Narendra', '2024-05-04 11:44:41', 'Narendra', '1', '1'),
(2, 'C-4165307', 'ICICI BANK	', 'BANKING	', 'KYC, Latest ITR full set,GST returns, Bank Statements', 'Narendra', '2024-05-04 11:46:27', 'Narendra', '1', '1'),
(3, 'B-1805379', 'ICICI BANK', 'GST	', 'KYC, Latest ITR full set,GST returns, Bank Statements', 'Narendra', '2024-05-04 11:47:26', 'Narendra', '2', '1');

-- --------------------------------------------------------

--
-- Table structure for table `bankers`
--

CREATE TABLE `bankers` (
  `id` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `salesManager` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `image` longtext NOT NULL,
  `bankerInternalStatus` varchar(100) NOT NULL,
  `lastBankerInternalStatus` varchar(100) NOT NULL,
  `lastUpdatedBy` varchar(100) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `callbacks`
--

CREATE TABLE `callbacks` (
  `id` int(11) NOT NULL,
  `callBackId` varchar(1000) NOT NULL,
  `businessName` varchar(1000) NOT NULL,
  `phone` varchar(1000) NOT NULL,
  `date` varchar(1000) NOT NULL,
  `remarks` text NOT NULL,
  `createdBy` varchar(1000) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(1000) NOT NULL,
  `callbackInternalStatus` varchar(100) NOT NULL,
  `lastCallbackInternalStatus` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `callbacks`
--

INSERT INTO `callbacks` (`id`, `callBackId`, `businessName`, `phone`, `date`, `remarks`, `createdBy`, `createdOn`, `lastUpdatedBy`, `callbackInternalStatus`, `lastCallbackInternalStatus`) VALUES
(1, '', 'Narendra', '9110762518', '03/27/2024', 'Call back done', '2024-03-04 11:04:59', '2024-03-04 00:05:51', 'Narendra', '', '1'),
(2, '', 'Narendra Transports', '8464897351', '2024-03-05T18:30:00.000Z', 'Narendra Done', '', '2024-03-04 00:31:05', 'Narendra', '', '1'),
(3, '', 'Narendra Testing', '8464897351', '2024-03-19T18:30:00.000Z', 'done', 'undefined', '2024-03-04 00:32:53', 'Narendra', '', '1'),
(4, 'C-6198725', 'Narendra Testing Finally', '5555555555', '2024-03-03T18:30:00.000Z', 'Done', 'Narendra', '2024-03-04 00:36:16', 'Narendra', '', '1'),
(5, 'C-6758041', 'kalyonnii', '7331129435', '2024-04-01T18:30:00.000Z', 'call back added', 'Narendra', '2024-04-18 13:12:32', 'Narendra', '', '1'),
(6, 'C-2308169', 'AAA', 'n msajmcn', '2024-04-09T18:30:00.000Z', 'nsa', 'Narendra', '2024-04-22 11:14:55', 'Narendra', '', '1'),
(7, 'C-4081576', 'aaa', '7878989899', '2024-04-24T18:30:00.000Z', 'he is out of station', 'Narendra', '2024-04-22 11:18:05', 'Narendra', '', '1'),
(31, 'C-5812467', 'fbfdbdf', '4543545453', '2024-05-20T18:30:00.000Z', 'erhg', 'Narendra', '2024-05-02 12:42:08', 'Narendra', '1', '1'),
(32, 'C-359780', '', '', '', '', 'Narendra', '2024-05-05 15:16:03', '', '1', '1'),
(10, 'C-8402917', 'nbhhjk', '4543456778', '2024-04-24T18:30:00.000Z', 'na', 'Narendra', '2024-04-22 12:42:36', 'Narendra', '1', '2'),
(11, 'C-7643250', 'ncm', '3245654344', '2024-04-23T18:30:00.000Z', 'vv', 'Narendra', '2024-04-22 16:40:46', 'Narendra', '2', '1'),
(12, 'C-1740385', 'dc', '2345432345', '2024-04-25T18:30:00.000Z', 'rg', 'Kalyonnii', '2024-04-22 17:10:39', 'Kalyonnii', '1', '1'),
(13, 'C-3074168', 'sample1', '4567876543', '2024-04-26T18:30:00.000Z', 'Kalyonnii done', 'Narendra', '2024-04-24 10:52:08', 'Narendra', '1', '1'),
(14, 'C-6214078', 'test2', '2345678909', '2024-04-29T18:30:00.000Z', 'busy', 'Narendra', '2024-04-24 10:52:33', 'Narendra', '1', '1'),
(15, 'C-4836015', 'test3', '0987654321', '2024-04-28T18:30:00.000Z', 'unavailable ', 'Narendra', '2024-04-24 10:54:33', 'Narendra', '1', '1'),
(16, 'C-3068147', 'bgfh', '2342224345', '2024-04-29T18:30:00.000Z', 'no', 'Narendra', '2024-04-25 09:29:31', 'Narendra', '1', '1'),
(17, 'C-1076942', 'efjdefdj', '3453455566', '2024-04-29T18:30:00.000Z', 'ewr', 'Narendra', '2024-04-27 05:31:20', 'Narendra', '1', '1'),
(18, 'C-9408273', 'jfnvk', '2354353456', '2024-04-28T18:30:00.000Z', 'ea', 'Narendra', '2024-04-27 05:31:31', 'Narendra', '1', '1'),
(19, 'C-9351487', 'ngb ', '2354344444', '2024-04-29T18:30:00.000Z', 'as', 'Narendra', '2024-04-27 05:31:48', 'Narendra', '1', '1'),
(20, 'C-2043791', 'hfbj', '2343234323', '2024-04-09T18:30:00.000Z', 'dbcfn', 'Narendra', '2024-04-27 09:24:11', 'Narendra', '1', '1'),
(21, 'C-9534781', 'dhcbdh', '9329384938', '2024-04-24T18:30:00.000Z', 'rejkfnj', 'Narendra', '2024-04-27 09:25:28', 'Narendra', '1', '1'),
(22, 'C-6827940', 'dbvjdh', '2543543222', '2024-03-05T18:30:00.000Z', 'sbj', 'Narendra', '2024-04-27 09:29:20', 'Narendra', '1', '1'),
(23, 'C-5837190', 'nvkf', '2343434342', '2024-04-16T18:30:00.000Z', 'rgfde', 'Narendra', '2024-04-27 09:40:43', 'Narendra', '1', '1'),
(24, 'C-9645702', 'jnvbjk', '2342343241', '2024-04-29T18:30:00.000Z', 'dsvjmnfjsd', 'Narendra', '2024-04-29 10:02:33', 'Narendra', '1', '1'),
(25, 'C-8176402', 'hgyg', '2343434343', '2024-04-29T18:30:00.000Z', 'fhvbjk', 'Narendra', '2024-04-29 10:03:01', 'Narendra', '1', '1'),
(26, 'C-9075612', 'jhb', '6565677678', '2024-05-28T18:30:00.000Z', 'nbh', 'Narendra', '2024-05-01 05:09:53', 'Narendra', '2', '1'),
(33, 'C-625490', '', '', '', '', 'Narendra', '2024-05-05 15:17:49', '', '1', '1'),
(30, 'C-517643', 'sample23', '7331129435', '2024-04-26', 'sample 26 done', 'Narendra', '2024-05-02 07:14:26', '', '2', '1'),
(34, 'C-435698', '', '', '', '', 'Narendra', '2024-05-05 16:01:01', '', '1', '1'),
(35, 'C-381270', '', '', '', '', 'Narendra', '2024-05-05 16:01:10', '', '1', '1'),
(37, 'C-678540', 'hjbjghbh', '8464897351', '2024-03-05', 'chinni Done', '', '2024-05-05 16:05:35', '', '1', '1'),
(38, 'C-791458', 'chinni', '8464897351', '2024-03-05', 'chinni Done', '', '2024-05-05 16:08:08', '', '1', '1'),
(39, 'C-6870924', 'mxnls', '4455454353', '2024-05-19T18:30:00.000Z', 'erg', 'Narendra', '2024-05-05 17:27:31', 'Narendra', '1', '1');

-- --------------------------------------------------------

--
-- Table structure for table `leaddocuments`
--

CREATE TABLE `leaddocuments` (
  `id` int(11) NOT NULL,
  `leadId` varchar(200) NOT NULL,
  `applicantName` varchar(100) NOT NULL,
  `applicantPhoto` varchar(1000) NOT NULL,
  `pan` varchar(1000) DEFAULT NULL,
  `aadhaar` varchar(1000) DEFAULT NULL,
  `voterId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`voterId`)),
  `kycOtherDocuments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`kycOtherDocuments`)),
  `coApplicantName` varchar(100) NOT NULL,
  `coApplicantPhoto` varchar(1000) NOT NULL,
  `coApplicantPan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`coApplicantPan`)),
  `coApplicantAadhaar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`coApplicantAadhaar`)),
  `coApplicantVoterId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`coApplicantVoterId`)),
  `coApplicantOtherDocuments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`coApplicantOtherDocuments`)),
  `email` varchar(100) NOT NULL,
  `cibilScore` int(11) NOT NULL,
  `cibilReport` varchar(1000) NOT NULL,
  `bankStatements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bankStatements`)),
  `gstCertificate` varchar(1000) NOT NULL,
  `labourTradeLicense` varchar(1000) NOT NULL,
  `vatTinTot` varchar(1000) NOT NULL,
  `msmeUdyamCertificate` varchar(1000) NOT NULL,
  `currentAccountStatements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`currentAccountStatements`)),
  `odAccountStatements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`odAccountStatements`)),
  `financialReturns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`financialReturns`)),
  `gstDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gstDetails`)),
  `existingLoans` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`existingLoans`)),
  `residenceProof` varchar(1000) NOT NULL,
  `otherDocuments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`otherDocuments`)),
  `lastUpdatedOn` varchar(1000) NOT NULL,
  `lastUpdatedBy` varchar(1000) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leaddocuments`
--

INSERT INTO `leaddocuments` (`id`, `leadId`, `applicantName`, `applicantPhoto`, `pan`, `aadhaar`, `voterId`, `kycOtherDocuments`, `coApplicantName`, `coApplicantPhoto`, `coApplicantPan`, `coApplicantAadhaar`, `coApplicantVoterId`, `coApplicantOtherDocuments`, `email`, `cibilScore`, `cibilReport`, `bankStatements`, `gstCertificate`, `labourTradeLicense`, `vatTinTot`, `msmeUdyamCertificate`, `currentAccountStatements`, `odAccountStatements`, `financialReturns`, `gstDetails`, `existingLoans`, `residenceProof`, `otherDocuments`, `lastUpdatedOn`, `lastUpdatedBy`) VALUES
(1, '1', 'Narendra Chakali', '', 'WPA323U84', '547845789458', NULL, NULL, '', '', NULL, NULL, NULL, NULL, 'narendra.test@gmail.com', 761, '[\"localhost:5000/uploads/2/cibilReport/91ceac38-6993-4091-9ad7-c12cd48e7245.pdf\",\"localhost:5000/uploads/2/cibilReport/c2aff0ac-9d57-4943-93c6-dcf604b61cd7.pdf\"]', '[{\"to\": \"03/18/2024\", \"from\": \"03/03/2024\", \"name\": \"SBI\", \"bankStatements\": [\"localhost:5000/uploads/2/bankStatements/27a8962d-9fdb-4589-bdfc-617c16b835da.pdf\", \"localhost:5000/uploads/2/bankStatements/4fac7103-b5b7-4ebe-a209-7516fd92af47.pdf\"]}, {\"to\": \"03/19/2024\", \"from\": \"03/03/2024\", \"name\": \"ICICI\", \"bankStatements\": [\"localhost:5000/uploads/2/bankStatements/b2d1f4d3-99d6-4bbb-a916-df1113e9adec.pdf\", \"localhost:5000/uploads/2/bankStatements/c977936b-1847-4329-b910-200e18f3973a.gif\", \"localhost:5000/uploads/2/bankStatements/1f5b4ef4-0598-401b-9804-3e85c8cf65b4.gif\"]}, {\"to\": \"03/18/2024\", \"from\": \"03/12/2024\", \"name\": \"HDFC\", \"bankStatements\": [\"localhost:5000/uploads/2/bankStatements/231a3306-33f5-45ab-915d-c67c0c9c3b76.pdf\", \"localhost:5000/uploads/2/bankStatements/f3f52f34-673a-46f1-85a8-8a078b6ed3f0.pdf\"]}]', '', '', '', '', NULL, NULL, NULL, '[{\"to\": \"03/26/2024\", \"from\": \"03/26/2024\", \"gst3BSale\": \"5000000\", \"gstDetails\": [\"localhost:5000/uploads/2/gstDetails/413cf194-6562-4760-8d9e-aff2c11a2e5a.pdf\", \"localhost:5000/uploads/2/gstDetails/172bba8c-19a7-4927-8d30-967b3bf65fb2.pdf\", \"localhost:5000/uploads/2/gstDetails/3b5ba0c5-b170-4c72-ac80-03ba20a27560.pdf\"], \"filingPeriod\": \"2024-03-02T18:30:00.000Z\", \"operatingState\": \"Andhra Pradesh\", \"gst3BSaleAttachment\": []}, {\"to\": \"03/26/2024\", \"from\": \"03/26/2024\", \"gst3BSale\": \"600000\", \"gstDetails\": [\"localhost:5000/uploads/2/gstDetails/792e1cb4-debf-4b7c-b1de-290d6d87d5d8.jpeg\", \"localhost:5000/uploads/2/gstDetails/ec8b7d41-2065-4acc-a17a-cd7e920d86b8.jpeg\", \"localhost:5000/uploads/2/gstDetails/e5367d76-a9f6-41d3-8807-405424eae234.jpeg\"], \"filingPeriod\": \"2024-03-23T18:30:00.000Z\", \"operatingState\": \"Kerala\", \"gst3BSaleAttachment\": []}]', '[{\"bankName\": \"SBI\", \"loanType\": \"Personal\", \"emiAmount\": \"50000\", \"emiClosingDate\": \"2024-03-03T18:30:00.000Z\"}, {\"bankName\": \"ICICI\", \"loanType\": \"Vehicle\", \"emiAmount\": \"40000\", \"emiClosingDate\": \"2024-01-31T18:30:00.000Z\"}]', '[]', '[{\"name\": \"Narendra\", \"otherAttachments\": []}]', '', ''),
(7, '21', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(8, '22', 'sample', '', 'ASDER2345W', '123443233423', NULL, NULL, '', '', NULL, NULL, NULL, NULL, 'sample@gmail.com', 444, '[]', '[{\"name\":\"BOI\",\"from\":\"04/08/2024\",\"to\":\"04/16/2024\",\"bankStatements\":[\"localhost:5000/uploads/2/bankStatements/8ae1f8c2-4b8f-454c-8bf9-52f2181a0d70.pdf\"]}]', '', '', '', '', NULL, NULL, NULL, '[{\"operatingState\":\"Kerala\",\"filingPeriod\":\"2024-04-07T18:30:00.000Z\",\"gst3BSale\":\"400000\",\"gst3BSaleAttachment\":[],\"from\":\"04/25/2024\",\"to\":\"04/25/2024\",\"gstDetails\":[\"localhost:5000/uploads/2/gstDetails/7609225e-ea43-4e79-bbac-672690804f35.pdf\"]}]', '[{\"bankName\":\"icici\",\"loanType\":\"business loan \",\"emiAmount\":\"20000\",\"emiClosingDate\":\"2024-04-29T18:30:00.000Z\"}]', '[]', '[{\"name\":\"aadhar\",\"otherAttachments\":[]}]', '', ''),
(9, '23', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(10, '24', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(11, '25', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(6, '20', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(12, '26', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(13, '27', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(14, '28', 'Hello ', '', 'WSDES2322D', '123322223333', NULL, NULL, '', '', NULL, NULL, NULL, NULL, 'sample@mail.com', 888, '[\"localhost:5000/uploads/2/cibilReport/7d9eb16e-95b2-4ddf-9258-d16b9d8fceb7.pdf\"]', '[{\"name\":\"idfc\",\"from\":\"04/08/2024\",\"to\":\"04/22/2024\",\"bankStatements\":[\"localhost:5000/uploads/2/bankStatements/f4405a2d-fd86-4720-a2c2-45d1e6e919d2.png\"]},{\"name\":\"sbi\",\"from\":\"05/14/2024\",\"to\":\"05/24/2024\",\"bankStatements\":[\"localhost:5000/uploads/2/bankStatements/b726ea78-322c-4a99-b09a-663c8229333d.pdf\"]}]', '', '', '', '', NULL, NULL, '[{\"incomeTax\":\"\",\"financialReturns\":[],\"name\":\"asncj\"}]', '[{\"operatingState\":\"Kerala\",\"filingPeriod\":\"2024-04-07T18:30:00.000Z\",\"gst3BSale\":\"656\",\"gst3BSaleAttachment\":[],\"from\":\"04/29/2024\",\"to\":\"04/29/2024\",\"gstDetails\":[]}]', '[{\"bankName\":\"BOI\",\"loanType\":\"BUSINESS LOAN\",\"emiAmount\":\"50000\",\"emiClosingDate\":\"2024-04-22T18:30:00.000Z\"}]', '[\"localhost:5000/uploads/2/residenceProof/82306887-9ec3-40c2-888c-6e7c9a299092.pdf\"]', '[{\"name\":\"AADHAR\",\"otherAttachments\":[\"localhost:5000/uploads/2/otherAttachments/06a3f64b-de96-486b-ae14-7052d7d0fc71.pdf\",\"localhost:5000/uploads/2/otherAttachments/cc008df9-cc31-4295-b46a-faa2c0c4c319.pdf\"]}]', '', ''),
(15, '29', 'testing ', '', 'ASWDE1232S', '123322112233', NULL, NULL, '', '', NULL, NULL, NULL, NULL, 'sdad1232@gmail.com', 666, '[]', '[{\"name\":\"BOI\",\"from\":\"04/01/2024\",\"to\":\"04/09/2024\",\"bankStatements\":[]}]', '', '', '', '', NULL, NULL, '[{\"incomeTaxName\":\"KJNGJDSNBJ\",\"financialReturns\":[\"localhost:5000/uploads/2/financialReturns/69a616dd-5231-4701-9ff9-adc31995d69d.pdf\"]},{\"incomeTaxName\":\"FBD nmb\",\"financialReturns\":[]}]', NULL, NULL, '', NULL, '', ''),
(16, '30', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(17, '31', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(18, '32', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(19, '33', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(20, '34', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(21, '36', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(22, '37', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(23, '38', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(24, '39', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(25, '40', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(26, '41', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(27, '42', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(28, '43', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(29, '44', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(30, '45', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(31, '46', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', ''),
(32, '47', '', '', NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, '', 0, '', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', '');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `leadId` varchar(1000) NOT NULL,
  `businessName` text NOT NULL,
  `businessEmail` varchar(100) NOT NULL,
  `contactPerson` varchar(100) NOT NULL,
  `primaryPhone` varchar(20) NOT NULL,
  `secondaryPhone` varchar(20) NOT NULL,
  `addressLine1` text NOT NULL,
  `addressLine2` text NOT NULL,
  `city` text NOT NULL,
  `state` text NOT NULL,
  `pincode` text NOT NULL,
  `leadSource` varchar(100) NOT NULL,
  `sourcedBy` varchar(100) NOT NULL,
  `businessEntity` varchar(100) NOT NULL,
  `businessTurnover` varchar(100) NOT NULL,
  `natureOfBusiness` varchar(100) NOT NULL,
  `businessOperatingSince` varchar(100) NOT NULL,
  `hadOwnHouse` varchar(100) NOT NULL,
  `loanRequirement` varchar(100) NOT NULL,
  `odRequirement` varchar(100) NOT NULL,
  `audioFiles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `leadInternalStatus` varchar(100) NOT NULL,
  `lastLeadInternalStatus` varchar(100) NOT NULL,
  `remarks` text NOT NULL,
  `createdBy` varchar(100) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(200) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `leadId`, `businessName`, `businessEmail`, `contactPerson`, `primaryPhone`, `secondaryPhone`, `addressLine1`, `addressLine2`, `city`, `state`, `pincode`, `leadSource`, `sourcedBy`, `businessEntity`, `businessTurnover`, `natureOfBusiness`, `businessOperatingSince`, `hadOwnHouse`, `loanRequirement`, `odRequirement`, `audioFiles`, `leadInternalStatus`, `lastLeadInternalStatus`, `remarks`, `createdBy`, `createdOn`, `lastUpdatedBy`, `lastUpdatedOn`) VALUES
(1, 'L-5279340', 'Narendra Transports', 'cnarendra329@gmail.com', 'Narendra Chakali', '9110762518', '8464897351', '4-39,Ramalayam Street,Testing', 'Yerraguntla', 'Kurnool', 'Andhra Pradesh', '518510', '1', '1', 'partnership', '50000', 'Manufacturer', '02/05/2024', 'yes', '60000', '50000000', '[\"localhost:5000/uploads/2/audioFiles/de8626d7-c1de-4d8f-86a6-aebf9d7cd1c7.mp3\",\"localhost:5000/uploads/2/46aeb767-45b9-4965-8f48-bce3871edad8.mp3\",\"localhost:5000/uploads/2/25af2497-78ac-406b-8a56-f197f958d083.mp3\",\"localhost:5000/uploads/2/2abd0890-791b-46da-8f7b-9c9bdb0efd2f.mp3\"]', '1', '2', 'bunny done ', 'Narendra', '2024-02-28 10:37:43', 'Narendra', '2024-02-28 10:37:43'),
(3, 'L-6921785', 'retail', 'sample@gmail.com', 'kalyonnii', '7331129435', '', 'sai nagar', 'MMMM', 'Dharmavaram', 'Andhra pradesh', '515671', '1', '1', 'partnership', '50000000', 'Service', '2020-01-13T18:30:00.000Z', 'yes', 'education', 'NA', '[]', '1', '2', 'NA', 'Narendra', '2024-04-05 17:21:15', 'Narendra', '2024-04-05 17:21:15'),
(4, 'L-7951864', 'xxxxx', 'sample@gmail.com', 'Mudhiiguubba kalyonnii', '7331129435', '', '26-1601', 'satya sai nagar ', 'Dharmavaram', 'Andhra Pradesh ', '515671', '1', '1', 'privateLimited', '0', 'Service', '04/17/2024', 'no', '600000', 'na', '[]', '1', '2', 'na', 'Narendra', '2024-04-18 07:43:30', 'Narendra', '2024-04-18 07:43:30'),
(5, 'L-7143965', 'yyyy', 'test!@gmail.com', 'test1', '9876789876', '', 'hjndsm', 'zxcvvxc', 'Dmm', 'Andhra Pradesh ', '515671', '1', '1', 'llp', '900000', 'Retail', '2024-04-11T18:30:00.000Z', 'no', '', '', '[]', '1', '2', 'na', 'Narendra', '2024-04-19 07:30:22', 'Narendra', '2024-04-19 07:30:22'),
(8, 'L-7194250', 'xcvgh', 'vdfg@gmail.com', 'jnfsdjk', '2345688999', '', 'wdjhsn', 'db vjnik', 'dvbjn', 'fbvjkfn', '234', '2', '1', 'proprietorship', '88', 'Trader', '2024-04-04T18:30:00.000Z', 'yes', '', '', '[]', '1', '2', 'na', 'Narendra', '2024-04-19 10:07:30', 'Narendra', '2024-04-19 10:07:30'),
(9, 'L-1032674', 'simuleduco', 'simuleduco@gmail.com', 'Bunny', '9874637288', '', 'kerala', '', 'thrishur', 'kerala', '438923', '2', '2', 'privateLimited', '10000000', 'Service', '2024-03-31T18:30:00.000Z', 'yes', '600000', '2000000', '[]', '1', '2', '', 'Narendra', '2024-04-20 06:44:40', 'Narendra', '2024-04-20 06:44:40'),
(10, 'L-7652140', 'Nani enterprises', 'lead1@gmail.com', 'nani', '6786546578', '', 'hyd', '', 'hyd', 'ts', '67899', 'Tele Sales', 'Narendra Chakali', 'proprietorship', '567890', 'Manufacturer', '2024-04-24T18:30:00.000Z', 'yes', '', '', '[]', '1', '2', 'na', 'Narendra', '2024-04-20 08:58:32', 'Narendra', '2024-04-20 08:58:32'),
(11, 'L-7215084', 'vbbh', 'hfufhds', 'sfdbnuj', '4678865442', 'sd', 'vfghh', '', 'jdfhu', 'ndbfj', '54', 'Tele Sales', 'Narendra Chakali', 'partnership', '998908', 'Service', '2024-04-08T18:30:00.000Z', 'yes', '', '', '[]', '5', '3', 'na', 'Narendra', '2024-04-21 13:05:01', 'Narendra', '2024-04-21 13:05:01'),
(12, 'L-6809123', 'jmkdksi', 'sdzkjfnvks', 'dkjvmki', '3498429824', '', 'bhj', '', 'hb', 'hjbuj', '5476', '1', '1', 'llp', '8790', 'Trader', '2024-04-09T18:30:00.000Z', 'no', '', '', '[]', '4', '1', 'hb', 'Narendra', '2024-04-22 04:45:47', 'Narendra', '2024-04-22 04:45:47'),
(13, 'L-7683941', 'aa', 'QQ@gmail.com', 'qq', 'qq', '', 'qq', '', 'qq', 'qq', '234234', '1', '1', 'partnership', '345', 'Service', '2024-04-09T18:30:00.000Z', 'yes', '', '', '[]', '1', '3', 'n', 'Narendra', '2024-04-22 09:33:06', 'Narendra', '2024-04-22 09:33:06'),
(14, 'L-4165207', 'aa', 'aa@gmail.com', 'cc', '8787678767', '', 'jsnfjvn', '', 'sdnc', 'jkdsnjdk', '234234', '1', '1', 'proprietorship', '123214', 'Trader', '2024-04-16T18:30:00.000Z', 'no', '', '', '[]', '1', '3', 'na', 'Narendra', '2024-04-22 09:38:49', 'Narendra', '2024-04-22 09:38:49'),
(15, 'L-6518702', 'final', 'finally@gmail.com', 'final test', '2342345345', '', 'finally', '', 'final', 'final', '234422', '1', '1', 'llp', '56666', 'Retail', '2024-04-02T18:30:00.000Z', 'yes', '', '', '[]', '5', '3', 'n', 'Narendra', '2024-04-23 06:50:10', 'Narendra', '2024-04-23 06:50:10'),
(16, 'L-2836105', 'dvsd', 'sam@gmail.com', 'sam', '2323421123', '', 'fsvn ', '', 'fjgn', 'fn gvjmf', '342131', '2', '3', 'proprietorship', '34344', 'Service', '04/09/2024', 'yes', '', '', '[]', '1', '3', 'na', 'Narendra', '2024-04-23 13:10:39', 'Narendra', '2024-04-23 13:10:39'),
(17, 'L-6795281', 'bunny enterprises', 'bunny@gmail.com', 'bfhjb', '1343432345', '', 'fdbv', '', 'fbv ', 'ndfbvjr', '342345', '2', '2', 'proprietorship', '322344', 'Retail', '2024-04-01T18:30:00.000Z', 'yes', '', '', '[]', '5', '3', 'fgb', 'Narendra', '2024-04-24 05:40:49', 'Narendra', '2024-04-24 05:40:49'),
(18, 'L-7460928', 'kkkkkkkk', 'hndbj@gmail.com', 'whjd', '3454345678', '', 'bdj', '', 'dsvhb', 'fncv', '345678', '2', '2', 'proprietorship', '467', 'Manufacturer', '2024-04-09T18:30:00.000Z', 'no', '', '', '[]', '1', '1', 'sda', 'Narendra', '2024-04-24 05:45:04', 'Narendra', '2024-04-24 05:45:04'),
(19, 'L-4582671', 'gvfhda', 'dsh@gmail.com', 'gvfdjhb', '5676567658', '', 'nbh', 'n', 'bhn', 'nkj', '567889', '2', '1', 'partnership', '675890', 'Manufacturer', '2023-02-09T18:30:00.000Z', 'yes', '', '', '[]', '1', '1', 'bg', 'Narendra', '2024-04-24 05:52:19', 'Narendra', '2024-04-24 05:52:19'),
(20, 'L-3068749', 'asdzxfc', 'acfas@gmail.com', 'jbchec', '2345432345', '', 'bvhrgfj', '', 'nmbbvit', ' jhbv', '234321', '2', '1', 'proprietorship', '3454', 'Manufacturer', '2024-04-08T18:30:00.000Z', 'yes', '', '', '[]', '1', '3', 'fd', 'Narendra', '2024-04-24 05:54:22', 'Narendra', '2024-04-24 05:54:22'),
(21, 'L-8639742', 'testing', 'sdnfjn@gmail.com', 'hbnvgj', '2345342343', '', 'fvn', '', 'fgnvbr', 'dffbnv', '342342', '2', '2', 'partnership', '34444', 'Manufacturer', '2024-04-08T18:30:00.000Z', 'no', '', '', '[]', '1', '1', 'na', 'Narendra', '2024-04-25 09:17:53', 'Narendra', '2024-04-25 09:17:53'),
(22, 'L-1426379', 'bd hjs', 'sbhda@gmail.com', 'ehbf', '3747329288', '', 'jgvjnjk', '', 'nv', 'djnf', '213123', '2', '1', 'partnership', '134123', 'Manufacturer', '2024-04-08T18:30:00.000Z', 'yes', '', '', '[]', '2', '1', 'fda', 'Narendra', '2024-04-25 09:28:50', 'Narendra', '2024-04-25 09:28:50'),
(23, 'L-2758690', 'kalyonnii enterprises', 'mybusiness@gmail.com', 'kalyonnii', '7331129435', '', 'sai nagar', '', 'Dharmavaram', 'AP', '515671', '2', '1', 'privateLimited', '100000', 'Service', '2024-04-10T18:30:00.000Z', 'no', '', '', '[]', '1', '1', 'final testing done ', 'Narendra', '2024-04-25 11:29:43', 'Narendra', '2024-04-25 11:29:43'),
(24, 'L-5064731', 'abgfhj', 'asans@gmail.com', 'bvcda', '3635362526', '', 'fnvb', '', 'fjbn', 'fjbvn', '364526', '5', '2', 'llp', '76372', 'Manufacturer', '2024-04-09T18:30:00.000Z', 'yes', '', '', '[]', '1', '1', 'ad', 'Narendra', '2024-04-27 04:51:07', 'Narendra', '2024-04-27 04:51:07'),
(25, 'L-2514079', 'asfdsa', 'asdsa@gmail.com', '1fdsnvjd', '1232112322', '', 'fnvbj', '', 'fjkgvn', 'fv f', '132211', '5', '1', 'partnership', '789', 'Manufacturer', '2024-04-08T18:30:00.000Z', 'no', '', '', '[]', '1', '1', 'nm', 'Narendra', '2024-04-27 05:29:22', 'Narendra', '2024-04-27 05:29:22'),
(26, 'L-5021938', 'afde', 'xcmvj@gmail.com', 'jggvn', '2433232321', '', 'jfbnvj', '', 'dfjvf', 'bvnfj', '232323', '6', '1', 'partnership', '23122', 'Manufacturer', '2024-04-08T18:30:00.000Z', 'yes', '', '', '[]', '1', '1', 'ef', 'Narendra', '2024-04-27 05:30:51', 'Narendra', '2024-04-27 05:30:51'),
(27, 'L-1836720', 'testing', 'testing@gmail.com', 'tester', '8134783867', '', 'testing colony ', '', 'testing', 'test', '125627', '6', '2', 'privateLimited', '900000', 'Retail', '2001-11-03T18:30:00.000Z', 'yes', '90000000', '1232222', '[\"localhost:5000/uploads/2/audioFiles/0e0b5086-85c2-4eec-af6d-b8625aa2c5d3.mp3\"]', '1', '1', 'testing done finally ', 'Narendra', '2024-04-27 09:03:22', 'Narendra', '2024-04-27 09:03:22'),
(29, 'L-9082716', 'aaaaa', 'aaa@gmail.com', 'asasa', '2322323232', '', 'fgsssssss', '', 'ssss', 'eeeeee2', '323232', '3', '1', 'proprietorship', '90000', 'Retail', '09/10/2009', 'yes', '90000', '200000', '[\"localhost:5000/uploads/2/audioFiles/c85510f4-266b-4ebe-aab8-2ee2d61fffac.mp3\"]', '3', '1', 'aaaa', 'Narendra', '2024-04-27 09:10:25', 'Narendra', '2024-04-27 09:10:25'),
(30, 'L-5671834', 'fdsfadfad', 'asdsasfadfadfd', 'vn dnvd', '7347378934', '', 'behf', '', 'jfhrjx', 'nvbjkfg', '343223', '3', '1', 'proprietorship', '931483', 'Manufacturer', '2024-04-28T18:30:00.000Z', 'yes', '990000', '4000000', '[\"localhost:5000/uploads/2/audioFiles/1eb281b4-9da1-4af6-a07a-ee2a5669bf81.mp3\"]', '3', '1', 'dwjdk', 'Narendra', '2024-04-27 09:16:21', 'Narendra', '2024-04-27 09:16:21'),
(31, 'L-4506187', 'rue', 'nvfdenjad', 'bv nd', '3847381411', '', 'wjdkf', '', 'dfjbcnvje', 'ejfnke', '349813', '2', '1', 'partnership', '909000', 'Service', '2002-02-09T18:30:00.000Z', 'yes', '4000000', '500000', '[]', '3', '1', 'nv f', 'Narendra', '2024-04-27 09:18:10', 'Narendra', '2024-04-27 09:18:10'),
(32, 'L-4397061', 'gsfdj', 'wf', 'wefdd', '3423143212', '', 'fnmd', '', 'gsrs', 'gkrjm', '515671', '5', '1', 'proprietorship', '9000', 'Trader', '2002-02-09', 'yes', '90000', '20000', '[]', '3', '1', 'eaf', 'Narendra', '2024-04-27 09:38:41', 'Narendra', '2024-04-27 09:38:41'),
(33, 'L-4710325', 'hjffvgb', 'wfcvbnda@gmail.com', 'dvjvn', '2534543521', '', 'fkjcvn', '', 'sdvjn', 'sdkfjvn', '234123', '5', '1', 'llp', '12344', 'Retail', '2024-04-22T18:30:00.000Z', 'yes', '', '', '[]', '1', '1', 'wrjfng', 'Narendra', '2024-04-29 10:01:53', 'Narendra', '2024-04-29 10:01:53'),
(34, 'L-2953607', 'hjbnhgjkvfdns', 'ahgvbjk', 'kfhvdb', '2322323232', '', 'dfvbn jd', '', 'hjedfgvbnj', 'dhgevb', '324343', '5', '1', 'proprietorship', '7678', 'Manufacturer', '2024-05-22T18:30:00.000Z', 'yes', '9999', '7899', '[]', '5', '1', 'hhbh', 'Narendra', '2024-05-01 05:09:25', 'Narendra', '2024-05-01 05:09:25'),
(38, 'L-896405', 'Example Business', 'php@gmail.com', 'Narendra php', '9110762518', '8464897351', '4-39,Ramalayam Street,Testing', 'Yerraguntla', 'Kurnool', 'Andhra Pradesh', '518510', '2', '1', 'partnership', '50000', 'Manufacturer', '02/05/2024', 'yes', '60000', '50000000', '[]', '1', '1', 'Narendra Done', '', '2024-05-02 05:05:47', '', '2024-05-02 05:05:47'),
(42, 'L-517026', 'PHP Transports', 'php@gmail.com', 'Narendra php', '9110762518', '8464897351', '4-39,Ramalayam Street,Testing', 'nandyal', 'Kurnool', 'Andhra Pradesh', '518510', '2', '1', 'partnership', '50000', 'Manufacturer', '02/05/2024', 'yes', '60000', '50000000', '[]', '1', '1', '', '', '2024-05-05 11:36:23', '', '2024-05-05 11:36:23'),
(43, 'L-397480', ' Transports', 'php@gmail.com', ' php', '', '8464897351', '4-39,Ramalayam Street,Testing', 'nandyal', 'Kurnool', 'Andhra Pradesh', '518510', '2', '1', '', '50000', 'Manufacturer', '02/05/2024', 'yes', '60000', '50000000', '[]', '1', '2', '', '', '2024-05-05 11:53:41', '', '2024-05-05 11:53:41'),
(44, 'L-4293870', 'dnvn', 'c vf', 'd,mm fnnm', '2343433434', '', 'm,me fnm', '', 'dfjvbdf', 'jg', '324334', '6', '1', 'privateLimited', '24343', 'Manufacturer', '2024-05-07T18:30:00.000Z', 'yes', '', '', '[]', '1', '1', 'cbvbv', 'Narendra', '2024-05-05 17:22:06', 'Narendra', '2024-05-05 17:22:06'),
(45, 'L-5672984', 'j', 'jjjj', 'hjnhn', '6777878783', '', 'fdjzknbj', '', 'fjb vhj', 'sdf', '567777', '3', '1', 'proprietorship', '888', 'Manufacturer', '2024-05-06T18:30:00.000Z', 'no', '', '', '[]', '1', '1', 'kjnj', 'Narendra', '2024-05-06 04:56:55', 'Narendra', '2024-05-06 04:56:55'),
(46, 'L-2739061', 'hafdbch', 'dhabv', 'hjsdfgv', '6565667677', '', 'nmjcv', '', 'fvjdsf', 'sfdvsf', '776763', '6', '3', 'partnership', '99', 'Trader', '2024-05-07T18:30:00.000Z', 'yes', '', '', '[]', '1', '1', 'nbafhc', 'Narendra', '2024-05-06 06:15:11', 'Narendra', '2024-05-06 06:15:11'),
(47, 'L-5294081', 'ahdbv', 'fsbf', 'sgvs', '6566565656', '', 'b ', '', 'dasfg', 'dgvd', '454545', '3', '3', 'partnership', '89989', 'Trader', '2024-05-13T18:30:00.000Z', 'no', '', '', '[]', '1', '1', 'dvcs', 'Narendra', '2024-05-06 09:14:37', 'Narendra', '2024-05-06 09:14:37');

-- --------------------------------------------------------

--
-- Table structure for table `leadsources`
--

CREATE TABLE `leadsources` (
  `id` int(11) NOT NULL,
  `name` varchar(1000) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leadsources`
--

INSERT INTO `leadsources` (`id`, `name`, `createdOn`) VALUES
(1, 'Tele Sales', '2024-02-25 12:08:54'),
(2, 'Direct Sales', '2024-02-25 12:08:54'),
(3, 'Operational', '2024-04-27 04:41:46'),
(5, 'Credit Ops', '2024-04-27 04:42:40'),
(6, 'Associate', '2024-04-27 04:43:21');

-- --------------------------------------------------------

--
-- Table structure for table `leadstatus`
--

CREATE TABLE `leadstatus` (
  `id` int(11) NOT NULL,
  `status` varchar(1000) NOT NULL,
  `displayName` varchar(1000) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leadstatus`
--

INSERT INTO `leadstatus` (`id`, `status`, `displayName`, `createdOn`) VALUES
(1, 'new', 'New', '2024-02-13 12:27:36'),
(2, 'archived', 'Archived', '2024-02-13 12:27:36'),
(3, 'files', 'Files', '2024-02-13 12:28:00'),
(4, 'partialFiles', 'Partial Files', '2024-02-13 12:28:00'),
(5, 'creditEvaluation', 'Credit Evaluation', '2024-02-13 12:28:29'),
(6, 'login', 'Login', '2024-02-13 12:28:29'),
(7, 'approval', 'Approval', '2024-02-13 12:28:50'),
(8, 'disbursal', 'Disbursal', '2024-02-13 12:28:50'),
(9, 'reject', 'Reject', '2024-02-13 12:28:57');

-- --------------------------------------------------------

--
-- Table structure for table `lenders`
--

CREATE TABLE `lenders` (
  `id` int(100) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `branch` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lenders`
--

INSERT INTO `lenders` (`id`, `bankName`, `branch`) VALUES
(1, 'STANDARD CHARTED BANK', 'Hyderabad'),
(2, 'IDFC BANK-BIL', 'Hyderabad'),
(3, 'HDFC BANK', 'Hyderabad'),
(4, 'KOTAK MAHINDRA BANK', 'Hyderabad'),
(5, 'FED BANK', 'Hyderabad'),
(6, 'UNITY BANK', 'Hyderabad'),
(7, 'L&T Financial Services', 'Hyderabad'),
(8, 'AXIS BANK', 'Hyderabad'),
(9, 'ICICI BANK', 'Hyderabad'),
(10, 'LENDING KART ', 'Hyderabad'),
(11, 'BAJAJ FINSERV', 'Hyderabad'),
(12, 'HERO FINCORP', 'Hyderabad'),
(13, 'YES BANK', 'Hyderabad'),
(14, 'FULLERTON INDIA - BIL', 'Hyderabad'),
(15, 'FINPLEX - RBL', 'Hyderabad'),
(16, 'GROWTH SOURCE', 'Hyderabad'),
(17, 'AXIS FINANCE', 'Hyderabad'),
(18, 'INDITRADE CAPITAL ', 'Hyderabad'),
(19, 'SME CORNER ', 'Hyderabad'),
(20, 'PIRAMAL', 'Hyderabad'),
(21, 'TATA CAPITAL - SBIL', 'Hyderabad'),
(22, 'KINARA CAPITAL', 'Hyderabad'),
(23, 'AMBIT FINVEST', 'Hyderabad'),
(24, 'FIRE LIGHT', 'Hyderabad'),
(25, 'NEO GROWTH', 'Hyderabad'),
(26, 'FT CASH', 'Hyderabad'),
(27, 'TATA CAPITAL - BIL', 'Hyderabad'),
(28, 'POONAWALLA FINCORP', 'Hyderabad'),
(29, 'ASHV FINANCE', 'Hyderabad'),
(30, 'ADITYA BIRLA - BIL', 'Hyderabad'),
(31, 'FINTREE', 'Hyderabad'),
(32, 'UGRO CAPITAL - BIL', 'Hyderabad'),
(33, 'UGRO CAPITAL - SBIL', 'Hyderabad'),
(34, 'ADITHYA BIRLA - SBIL', 'Hyderabad'),
(35, 'INDITRADE', 'Hyderabad'),
(36, 'EDELWEISS', 'Hyderabad'),
(37, 'IDFC-SBILL', 'Hyderabad'),
(38, 'Chola Mandalam Finance', 'Hyderabad');

-- --------------------------------------------------------

--
-- Table structure for table `userrole`
--

CREATE TABLE `userrole` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `userType` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userrole`
--

INSERT INTO `userrole` (`id`, `name`, `designation`, `userType`) VALUES
(1, 'Super Admin', 'Super Admin', '1'),
(2, 'Admin', 'Admin', '2'),
(3, 'Tele Sales', 'Tele Sales', '3');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `userType` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `userInternalStatus` varchar(100) NOT NULL,
  `lastUserInternalStatus` varchar(100) NOT NULL,
  `addedOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(100) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userId`, `name`, `userType`, `email`, `phone`, `userInternalStatus`, `lastUserInternalStatus`, `addedOn`, `status`) VALUES
(1, 'U-2605413', 'Narendra', '3', 'nbvhfb', '6665666544', '1', '1', '2024-05-06 07:47:47', 'Inactive'),
(2, 'U-7386159', 'Naru', '2', 'bfhjb', '7457847567', '1', '2', '2024-05-06 07:48:15', 'Inactive'),
(3, 'U-3807249', 'Kalyonnii ', '3', 'fjnvbjfnj', '2343232433', '1', '1', '2024-05-06 08:53:52', 'Inactive'),
(4, 'U-4096832', 'bnvdsfhg', '2', 'bcxvjh', '5454545454', '1', '1', '2024-05-06 09:32:56', 'Active'),
(5, 'U-2785304', 'Mudhiiguubba kalyonnii', '1', 'nbxchjd', '7331129435', '1', '1', '2024-05-06 09:39:17', 'Active'),
(6, 'U-3498526', 'aaaaa', '3', 'hjsfbh', '7676475674', '1', '1', '2024-05-06 12:11:11', 'Active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bankdocuments`
--
ALTER TABLE `bankdocuments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bankers`
--
ALTER TABLE `bankers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `callbacks`
--
ALTER TABLE `callbacks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leaddocuments`
--
ALTER TABLE `leaddocuments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leadsources`
--
ALTER TABLE `leadsources`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leadstatus`
--
ALTER TABLE `leadstatus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lenders`
--
ALTER TABLE `lenders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `userrole`
--
ALTER TABLE `userrole`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bankdocuments`
--
ALTER TABLE `bankdocuments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bankers`
--
ALTER TABLE `bankers`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `callbacks`
--
ALTER TABLE `callbacks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `leaddocuments`
--
ALTER TABLE `leaddocuments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `leadsources`
--
ALTER TABLE `leadsources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `leadstatus`
--
ALTER TABLE `leadstatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `lenders`
--
ALTER TABLE `lenders`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `userrole`
--
ALTER TABLE `userrole`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
