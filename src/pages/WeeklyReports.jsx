import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Moon, 
  Battery, 
  Brain,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyReports() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);
        if (me.role === 'admin' || me.user_type === 'coach') {
          const clientList = await base44.entities.User.filter({ user_type: 'client' });
          setClients(clientList);
          if (clientList.length > 0) {
            setSelectedClientId(clientList[0].id);
          }
        }
      } catch (e) {
        console.error("Error loading data", e);
      }
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      generateWeeklyReport();
    }
  }, [selectedClientId, currentWeekStart]);

  const generateWeeklyReport = async () => {
    if (!selectedClientId) return;
    
    setGenerating(true);
    try {
      const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // Fetch diary entries for the week
      const entries = await base44.entities.DailyDiary.filter({
        client_id: selectedClientId,
        date: { $gte: weekStart, $lte: weekEnd }
      }, 'date', 100);

      if (entries.length === 0) {
        setWeeklyData(null);
        setGenerating(false);
        return;
      }

      // Process data for charts
      const dailyData = entries.map(entry => ({
        date: format(parseISO(entry.date), 'EEE'),
        sleep: entry.sleep?.hours || 0,
        sleepQuality: entry.sleep?.quality || 0,
        energy: ((entry.energy_morning || 0) + (entry.energy_afternoon || 0) + (entry.energy_evening || 0)) / 3,
        stress: entry.stress_level || 0,
        pain: entry.abdominal_pain?.intensity || 0,
        bowelMovements: entry.bowel_movements?.length || 0,
        meals: entry.meals?.length || 0,
        steps: entry.steps || 0,
      }));

      // Calculate weekly averages
      const totals = entries.reduce((acc, entry) => {
        acc.sleep += entry.sleep?.hours || 0;
        acc.sleepQuality += entry.sleep?.quality || 0;
        acc.energy += ((entry.energy_morning || 0) + (entry.energy_afternoon || 0) + (entry.energy_evening || 0)) / 3;
        acc.stress += entry.stress_level || 0;
        acc.pain += entry.abdominal_pain?.intensity || 0;
        acc.bowelMovements += entry.bowel_movements?.length || 0;
        acc.steps += entry.steps || 0;
        acc.count++;
        return acc;
      }, { sleep: 0, sleepQuality: 0, energy: 0, stress: 0, pain: 0, bowelMovements: 0, steps: 0, count: 0 });

      const averages = {
        sleep: (totals.sleep / totals.count).toFixed(1),
        sleepQuality: (totals.sleepQuality / totals.count).toFixed(1),
        energy: (totals.energy / totals.count).toFixed(1),
        stress: (totals.stress / totals.count).toFixed(1),
        pain: (totals.pain / totals.count).toFixed(1),
        bowelMovements: (totals.bowelMovements / totals.count).toFixed(1),
        steps: Math.round(totals.steps / totals.count),
      };

      // Count symptoms
      const symptoms = {
        highPain: entries.filter(e => (e.abdominal_pain?.intensity || 0) >= 7).length,
        poorSleep: entries.filter(e => (e.sleep?.quality || 0) <= 4).length,
        highStress: entries.filter(e => (e.stress_level || 0) >= 7).length,
        bowelIssues: entries.filter(e => 
          e.bowel_movements?.some(bm => [1, 2, 6, 7].includes(bm.bristol_scale))
        ).length,
      };

      setWeeklyData({
        dailyData,
        averages,
        symptoms,
        entriesCount: entries.length,
        weekStart,
        weekEnd
      });
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setGenerating(false);
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
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
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent><p>You do not have permission to view this page.</p></CardContent>
        </Card>
      </div>
    );
  }

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-stone-900">Weekly Progress Reports</h1>
        </div>

        {/* Controls */}
        <Card className="border-sage-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Client</label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="border-sage-200">
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name || c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevWeek}
                  className="border-sage-200 text-sage-700 hover:bg-sage-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 text-stone-900 font-medium">
                  <Calendar className="w-4 h-4 text-sage-600" />
                  {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextWeek}
                  className="border-sage-200 text-sage-700 hover:bg-sage-50"
                  disabled={format(currentWeekStart, 'yyyy-MM-dd') >= format(new Date(), 'yyyy-MM-dd')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {generating && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sage-600" />
            <p className="ml-4 text-stone-600">Generating report...</p>
          </div>
        )}

        {!generating && weeklyData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-sage-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-stone-600 text-sm">Avg Sleep</p>
                      <p className="text-2xl font-bold text-stone-900">{weeklyData.averages.sleep} hrs</p>
                      <p className="text-xs text-stone-500 mt-1">Quality: {weeklyData.averages.sleepQuality}/10</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Moon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sage-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-stone-600 text-sm">Avg Energy</p>
                      <p className="text-2xl font-bold text-stone-900">{weeklyData.averages.energy}/10</p>
                      <p className="text-xs text-stone-500 mt-1">{weeklyData.entriesCount} entries</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Battery className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sage-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-stone-600 text-sm">Avg Stress</p>
                      <p className="text-2xl font-bold text-stone-900">{weeklyData.averages.stress}/10</p>
                      <p className="text-xs text-stone-500 mt-1">{weeklyData.symptoms.highStress} high stress days</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sage-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-stone-600 text-sm">Avg Steps</p>
                      <p className="text-2xl font-bold text-stone-900">{weeklyData.averages.steps.toLocaleString()}</p>
                      <p className="text-xs text-stone-500 mt-1">Daily average</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Symptoms Alert */}
            {(weeklyData.symptoms.highPain > 0 || weeklyData.symptoms.poorSleep > 0 || weeklyData.symptoms.bowelIssues > 0) && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-2">Attention Points This Week</h3>
                      <ul className="space-y-1 text-sm text-orange-800">
                        {weeklyData.symptoms.highPain > 0 && (
                          <li>• {weeklyData.symptoms.highPain} day(s) with severe abdominal pain (7+/10)</li>
                        )}
                        {weeklyData.symptoms.poorSleep > 0 && (
                          <li>• {weeklyData.symptoms.poorSleep} day(s) with poor sleep quality (≤4/10)</li>
                        )}
                        {weeklyData.symptoms.highStress > 0 && (
                          <li>• {weeklyData.symptoms.highStress} day(s) with high stress levels (7+/10)</li>
                        )}
                        {weeklyData.symptoms.bowelIssues > 0 && (
                          <li>• {weeklyData.symptoms.bowelIssues} day(s) with concerning bowel movements</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-sage-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-blue-600" />
                    Sleep Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                      <YAxis stroke="#78716c" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sleep" name="Hours" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="sleepQuality" name="Quality" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-sage-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-yellow-600" />
                    Energy & Stress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                      <YAxis stroke="#78716c" fontSize={12} domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="energy" name="Energy" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-sage-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Daily Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                      <YAxis stroke="#78716c" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="meals" name="Meals" fill="#10b981" />
                      <Bar dataKey="bowelMovements" name="BMs" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-sage-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Pain Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                      <YAxis stroke="#78716c" fontSize={12} domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pain" name="Pain Intensity" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!generating && !weeklyData && selectedClientId && (
          <Card className="border-dashed border-sage-300">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">No Data for This Week</h3>
              <p className="text-stone-600">
                {selectedClient?.full_name || 'This client'} hasn't logged any diary entries for this week yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}