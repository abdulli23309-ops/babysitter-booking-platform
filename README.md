# Babysitter Booking Platform - Frontend

A React + Vite web application that connects parents with babysitters and provides baby monitoring features, including AI-based cry detection.

> **Project Status:** 🚧 Currently under active development as part of our **Final Year Project (FYP-2)**. Features and UI may continue to evolve until the final submission.

---

## Overview

The Babysitter Booking Platform is designed to help parents find, hire, and manage babysitters through an easy-to-use web application. The platform also includes baby monitoring capabilities and AI-powered cry detection to improve child safety and parental awareness.

---

## Features

### Parent Side

* Browse and search babysitters
* View babysitter profiles and ratings
* Create and manage babysitting jobs
* Monitor active babysitting sessions
* Receive cry detection alerts
* Manage child profiles
* Submit reviews and ratings
* View notifications and job updates

### Babysitter Side

* Create and update professional profile
* Set availability schedules
* View and manage job requests
* Track active, upcoming, and completed jobs
* Monitor earnings
* Receive notifications
* View ratings and feedback

### AI Integration

* Real-time baby cry detection using YamNet
* Instant alerts for detected crying events
* Detection history and monitoring support

---

## Tech Stack

* **Frontend:** React 18
* **Build Tool:** Vite
* **Routing:** React Router
* **State Management:** React Hooks
* **API Communication:** Fetch API
* **Machine Learning:** TensorFlow Lite (YamNet)
* **Styling:** Custom CSS

---

## Project Structure

```text
src/
├── ParentSides/
├── Babysittersides/
├── start/
├── components/
├── Services/
├── App.jsx
└── main.jsx
```

### Main Modules

* **ParentSides** – Parent-related screens and functionality
* **Babysittersides** – Babysitter dashboard and job management
* **start** – Authentication and onboarding screens
* **components** – Shared reusable components
* **Services** – API integration and backend communication

---

## Installation

### Clone Repository

```bash
git clone https://github.com/abdulli23309-ops/babysitter-booking-platform.git
cd babysitter-booking-platform
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Application will start on:

```text
http://localhost:5173
```

---

## Production Build

```bash
npm run build
npm run preview
```

---

## Backend API

This frontend communicates with the ASP.NET Core backend:

**Backend Repository:**
https://github.com/abdulli23309-ops/babysitter-booking-platform-api

---

## Current Development Progress

The following modules are currently implemented or under development:

* User Authentication
* Parent Dashboard
* Babysitter Dashboard
* Job Management System
* Child Profile Management
* Notifications
* Ratings & Reviews
* Baby Monitoring
* AI Cry Detection
* Availability Management

---

## Future Improvements

* Live video streaming
* Real-time chat system
* Push notifications
* Online payments integration
* Advanced scheduling system
* Performance optimizations
* Mobile-responsive enhancements

---

## Author

**Abdullah Saleem**

GitHub: https://github.com/abdulli23309-ops

Email: [abdullli2309@gmail.com](mailto:abdullli2309@gmail.com)

---

## License

This project is developed for academic purposes as a **Final Year Project (FYP)**.

---

⭐ This repository represents the frontend implementation of the Babysitter Booking Platform and is currently being enhanced during **FYP-2 development**.
