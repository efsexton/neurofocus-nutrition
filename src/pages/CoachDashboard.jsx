
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { DailyDiary } from '@/entities/DailyDiary';
import { WeeklyGoals } from '@/entities/WeeklyGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Target, 
  Activity,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { format, subDays, startOfWeek } from 'date-fns';

export default function CoachDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [weeklyGoalsCount, setWeeklyGoalsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const me = await User.me();
        setCurrentUser(me);

        if (me.role !== 'admin' && me.user_type !== 'coach') {
          setLoading(false);
          return;
        }

        // Load clients
        const clientList = await User.filter({ user_type: 'client' });
        setClients(clientList);

        // Load recent diary entries (last 7 days)
        const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        const recentDiaries = await DailyDiary.filter({}, '-created_date', 10);
        setRecentEntries(recentDiaries);

        // Count weekly goals set this week
        const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const thisWeekGoals = await WeeklyGoals.filter({
          coach_id: me.id,
          week_starting: thisWeekStart
        });
        setWeeklyGoalsCount(thisWeekGoals.length);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (currentUser?.role !== 'admin' && currentUser?.user_type !== 'coach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Coach Dashboard</h1>
          <p className="text-stone-600">Monitor your clients and manage their nutrition journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm">Total Clients</p>
                  <p className="text-2xl font-bold text-stone-900">{clients.length}</p>
                </div>
                <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sage-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm">Recent Entries</p>
                  <p className="text-2xl font-bold text-stone-900">{recentEntries.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm">Weekly Goals Set</p>
                  <p className="text-2xl font-bold text-stone-900">{weeklyGoalsCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm">Active Today</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {recentEntries.filter(entry => 
                      format(new Date(entry.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Client Activity */}
          <Card className="border-sage-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sage-600" />
                Recent Client Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries.slice(0, 5).map((entry) => {
                  const client = clients.find(c => c.id === entry.client_id);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                      <div>
                        <p className="font-medium text-stone-900">
                          {client?.full_name || 'Unknown Client'}
                        </p>
                        <p className="text-sm text-stone-600">
                          Diary entry for {format(new Date(entry.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-sage-200 text-sage-700">
                        {format(new Date(entry.created_date), 'h:mm a')}
                      </Badge>
                    </div>
                  );
                })}
                {recentEntries.length === 0 && (
                  <p className="text-stone-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-sage-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sage-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link to={createPageUrl('AIWeeklySummary')}>
                  <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Weekly Summary
                  </Button>
                </Link>

                <Link to={createPageUrl('CoachGoalSetting')}>
                  <Button className="w-full justify-start bg-sage-600 hover:bg-sage-700 text-white">
                    <Target className="w-4 h-4 mr-2" />
                    Set Weekly Goals
                  </Button>
                </Link>
                
                <Link to={createPageUrl('ClientList')}>
                  <Button variant="outline" className="w-full justify-start border-sage-200 text-sage-700 hover:bg-sage-50">
                    <Users className="w-4 h-4 mr-2" />
                    View All Clients
                  </Button>
                </Link>

                <Link to={createPageUrl('Reports')}>
                  <Button variant="outline" className="w-full justify-start border-sage-200 text-sage-700 hover:bg-sage-50">
                    <Activity className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client List Preview */}
        <Card className="border-sage-200 shadow-sm mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sage-600" />
                Your Clients
              </CardTitle>
              <Link to={createPageUrl('ClientList')}>
                <Button variant="outline" size="sm" className="border-sage-200 text-sage-700 hover:bg-sage-50">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.slice(0, 6).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center">
                      <span className="text-sage-700 font-medium text-sm">
                        {client.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">
                        {client.full_name || 'Pending Invitation'}
                      </p>
                      <p className="text-sm text-stone-600">{client.email}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={client.onboarding_completed 
                      ? "border-green-200 text-green-700 bg-green-50" 
                      : "border-yellow-200 text-yellow-700 bg-yellow-50"
                    }
                  >
                    {client.onboarding_completed ? 'Active' : 'Onboarding'}
                  </Badge>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-stone-500 text-center py-4">No clients assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
