/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIWeeklySummary from './pages/AIWeeklySummary';
import AdminUserManagement from './pages/AdminUserManagement';
import ClientDiaryView from './pages/ClientDiaryView';
import ClientList from './pages/ClientList';
import CoachDashboard from './pages/CoachDashboard';
import CoachGoalSetting from './pages/CoachGoalSetting';
import DailyDiary from './pages/DailyDiary';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Progress from './pages/Progress';
import Reports from './pages/Reports';
import WeeklyReports from './pages/WeeklyReports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIWeeklySummary": AIWeeklySummary,
    "AdminUserManagement": AdminUserManagement,
    "ClientDiaryView": ClientDiaryView,
    "ClientList": ClientList,
    "CoachDashboard": CoachDashboard,
    "CoachGoalSetting": CoachGoalSetting,
    "DailyDiary": DailyDiary,
    "Home": Home,
    "Onboarding": Onboarding,
    "Progress": Progress,
    "Reports": Reports,
    "WeeklyReports": WeeklyReports,
}

export const pagesConfig = {
    mainPage: "DailyDiary",
    Pages: PAGES,
    Layout: __Layout,
};