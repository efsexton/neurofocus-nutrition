
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { DailyDiary } from '@/entities/DailyDiary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Search, 
  Activity,
  CheckCircle2,
  Clock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function ClientList() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientActivity, setClientActivity] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = await User.me();
        setCurrentUser(me);

        if (me.role !== 'admin' && me.user_type !== 'coach') {
          setLoading(false);
          return;
        }

        // Load all clients
        const clientList = await User.filter({ user_type: 'client' });
        setClients(clientList);
        setFilteredClients(clientList);

        // Load recent diary entries for activity tracking
        const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        const recentDiaries = await DailyDiary.filter({}, '-created_date', 50);
        
        // Group diary entries by client
        const activityMap = {};
        recentDiaries.forEach(diary => {
          if (!activityMap[diary.client_id]) {
            activityMap[diary.client_id] = [];
          }
          activityMap[diary.client_id].push(diary);
        });
        setClientActivity(activityMap);

      } catch (error) {
        console.error('Error loading client data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(client => 
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const getLastActivityDate = (clientId) => {
    const activities = clientActivity[clientId];
    if (!activities || activities.length === 0) return null;
    return activities[0].created_date;
  };

  const getActivityCount = (clientId, days = 7) => {
    const activities = clientActivity[clientId];
    if (!activities) return 0;
    const cutoffDate = subDays(new Date(), days);
    return activities.filter(activity => 
      new Date(activity.created_date) > cutoffDate
    ).length;
  };

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
          <h1 className="text-3xl font-bold text-stone-900 mb-2">My Clients</h1>
          <p className="text-stone-600">Manage and monitor your client's progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <p className="text-stone-600 text-sm">Active This Week</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {clients.filter(client => getActivityCount(client.id) > 0).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm">Completed Onboarding</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {clients.filter(client => client.onboarding_completed).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-sage-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-sage-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <div className="grid gap-4">
          {filteredClients.map((client) => {
            const lastActivity = getLastActivityDate(client.id);
            const weeklyActivity = getActivityCount(client.id);
            
            return (
              <Card key={client.id} className="border-sage-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    {/* Client Info */}
                    <div className="flex items-center gap-4 md:col-span-1">
                      <div className="w-12 h-12 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sage-700 font-medium text-lg">
                          {client.full_name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                          {client.full_name || 'Pending Invitation'}
                        </h3>
                        <div className="flex items-center gap-2 text-stone-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm truncate">{client.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Activity */}
                    <div className="flex flex-col items-start md:items-center gap-2 md:col-span-1">
                        {/* Onboarding Status */}
                        <Badge 
                          variant="outline" 
                          className={client.onboarding_completed 
                            ? "border-green-200 text-green-700 bg-green-50" 
                            : "border-yellow-200 text-yellow-700 bg-yellow-50"
                          }
                        >
                          {client.onboarding_completed ? 'Onboarded' : 'Pending Onboarding'}
                        </Badge>

                        {/* Last Activity */}
                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                          <Clock className="w-4 h-4" />
                          {lastActivity ? (
                            <span>
                              Last active: {format(new Date(lastActivity), 'MMM d, h:mm a')}
                            </span>
                          ) : (
                            <span>No diary entries</span>
                          )}
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-start md:justify-end md:col-span-1">
                       <Link to={createPageUrl(`ClientDiaryView?client_id=${client.id}`)}>
                        <Button variant="outline" className="border-sage-200 text-sage-700 hover:bg-sage-50">
                          View Diary
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredClients.length === 0 && (
            <Card className="border-sage-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  {searchTerm ? 'No clients found' : 'No clients yet'}
                </h3>
                <p className="text-stone-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Your clients will appear here once they are assigned to you'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
