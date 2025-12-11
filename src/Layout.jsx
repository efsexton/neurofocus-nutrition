import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Activity, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Heart,
  Calendar,
  Upload,
  Shield,
  Target,
  User as UserIcon, // Added User as UserIcon
  ChevronDown // Added ChevronDown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@/entities/User";

const coachNavigation = [
  {
    title: "Dashboard",
    url: createPageUrl("CoachDashboard"),
    icon: BarChart3,
  },
  {
    title: "My Clients",
    url: createPageUrl("ClientList"),
    icon: Users,
  },
  {
    title: "Set Weekly Goals",
    url: createPageUrl("CoachGoalSetting"),
    icon: Target,
  },
  {
    title: "AI Weekly Summary",
    url: createPageUrl("AIWeeklySummary"),
    icon: Activity,
  },
  {
    title: "Weekly Reports",
    url: createPageUrl("WeeklyReports"),
    icon: Activity,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FileText,
  },
];

const clientNavigation = [
  {
    title: "Daily Diary",
    url: createPageUrl("DailyDiary"),
    icon: Calendar,
  },
  {
    title: "My Progress",
    url: createPageUrl("Progress"),
    icon: Activity,
  },
  {
    title: "Onboarding",
    url: createPageUrl("Onboarding"),
    icon: Upload,
  },
];

// New admin navigation
const adminNavigation = [
    {
    title: "User Management",
    url: createPageUrl("AdminUserManagement"),
    icon: Shield,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        // User not authenticated
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50">
        <style>{`
          :root {
            --sage-50: #f6f7f6;
            --sage-100: #e8ebe8;
            --sage-200: #d1d8d1;
            --sage-300: #aab8aa;
            --sage-400: #7a927a;
            --sage-500: #5a735a;
            --sage-600: #485a48;
            --sage-700: #3c4a3c;
            --sage-800: #333b33;
            --sage-900: #2b322b;
            --stone-50: #fafaf9;
            --stone-100: #f5f5f4;
            --stone-200: #e7e5e4;
            --stone-300: #d6d3d1;
            --stone-400: #a8a29e;
            --stone-500: #78716c;
            --stone-600: #57534e;
            --stone-700: #44403c;
            --stone-800: #292524;
            --stone-900: #1c1917;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-sage-500 to-sage-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 mb-2">Neurofocus Nutrition</h1>
              <p className="text-stone-600">Personalized nutrition coaching platform</p>
            </div>
            <Button
              onClick={() => User.login()}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-xl transition-all duration-200"
            >
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  let navigation = [];
  // Fix navigation logic - prioritize user_type over role for non-admin users
  if (user.role === 'admin') {
    // Admins can see everything
    navigation = [...adminNavigation, ...coachNavigation, ...clientNavigation];
  } else if (user.user_type === 'coach') {
    // Coaches only see coach navigation
    navigation = coachNavigation;
  } else {
    // Everyone else (clients) sees client navigation
    navigation = clientNavigation;
  }


  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sage-50: #f6f7f6;
          --sage-100: #e8ebe8;
          --sage-200: #d1d8d1;
          --sage-300: #aab8aa;
          --sage-400: #7a927a;
          --sage-500: #5a735a;
          --sage-600: #485a48;
          --sage-700: #3c4a3c;
          --sage-800: #333b33;
          --sage-900: #2b322b;
          --stone-50: #fafaf9;
          --stone-100: #f5f5f4;
          --stone-200: #e7e5e4;
          --stone-300: #d6d3d1;
          --stone-400: #a8a29e;
          --stone-500: #78716c;
          --stone-600: #57534e;
          --stone-700: #44403c;
          --stone-800: #292524;
          --stone-900: #1c1917;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-sage-50">
        <Sidebar className="border-r border-sage-200 bg-white">
          <SidebarHeader className="border-b border-sage-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-sage-500 to-sage-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">Neurofocus</h2>
                <p className="text-xs text-stone-500 capitalize">{user.user_type || user.role} Portal</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-stone-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-sage-50 hover:text-sage-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-sage-100 text-sage-800 shadow-sm' : 'text-stone-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sage-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center">
                  <span className="text-sage-700 font-medium text-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {user.email} <span className="font-bold capitalize">({user.user_type || user.role})</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-stone-500 hover:text-stone-700 hover:bg-sage-50"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-sage-100 px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden hover:bg-sage-50 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-semibold text-stone-900 hidden md:block">Neurofocus Nutrition</h1>
              </div>

              {/* User Menu Dropdown - Always Visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-sage-200 hover:bg-sage-50 gap-2">
                    <div className="w-6 h-6 bg-sage-200 rounded-full flex items-center justify-center">
                      <span className="text-sage-700 font-medium text-xs">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-stone-700">{user.full_name || 'Account'}</span>
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-stone-900">{user.full_name || 'User'}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                      <p className="text-xs text-sage-600 capitalize font-medium">
                        {user.user_type || user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}