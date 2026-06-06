import { Routes, Route } from 'react-router-dom';
import Splash from './start/Splash';
import RoleSelection from './start/RoleSelection';
import Login from './start/Login';
import Register from './Babysittersides/Register';
import CreateAccount from './Parentsides/CreateAccount';
import ParentDashboard from './Parentsides/ParentDashboard';
import BabysitterDashboard from './Babysittersides/BabysitterDashboard';
import MainScreen from './Parentsides/MainScreen';
import JobRequest from './Babysittersides/JobRequest';
import SetAvailability from './Babysittersides/SetAvailability';
import SetChildProfile from './ParentSides/SetChildProfile';
import BabySitterDetails from './Parentsides/BabySitterDetails';
import BabySitterDetails2 from './Parentsides/BabySitterDetails2';
import ChildProfile from './ParentSides/ChildProfile';
import ParentProfileScreen from './Parentsides/ParentProfileScreen';
import SearchBabysitter from './Parentsides/SearchBabysitter';
import MyJobsScreen from './ParentSides/MyJobsScreen';
import UpdateChildProfileScreen from './ParentSides/UpdateChildProfileScreen';
import ParentActiveJobScreen from './ParentSides/ParentActiveJobScreen';
import ParentUpcomingJobScreen from './ParentSides/ParentUpcomingJobScreen';
import MyProfile from './Babysittersides/babysitterprofilescreen';
import UpdateProfile from './Babysittersides/UpdateProfile'; 
import ActiveJobDetails from './Babysittersides/ActiveJobDetails'; 
import Earnings from './Babysittersides/Earnings';
import CompletedJobDetails from './Babysittersides/CompletedJobDetails';
import JobDetails from './Babysittersides/JobDetails';
import JobRequestedSuccess from './Parentsides/JobRequestedSuccess';
import ParentNotifications from './Parentsides/ParentNotifications';
import BabysitterNotifications from './Babysittersides/BabysitterNotifications';
import Ratings from './Babysittersides/Ratings';
import JobRequestSuccess from './Parentsides/JobRequestedSuccess';
import JobEndReviewScreen from './Parentsides/JobEndReviewScreen';
import JobAcceptedSuccess from './Babysittersides/JobAcceptedSuccess';
import BabysitterMyJobs from './Babysittersides/BabysitterMyJobs';
import UpcomingJobDetails from './Babysittersides/UpcomingJobDetails';
import CryDetector from "./start/CryDetector";
import BabyMonitoringScreen from "./Parentsides/BabyMonitoringScreen";
import ChildCryAlertScreen from "./Parentsides/ChildCryAlertScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/role" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/parent-dashboard" element={<ParentDashboard />} />
      <Route path="/babysitter-dashboard" element={<BabysitterDashboard />} />
      <Route path="/main-screen" element={<MainScreen />} />
      <Route path="/job-request" element={<JobRequest />} />
      <Route path="/set-availability" element={<SetAvailability />} />
      <Route path="/set-child-profile" element={<SetChildProfile />} />
      <Route path="/babysitter-details" element={<BabySitterDetails />} />
      <Route path="/babysitter-details-2" element={<BabySitterDetails2 />} />
      <Route path="/child-profile" element={<ChildProfile />} />
      <Route path="/parent-profile" element={<ParentProfileScreen />} />
      <Route path="/search-babysitter" element={<SearchBabysitter />} />
      <Route path="/my-jobs" element={<MyJobsScreen />} />
      <Route path="/update-child-profile" element={<UpdateChildProfileScreen />} />
      <Route path="/parent-active-job" element={<ParentActiveJobScreen />} />
      <Route path="/parent-upcoming-job" element={<ParentUpcomingJobScreen />} />
     <Route path="/my-profile" element={<MyProfile />} />
      <Route path="/update-profile" element={<UpdateProfile />} />
      <Route path="/active-job-details" element={<ActiveJobDetails />} />
      <Route path="/completed-job-details" element={<CompletedJobDetails />} />
    <Route path="/job-details/:jobId" element={<JobDetails />} />
<Route path="/job-parent-profile/:jobId" element={<div>Parent profile (TBD)</div>} />
<Route path="/job-child-profile/:jobId" element={<div>Child profile (TBD)</div>} />
     <Route path="/earnings" element={<Earnings />} />
     <Route path="/ratings" element={<Ratings />} />
     <Route path="/job-requested-success" element={<JobRequestedSuccess />} />
     <Route path="/parent-notifications" element={<ParentNotifications />} />
<Route path="/babysitter-notifications" element={<BabysitterNotifications />} />
      <Route path="/job-end-review" element={<JobEndReviewScreen />} />
      <Route path="/job-accepted-success" element={<JobAcceptedSuccess />} />
      <Route path="/babysitter-my-jobs" element={<BabysitterMyJobs />} />
      <Route path="/upcoming-job-details" element={<UpcomingJobDetails />} />
      <Route path="/cry-detector" element={<CryDetector />} />
      <Route path="/baby-monitoring" element={<BabyMonitoringScreen />} />
      <Route path="/cry-alert" element={<ChildCryAlertScreen />} />
    </Routes>
  );
}

export default App;