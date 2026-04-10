# Smart Curriculum Activity & Attendance Management Application

A full-stack MERN application for managing student attendance, curriculum, and academic activities.

## Project Structure

### Backend
- **src/config**: Database connection and other configurations.
- **src/models**: Mongoose schemas for all entities (User, Class, Subject, Attendance, etc.).
- **src/controllers**: Business logic for each module.
- **src/routes**: API endpoint definitions.
- **src/middleware**: Authentication and authorization middleware.
- **src/utils**: Helper functions like email sending and CSV export.

### Frontend Web
- **src/components**: Reusable UI components (Header, Notification).
- **src/pages**: Role-based dashboard and module-specific pages.
- **src/store**: Redux Toolkit slices for state management.
- **src/utils**: API client and utility functions.
- **public**: Static assets and main HTML template.

### Frontend Mobile
- **src/navigation**: Navigation stacks (Login vs. Dashboard).
- **src/screens**: Mobile-specific UI screens.
- **src/store**: Mobile-optimized Redux slices.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, JWT, Socket.io.
- **Frontend Web**: React, Redux Toolkit, Material UI, Axios.
- **Frontend Mobile**: React Native, Redux, Axios.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- React Native Development Environment (for mobile)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` with your `MONGO_URI` and `JWT_SECRET`.
4. `npm run dev`

### Frontend Web Setup
1. `cd frontend-web`
2. `npm install`
3. `npm start`

### Mobile Setup
1. `cd frontend-mobile`
2. `npm install`
3. Update `API_URL` in `src/store/authSlice.js` with your local IP.
4. `npx react-native run-android` or `run-ios`.

## Deployment & Production

### Backend (Production)
1. Set `NODE_ENV=production` in `.env`.
2. Use a process manager like **PM2**: `pm2 start src/server.js --name smart-curriculum-api`.
3. Set up a Reverse Proxy (like **Nginx**) to handle SSL and port forwarding.

### Frontend Web (Production)
1. `cd frontend-web`
2. `npm run build`
3. Serve the `build/` folder using Nginx or a static hosting service (Netlify, Vercel, AWS S3).

### Security Best Practices
- Use **Helmet.js** (already integrated).
- Enable **CORS** for specific origins (integrated).
- Hash passwords using **bcrypt** (integrated).
- Use **Environment Variables** for secrets.

## Features
- **RBAC**: Roles for Admin, Teacher, Student, and Parent.
- **Attendance**: Real-time tracking with **Socket.io**.
- **Dashboard**: Interactive data visualizations.
- **Academic**: Subject management and assignment submissions.
- **Mobile**: Cross-platform mobile access.
