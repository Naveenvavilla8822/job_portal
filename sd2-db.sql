-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 12, 2025 at 01:29 AM
-- Server version: 8.2.0
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `application_id` int NOT NULL,
  `job_id` int NOT NULL,
  `job_seeker_id` int NOT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `cover_letter` text,
  `status` enum('Pending','Reviewed','Accepted','Rejected') DEFAULT 'Pending',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`application_id`, `job_id`, `job_seeker_id`, `resume`, `cover_letter`, `status`, `applied_at`) VALUES
(1, 1, 1, 'resume_john.pdf', 'I am excited about this opportunity.', 'Pending', '2025-03-12 01:21:33'),
(2, 2, 2, 'resume_emma.pdf', 'I have experience in financial analysis.', 'Pending', '2025-03-12 01:21:33'),
(3, 3, 4, 'resume_sophia.pdf', 'I am passionate about UI/UX design.', 'Pending', '2025-03-12 01:21:33'),
(4, 4, 1, 'resume_john.pdf', 'I have a strong background in AI.', 'Pending', '2025-03-12 01:21:33'),
(5, 5, 2, 'resume_emma.pdf', 'I am experienced in digital marketing.', 'Pending', '2025-03-12 01:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `company_id` int NOT NULL,
  `employer_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `logo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`company_id`, `employer_id`, `name`, `website`, `location`, `description`, `logo`, `created_at`) VALUES
(1, 3, 'Tech Solutions Ltd.', 'https://techsolutions.com', 'London, UK', 'A leading software development company.', NULL, '2025-03-12 01:21:33'),
(2, 5, 'FinanceCorp', 'https://financecorp.com', 'London, UK', 'Investment and banking solutions provider.', NULL, '2025-03-12 01:21:33'),
(3, 3, 'WebDesign Ltd.', 'https://webdesignltd.com', 'London, UK', 'Specializing in modern website designs.', NULL, '2025-03-12 01:21:33'),
(4, 5, 'Data Analytics Co.', 'https://dataanalyticsco.com', 'London, UK', 'Big data and AI-driven analytics solutions.', NULL, '2025-03-12 01:21:33'),
(5, 3, 'E-Commerce Hub', 'https://ecommercehub.com', 'London, UK', 'Innovating online shopping experiences.', NULL, '2025-03-12 01:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `contact_us`
--

CREATE TABLE `contact_us` (
  `contact_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contact_us`
--

INSERT INTO `contact_us` (`contact_id`, `name`, `email`, `subject`, `message`, `submitted_at`) VALUES
(1, 'John Doe', 'john.doe@example.com', 'Job Inquiry', 'I would like to know more about job openings.', '2025-03-12 01:21:33'),
(2, 'Emma Watson', 'emma.watson@example.com', 'Application Status', 'Can I get an update on my application?', '2025-03-12 01:21:33'),
(3, 'David Smith', 'david.smith@example.com', 'Company Partnership', 'Interested in collaborating with your platform.', '2025-03-12 01:21:33'),
(4, 'Sophia Johnson', 'sophia.johnson@example.com', 'Profile Issue', 'I am unable to update my profile details.', '2025-03-12 01:21:33'),
(5, 'James Brown', 'james.brown@example.com', 'HR Assistance', 'Need help with job posting guidelines.', '2025-03-12 01:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `job_id` int NOT NULL,
  `employer_id` int NOT NULL,
  `company_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `job_type` enum('Full-time','Part-time','Contract','Internship') DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`job_id`, `employer_id`, `company_id`, `title`, `description`, `salary_range`, `job_type`, `location`, `posted_at`) VALUES
(1, 3, 1, 'Software Engineer', 'Looking for an experienced software engineer proficient in Java and React.', '£50,000 - £70,000', 'Full-time', 'London, UK', '2025-03-12 01:21:33'),
(2, 5, 2, 'Financial Analyst', 'Seeking a financial analyst with expertise in risk management.', '£40,000 - £60,000', 'Full-time', 'London, UK', '2025-03-12 01:21:33'),
(3, 3, 3, 'UI/UX Designer', 'Hiring a UI/UX designer to work on mobile app projects.', '£35,000 - £55,000', 'Part-time', 'London, UK', '2025-03-12 01:21:33'),
(4, 5, 4, 'Data Scientist', 'Looking for a data scientist with experience in machine learning.', '£60,000 - £80,000', 'Full-time', 'London, UK', '2025-03-12 01:21:33'),
(5, 3, 5, 'Digital Marketing Specialist', 'We need a marketing expert to manage our social media campaigns.', '£30,000 - £50,000', 'Contract', 'London, UK', '2025-03-12 01:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `saved_jobs`
--

CREATE TABLE `saved_jobs` (
  `saved_id` int NOT NULL,
  `job_seeker_id` int NOT NULL,
  `job_id` int NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `saved_jobs`
--

INSERT INTO `saved_jobs` (`saved_id`, `job_seeker_id`, `job_id`, `saved_at`) VALUES
(1, 1, 1, '2025-03-12 01:21:33'),
(2, 2, 2, '2025-03-12 01:21:33'),
(3, 4, 3, '2025-03-12 01:21:33'),
(4, 1, 4, '2025-03-12 01:21:33'),
(5, 2, 5, '2025-03-12 01:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('job_seeker','employer') NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bio` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `role`, `profile_picture`, `location`, `bio`, `created_at`) VALUES
(1, 'Amit Sharma', 'amit.sharma@example.com', 'hashed_password_1', 'job_seeker', NULL, 'Mumbai, India', 'Software Engineer with 3 years of experience.', '2025-03-12 01:21:09'),
(2, 'Priya Reddy', 'priya.reddy@example.com', 'hashed_password_2', 'job_seeker', NULL, 'Hyderabad, India', 'Marketing professional passionate about digital campaigns.', '2025-03-12 01:21:09'),
(3, 'Rajesh Iyer', 'rajesh.iyer@example.com', 'hashed_password_3', 'employer', NULL, 'Bangalore, India', 'Founder of a startup looking for talented developers.', '2025-03-12 01:21:09'),
(4, 'Neha Patel', 'neha.patel@example.com', 'hashed_password_4', 'job_seeker', NULL, 'Ahmedabad, India', 'Graphic designer with expertise in UI/UX.', '2025-03-12 01:21:09'),
(5, 'Vikram Mehta', 'vikram.mehta@example.com', 'hashed_password_5', 'employer', NULL, 'Delhi, India', 'HR manager at a leading IT firm.', '2025-03-12 01:21:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `job_seeker_id` (`job_seeker_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`company_id`),
  ADD KEY `employer_id` (`employer_id`);

--
-- Indexes for table `contact_us`
--
ALTER TABLE `contact_us`
  ADD PRIMARY KEY (`contact_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`job_id`),
  ADD KEY `employer_id` (`employer_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD PRIMARY KEY (`saved_id`),
  ADD KEY `job_seeker_id` (`job_seeker_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `application_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `company_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contact_us`
--
ALTER TABLE `contact_us`
  MODIFY `contact_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `job_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  MODIFY `saved_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_seeker_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`job_seeker_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
