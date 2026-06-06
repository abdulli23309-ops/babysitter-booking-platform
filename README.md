# Babysitter Booking Platform - Frontend

React + Vite web application for parents to find and book babysitters with real-time monitoring and AI cry detection.

## 🎯 Features

- **Parent Dashboard**: Browse and hire babysitters
- **Babysitter Profiles**: View ratings, availability, and specializations
- **Job Management**: Create, track, and manage babysitting jobs
- **Real-time Monitoring**: Monitor baby with audio/video feed
- **Cry Detection**: YamNet ML alerts when baby cries
- **Chat System**: Real-time messaging with babysitter
- **Reviews & Ratings**: Rate babysitters after job completion
- **Notifications**: Real-time job updates and alerts

## 🏗️ Project Structure
src/
├── ParentSides/          # Parent user pages
│   ├── ParentDashboard.jsx
│   ├── SearchBabySitter.jsx
│   ├── BabyMonitoringScreen.jsx
│   ├── ChildProfile.jsx
│   └── UpdateChildProfileScreen.jsx
├── BabysitterSides/      # Babysitter user pages
│   ├── BabySitterDashboard.jsx
│   ├── UpdateProfile.jsx
│   ├── SetAvailability.jsx
│   └── Ratings.jsx
├── start/                # Authentication & onboarding
│   ├── Splash.jsx
│   ├── RoleSelection.jsx
│   ├── login.jsx
│   └── CryDetector.jsx
├── components/           # Reusable components
│   ├── ParentBottomNav.jsx
│   └── BabysitterBottomNav.jsx
├── Services/
│   └── api.js            # Backend API calls
└── App.jsx               # Main app component

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Inline CSS (custom design system)
- **ML Model**: TensorFlow Lite (YamNet for cry detection)
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)

## 🚀 Setup & Run

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/abdulli23309-ops/babysitter-booking-platform.git
cd babysitter-booking-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
npm run preview
```

## 📱 Key Screens

### Parent Screens
- **Main Screen**: Search and filter babysitters
- **Baby Monitoring**: Real-time baby monitoring with cry alerts
- **Child Profile**: Manage children's information
- **Job Management**: Track active, upcoming, and completed jobs
- **Babysitter Details**: View full babysitter profile and ratings

### Babysitter Screens
- **Dashboard**: View available jobs and earnings
- **Set Availability**: Define working hours
- **My Jobs**: Active, upcoming, and completed jobs
- **Profile**: Update personal info and skills
- **Ratings**: View customer reviews

## 🧠 ML Integration

The app includes YamNet (TensorFlow Lite) for real-time cry detection:
- Processes audio from baby monitor
- Detects crying with confidence score
- Sends alerts to parent instantly
- Stores detection history

### Models Included
- `public/yamnet/` - YamNet model shards and metadata
- Automatic model loading and inference

## 🔄 API Integration

Frontend communicates with ASP.NET Core backend at:
- **API Base URL**: Configured in `src/Services/api.js`
- All requests include proper headers and error handling
- Real-time updates via polling/WebSockets

See [Backend Repository](https://github.com/abdulli23309-ops/babysitter-booking-platform-api) for API documentation.

## 📊 Component Hierarchy
App
├── Splash (Initial Loading)
├── RoleSelection (Parent/Babysitter Choice)
├── LoginFlow
│   ├── login
│   └── CreateAccount
├── ParentFlow
│   ├── ParentDashboard
│   ├── SearchBabySitter
│   ├── BabyMonitoringScreen
│   └── ...
└── BabysitterFlow
├── BabySitterDashboard
├── SetAvailability
└── ...

## 🚀 Future Enhancements

- [ ] Video streaming integration
- [ ] Payment gateway (JazzCash, EasyPaisa)
- [ ] Push notifications (Firebase)
- [ ] Offline mode support
- [ ] Advanced scheduling & calendar
- [ ] Subscription plans
- [ ] Insurance integration

## 👨‍💼 Author

**Abdullah Saleem**
- GitHub: [@abdulli23309-ops](https://github.com/abdulli23309-ops)
- Email: abdullli2309@gmail.com

## 📄 License

Educational project - Final Year Project (FYP)

## 🤝 Related Repositories

- **Backend API (ASP.NET Core)**: [babysitter-booking-platform-api](https://github.com/abdulli23309-ops/babysitter-booking-platform-api)

---

**This is a full-stack development project demonstrating modern web technologies, AI integration, and professional software architecture.**
