import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { WeeklyGoals } from '@/entities/WeeklyGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Target } from 'lucide-react';
import GoalEditor from '../components/coach/GoalEditor';

const diarySections = [
  { id: 'sleep', title: 'Sleep' },
  { id: 'food_drink', title: 'Food & Drink' },
  { id: 'energy', title: 'Energy' },
  { id: 'bowel', title: 'Bowel' },
  { id: 'stress', title: 'Stress' },
  { id: 'pain', title: 'Abdominal Pain' },
  { id: 'ailments', title: 'Other Pain & Ailments' },
  { id: 'cravings', title: 'Cravings' },
  { id: 'exercise', title: 'Exercise' },
];

export default function CoachGoalSetting() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [goals, setGoals] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const me = await User.me();
        setCurrentUser(me);
        // Corrected the condition to check user_type for coach
        if (me.role === 'admin' || me.user_type === 'coach') {
          // Corrected the filter to use user_type instead of role
          const clientList = await User.filter({ user_type: 'client' });
          setClients(clientList);
        }
        
        // Initialize weekStart to the current week's Monday
        const today = new Date();
        const calculatedWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        setWeekStart(calculatedWeekStart);
        
        console.log("=== 🎯 COACH INITIALIZATION ===");
        console.log("📅 Today:", format(today, 'yyyy-MM-dd (EEEE)'));
        console.log("📅 Week Start (Monday):", format(calculatedWeekStart, 'yyyy-MM-dd (EEEE)'));
        console.log("=== END INITIALIZATION ===\n");
      } catch (e) {
        console.error("Error loading data", e);
      }
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const loadGoals = useCallback(async () => {
    if (!selectedClientId) return;
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const existingGoals = await WeeklyGoals.filter({
      client_id: selectedClientId,
      week_starting: weekStartStr,
    });
    
    const goalsMap = {};
    diarySections.forEach(section => {
      const foundGoal = existingGoals.find(g => g.section === section.id) || {
        section: section.id,
        goal: '',
        instructions: '',
        links: []
      };
      goalsMap[section.id] = foundGoal;
    });
    setGoals(goalsMap);
  }, [selectedClientId, weekStart]);

  useEffect(() => {
    if (selectedClientId) {
      loadGoals();
    } else {
      setGoals({});
    }
  }, [selectedClientId, loadGoals]);

  const handleUpdate = (sectionId, field, value) => {
    setGoals(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedClientId || !currentUser) return;
    setSaving(true);
    
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');

    console.log("\n=== 🎯 COACH SAVING WEEKLY GOALS ===");
    console.log("📅 Week Starting:", weekStartStr);
    console.log("👤 Client ID:", selectedClientId);
    console.log("👨‍⚕️ Coach ID:", currentUser.id);
    console.log("📝 Goals to save:");

    try {
      for (const sectionId in goals) {
        const goalData = goals[sectionId];
        const payload = {
          client_id: selectedClientId,
          coach_id: currentUser.id,
          week_starting: weekStartStr,
          section: sectionId,
          goal: goalData.goal,
          instructions: goalData.instructions,
          links: goalData.links,
        };

        console.log(`   - Section: ${sectionId}`);
        console.log(`     Goal: "${goalData.goal || '(empty)'}"`);
        console.log(`     Payload:`, JSON.stringify(payload, null, 2));

        if (goalData.id) {
          // Only update if there's content to save
          if (payload.goal || payload.instructions || (payload.links && payload.links.length > 0)) {
            const updated = await WeeklyGoals.update(goalData.id, payload);
            console.log(`     ✅ Updated goal ID: ${goalData.id}`);
          } else {
            // Delete if all fields are empty
            await WeeklyGoals.delete(goalData.id);
            console.log(`     🗑️ Deleted empty goal ID: ${goalData.id}`);
          }
        } else if (payload.goal || payload.instructions || (payload.links && payload.links.length > 0)) {
          // Only create if there's content
          const created = await WeeklyGoals.create(payload);
          console.log(`     ✅ Created new goal ID: ${created.id}`);
        }
      }
      
      console.log("\n✅ All goals saved successfully!");
      console.log("=== END COACH SAVE ===\n");
      
      alert('Weekly goals saved successfully!');
      loadGoals(); // Reload to get IDs for new goals
    } catch (e) {
      console.error('❌ Failed to save goals', e);
      alert(`Error: ${e.message}`);
    }

    setSaving(false);
  };
  
  if (loading) return <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" /></div>;
  if (currentUser?.role !== 'admin' && currentUser?.user_type !== 'coach') return <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center p-4"><div>Access Denied</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-stone-900">Set Weekly Goals</CardTitle>
            <p className="text-stone-600">Define weekly focus areas for your clients.</p>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Select Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="mt-1 border-sage-200">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Week Starting</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="border-sage-200">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center font-medium py-2 px-3 border border-sage-200 rounded-md bg-white">
                  {format(weekStart, 'MMMM d, yyyy')}
                </div>
                <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="border-sage-200">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedClientId && (
          <Card className="border-dashed border-sage-300">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-sage-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">Select a Client</h3>
              <p className="text-stone-600">Choose a client from the dropdown above to set their weekly goals</p>
            </CardContent>
          </Card>
        )}

        {selectedClientId && (
          <>
            <div className="space-y-6">
              {diarySections.map(section => (
                <Card key={section.id}>
                  <CardContent className="p-6">
                    {goals[section.id] && (
                      <GoalEditor
                        sectionTitle={section.title}
                        goalData={goals[section.id]}
                        onUpdate={(field, value) => handleUpdate(section.id, field, value)}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky Save Button at Bottom */}
      {selectedClientId && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-sage-600 to-sage-700 border-t-2 border-sage-800 shadow-2xl p-4 z-50">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="lg"
              className="bg-white hover:bg-sage-50 text-sage-700 px-16 py-6 rounded-xl text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-3 border-2 border-sage-200"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage-600" />
                  <span>Saving Goals...</span>
                </>
              ) : (
                <>
                  <Save className="w-7 h-7" />
                  <span>Save All Goals</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}