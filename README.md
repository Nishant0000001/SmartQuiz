# 🧠 SmartQuiz

SmartQuiz is a powerful and interactive quiz application built using **C (Data Structures)**, **MySQL**, and a **React + Node.js** web interface. It combines fast performance with a dynamic user/admin experience, making it ideal for competitive quizzes, educational platforms, and internal tests.

## 📌 Features

### 🧑‍💼 Admin Panel
- Secure Admin Login
- Add/Edit/Delete Questions
- Set Timers for Quiz
- View User Scores & Attempts
- Upload Questions via CSV/Excel
- Dashboard with Stats & Analytics
- Role-Based Access (Multiple Admins)

### 👨‍🎓 User Panel
- Secure User Login (via ID + Common Password)
- Navigate Through Questions
- Timer-Based Quiz Submission
- Real-Time Score Evaluation
- Result Summary on Completion

### ⚙️ Backend (Hybrid Integration)
- **C-based Quiz Engine** using:
  - Binary Search Tree (BST) for score sorting
  - Queue for managing quiz flow
- **MySQL** for:
  - Storing questions
  - Recording user attempts and scores
- **Node.js** handles:
  - Bridging frontend and backend (with C executable)
  - REST APIs for admin/user interaction

### 🖥️ Frontend
- Built with **React.js**
- Clean UI with:
  - Landing Page
  - Separate Admin & User Routes
  - Responsive Design

---

## 📂 File Structure Overview

SmartQuiz/
├── client/ # React frontend
├── server/ # Node.js backend
├── quiz.exe # Compiled C quiz engine
├── quiz.c # Original C source code
├── database.sql # MySQL schema & sample data
└── README.md # Project documentation


---

## 🚀 Getting Started

### 1. Clone the Repository

bash
git clone https://github.com/Nishant0000001/SmartQuiz.git
cd SmartQuiz

### 2. Setup Postgres Sql Database
Create a database and import database.sql

Update credentials in backend config

###3. Build & Run C Executable
If you want to compile quiz.c manually:
gcc -o quiz quiz.c $(/mingw64/bin/pg_config --cflags) -L/mingw64/lib -lpq

###4. Start Backend
bash
cd server
npm install
npm start

###5. Start Frontend
bash
cd client
npm install
npm start

###Contributors
Nishant Bijalwan - Project Author & Developer

###Support
If you find this project helpful, give it a ⭐ on GitHub!
