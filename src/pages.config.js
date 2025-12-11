import DailyDiary from './pages/DailyDiary';
import Onboarding from './pages/Onboarding';
import AdminUserManagement from './pages/AdminUserManagement';
import CoachGoalSetting from './pages/CoachGoalSetting';
import CoachDashboard from './pages/CoachDashboard';
import ClientList from './pages/ClientList';
import ClientDiaryView from './pages/ClientDiaryView';
import Reports from './pages/Reports';
import Progress from './pages/Progress';
import WeeklyReports from './pages/WeeklyReports';
import AIWeeklySummary from './pages/AIWeeklySummary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DailyDiary": DailyDiary,
    "Onboarding": Onboarding,
    "AdminUserManagement": AdminUserManagement,
    "CoachGoalSetting": CoachGoalSetting,
    "CoachDashboard": CoachDashboard,
    "ClientList": ClientList,
    "ClientDiaryView": ClientDiaryView,
    "Reports": Reports,
    "Progress": Progress,
    "WeeklyReports": WeeklyReports,
    "AIWeeklySummary": AIWeeklySummary,
}

export const pagesConfig = {
    mainPage: "DailyDiary",
    Pages: PAGES,
    Layout: __Layout,
};