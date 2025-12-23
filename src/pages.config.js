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