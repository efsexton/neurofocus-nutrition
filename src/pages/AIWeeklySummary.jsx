import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Brain
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function AIWeeklySummary() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [summary, setSummary] = useState(null);
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
      generateAISummary();
    }
  }, [selectedClientId, currentWeekStart]);

  const generateAISummary = async () => {
    if (!selectedClientId) return;
    
    setGenerating(true);
    setSummary(null);
    
    try {
      const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // Fetch diary entries for the week
      const entries = await base44.entities.DailyDiary.filter({
        client_id: selectedClientId,
        date: { $gte: weekStart, $lte: weekEnd }
      }, 'date', 100);

      if (entries.length === 0) {
        toast.error("No diary entries found for this week");
        setGenerating(false);
        return;
      }

      // Prepare data for AI analysis
      const diaryData = entries.map(entry => ({
        date: entry.date,
        sleep: {
          hours: entry.sleep?.hours,
          quality: entry.sleep?.quality,
          nightWakes: entry.sleep?.night_wakes
        },
        energy: {
          morning: entry.energy_morning,
          afternoon: entry.energy_afternoon,
          evening: entry.energy_evening,
          notes: entry.energy_notes
        },
        stress: {
          level: entry.stress_level,
          sources: entry.stress_sources,
          notes: entry.stress_notes
        },
        bowelMovements: entry.bowel_movements?.length || 0,
        bowelIssues: entry.bowel_movements?.filter(bm => [1,2,6,7].includes(bm.bristol_scale)).length || 0,
        pain: {
          abdominal: entry.abdominal_pain?.intensity,
          location: entry.abdominal_pain?.quadrant,
          ailments: entry.ailments?.length || 0
        },
        meals: entry.meals?.length || 0,
        cravings: entry.cravings?.length || 0,
        exercise: entry.exercise?.length || 0,
        steps: entry.steps
      }));

      const client = clients.find(c => c.id === selectedClientId);

      // Call AI for analysis
      const prompt = `You are an expert nutrition coach analyzing a client's weekly diary entries. 

Client: ${client?.full_name || 'Unknown'}
Week: ${weekStart} to ${weekEnd}
Entries: ${entries.length} days logged

Diary Data:
${JSON.stringify(diaryData, null, 2)}

Please analyze this week's data and provide a comprehensive summary with the following structure:

1. OVERALL ASSESSMENT (2-3 sentences)
   - Overall health trajectory this week
   - Key observation

2. KEY WINS (3-5 bullet points)
   - What the client did well
   - Positive patterns or improvements

3. AREAS OF CONCERN (3-5 bullet points)
   - Issues that need attention
   - Negative patterns or declines
   - Include severity level (Mild/Moderate/Severe)

4. SLEEP ANALYSIS
   - Average quality and patterns
   - Any concerns or improvements

5. ENERGY & STRESS PATTERNS
   - Energy trends throughout days
   - Stress levels and correlation with other factors

6. DIGESTIVE HEALTH
   - Bowel movement patterns
   - Any red flags

7. PAIN & AILMENTS
   - Pain patterns and severity
   - Correlation with diet/activity

8. NUTRITION & ACTIVITY
   - Meal consistency
   - Exercise patterns
   - Cravings and triggers

9. ACTIONABLE RECOMMENDATIONS (5-7 specific actions)
   - Prioritized action items for the coach to discuss with client
   - Specific, measurable, achievable goals

10. QUESTIONS FOR CLIENT
    - 3-5 questions the coach should ask to clarify patterns

Keep the tone professional, supportive, and actionable. Focus on patterns and correlations, not just individual data points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setSummary({
        content: response,
        weekStart,
        weekEnd,
        entriesCount: entries.length,
        clientName: client?.full_name || client?.email
      });

    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast.error(`Failed to generate summary: ${error.message}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              AI Weekly Summary
            </h1>
            <p className="text-stone-600 mt-1">AI-powered insights and analysis</p>
          </div>
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

        {/* Loading State */}
        {generating && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
                  <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">AI Analysis in Progress</h3>
                  <p className="text-purple-700">Analyzing diary entries and generating insights...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Summary Display */}
        {!generating && summary && (
          <div className="space-y-6">
            {/* Header Info */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">{summary.clientName}</h3>
                      <p className="text-sm text-stone-600">
                        Week of {format(parseISO(summary.weekStart), 'MMM d')} - {format(parseISO(summary.weekEnd), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    {summary.entriesCount} days logged
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI-Generated Summary */}
            <Card className="border-sage-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-sage-50 to-purple-50 border-b border-sage-200">
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Generated Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-stone max-w-none">
                  <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                    {summary.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-sage-200 text-sage-700 hover:bg-sage-50"
              >
                Print Summary
              </Button>
              <Button
                onClick={generateAISummary}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generating && !summary && selectedClientId && (
          <Card className="border-dashed border-sage-300">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">No Data Available</h3>
              <p className="text-stone-600 mb-4">
                This client hasn't logged any diary entries for the selected week.
              </p>
              <p className="text-sm text-stone-500">
                Try selecting a different week or client to generate an AI summary.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}