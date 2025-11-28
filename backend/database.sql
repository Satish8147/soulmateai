CREATE DATABASE IF NOT EXISTS  ;
USE soulmateai;

CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    dob DATE,
    birthTime TIME,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    religion VARCHAR(100),
    caste VARCHAR(100),
    subCaste VARCHAR(100),
    motherTongue VARCHAR(100),
    profession VARCHAR(255),
    location VARCHAR(255),
    education VARCHAR(255),
    height VARCHAR(50),
    income VARCHAR(100),
    maritalStatus ENUM('Never Married', 'Divorced', 'Widowed') NOT NULL,
    bio TEXT,
    hobbies JSON,
    imageUrl LONGTEXT,
    gallery JSON,
    traits VARCHAR(255),
    partnerPref TEXT,
    fatherOccupation VARCHAR(255),
    motherOccupation VARCHAR(255),
    siblings INT,
    familyLocation VARCHAR(255),
    familyStatus VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dummy Data for Profiles
INSERT INTO profiles (name, age, dob, birthTime, gender, religion, caste, subCaste, motherTongue, profession, location, education, height, income, maritalStatus, bio, hobbies, imageUrl, gallery, traits, partnerPref, verified) VALUES
('Aarav Sharma', 28, '15/08/1995', '14:30', 'Male', 'Hindu', 'Brahmin', 'Kanyakubja', 'Hindi', 'Software Engineer', 'Bangalore, India', 'B.Tech in CS', '5'' 10"', '25-30 LPA', 'Never Married', 'I am a passionate software engineer who loves to travel and explore new cultures. Looking for someone who shares my love for adventure.', '["Traveling", "Photography", "Coding"]', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '[]', 'Ambitious, Loyal, Adventurous', 'Looking for a kind and educated partner.', TRUE),

('Priya Patel', 26, '22/05/1997', '09:15', 'Female', 'Hindu', 'Patel', 'Leuva', 'Gujarati', 'Doctor', 'Mumbai, India', 'MBBS, MD', '5'' 5"', '20-25 LPA', 'Never Married', 'Dedicated doctor with a love for classical music and dance. Seeking a supportive partner with a good sense of humor.', '["Dancing", "Reading", "Music"]', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '[]', 'Caring, Intelligent, Traditional', 'Someone who respects family values.', TRUE),

('Rohan Singh', 30, '10/12/1993', '18:45', 'Male', 'Sikh', 'Jat', '', 'Punjabi', 'Entrepreneur', 'Delhi, India', 'MBA', '6'' 0"', '40-50 LPA', 'Never Married', 'Ambitious entrepreneur building the next big thing. I enjoy fitness and outdoor sports.', '["Gym", "Cricket", "Business"]', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '[]', 'Confident, Hardworking, Fun', 'Looking for an independent and modern partner.', FALSE),

('Ananya Iyer', 27, '03/03/1996', '06:00', 'Female', 'Hindu', 'Brahmin', 'Iyer', 'Tamil', 'Architect', 'Chennai, India', 'B.Arch', '5'' 4"', '15-20 LPA', 'Never Married', 'Creative soul who loves designing spaces. I am deeply rooted in my culture but have a modern outlook.', '["Painting", "Yoga", "Traveling"]', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '[]', 'Creative, Calm, Spiritual', 'Seeking a partner who appreciates art and culture.', TRUE),

('Vikram Malhotra', 29, '18/11/1994', '11:20', 'Male', 'Hindu', 'Khatri', '', 'Punjabi', 'Investment Banker', 'London, UK', 'M.Sc Finance', '5'' 11"', '60-70 LPA', 'Never Married', 'Finance professional based in London. I love fine dining and playing golf on weekends.', '["Golf", "Reading", "Cooking"]', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '[]', 'Sophisticated, Intelligent, Witty', 'Looking for a partner who is career-oriented and loves to travel.', TRUE);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender ENUM('user', 'ai') NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    relatedProfileIds JSON
);

CREATE TABLE IF NOT EXISTS user_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_connection (sender_id, receiver_id)
);
