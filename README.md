EventPro - Event Attendance & Registration System
A full-stack web application for managing event registrations and marking attendance in real-time using QR codes. Built with a Node.js backend and a modern React frontend.

🚀 Live Demo
Live Application (Frontend): 
https://event-attendance-system-rmku.vercel.app/
Live API (Backend): https://event-attendance-system-2qxl.onrender.com

✨ Key Features
Participant Registration: A sleek, user-friendly form to register attendees with their name and email.

Unique QR Code Generation: Instantly generates a unique QR pass for each participant upon successful registration.

Real-Time QR Code Scanner: A dedicated scanner page that uses the device's camera to seamlessly mark attendance.

Live Admin Dashboard: A comprehensive dashboard that updates in real-time as participants are checked in. Includes key stats like attendance rate, total registered, and absent counts.

Participant Management: The dashboard includes a filterable and searchable list of all registered participants.

Manual Check-in: Allows an admin to manually mark a participant as present directly from the dashboard.

Excel Data Export: One-click functionality to download a complete attendance report in .xlsx format.

📸 Project Screenshots
Main Dashboard View:

Registration and QR Pass Generation:

Live QR Scanner:

🛠️ Tech Stack
Frontend: React, Vite, Tailwind CSS, Axios, Lucide React

Backend: Node.js, Express.js, Sequelize, SQLite

Real-Time Communication: Socket.IO

Deployment:

Frontend deployed on Vercel.

Backend deployed on Render.

⚙️ Setup and Installation (For Local Development)
To run this project on your local machine, please follow these steps.

Prerequisites
Node.js (v18 or later)

Git

1. Clone the Repository
git clone [https://github.com/pankajkumar192/event-attendance-system.git](https://github.com/pankajkumar192/event-attendance-system.git)
cd event-attendance-system

2. Setup the Backend
In a new terminal, run the following commands:

# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create the database and add sample data
npm run seed

# Start the backend server
npm start

The backend will be running at http://localhost:4000.

3. Setup the Frontend
In a second terminal, run these commands:

# Navigate to the frontend directory
cd frontend

# Install dependencies
yarn install

# Start the frontend development server
npm run dev

The application will be accessible at http://localhost:5173.

🚀 Deployment
This project is deployed as a monorepo with separate services for the frontend and backend.

Backend Deployment: The backend folder is deployed as a "Web Service" on Render. The service is configured to run npm install and npm start.

Frontend Deployment: The frontend folder is deployed as a "Project" on Vercel. Vercel is configured to build from the /frontend root directory and uses the Vite framework preset. The API_URL and SOCKET_URL variables in App.jsx are pointed to the live Render backend URL.

This separation ensures scalability and follows modern web development best practices.
