# SkillHub

SkillHub is a platform designed to connect freelancers and employers, enabling the seamless posting of jobs, bidding on projects, and providing reviews for services rendered. The application aims to facilitate collaboration and create opportunities for individuals in various fields.

## Features

- **User Authentication:** Secure login and registration system for both freelancers and employers
- **Job Marketplace:** Employers can post job listings and freelancers can browse available projects
- **Bidding System:** Freelancers can place bids on jobs, allowing employers to choose the best candidate for their projects
- **Review System:** Users can provide feedback on their experiences, fostering a community of trust and quality service
- **Real-time Notifications:** Stay updated with instant notifications for new bids, messages, and project updates
- **Profile Management:** Comprehensive profile system for showcasing skills, experience, and portfolio
- **Search & Filter:** Advanced search functionality to find relevant jobs and talents

## Technology Stack

### Frontend
- React.js
- Material-UI
- Redux for state management
- Socket.io for real-time features

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Group 06

| Name             | Roll No.          |
|------------------|-------------------|
| Mithun U         | S20220010139      |
| Varshitha B      | S20220010028      |
| Shrishti         | S20220010202      |
| Trinay Mitra     | S20220010194      |
| Vikas            | S20220010185      |

# Getting Started

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## Installation Guide

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/codegasms/SkillHub.git
   cd skillhub
   ```

2. **Environment Setup:**
   Create `.env` files in both client and server directories:

   Server `.env`:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

   Client `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Install Dependencies:**

   Install root dependencies:
   ```bash
   npm install
   ```

   Server setup:
   ```bash
   cd server
   npm install
   ```

   Client setup:
   ```bash
   cd ../client
   npm install
   ```

4. **Database Setup:**
   - Ensure MongoDB is running on your system
   - The server will automatically create the required collections

5. **Running the Application:**

   Development mode:
   ```bash
   # From the root directory
   npm run dev     # Runs both client and server concurrently
   ```

   Or run separately:
   ```bash
   # Run server (from server directory)
   npm start

   # Run client (from client directory)
   npm run dev
   ```

   The client will run on `http://localhost:3000` and the server on `http://localhost:5000`

## Usage Guide

1. **Registration/Login:**
   - Create a new account or login with existing credentials
   - Choose between Freelancer or Employer account type

2. **For Employers:**
   - Post new jobs with detailed descriptions
   - Review and accept bids from freelancers
   - Manage ongoing projects
   - Release payments and provide reviews

3. **For Freelancers:**
   - Browse available projects
   - Submit bids on interesting projects
   - Manage ongoing work
   - Receive payments and feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
