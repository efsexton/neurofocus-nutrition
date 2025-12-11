import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns';
import {
  Mail,
  Phone,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Battery,
  Activity,
  Brain,
  AlertTriangle,
  Moon,
  Cookie,
  Footprints,
  MessageSquare
} from 'lucide-react';
import CoachFeedbackDisplay from '../components/diary/CoachFeedbackDisplay';
import FeedbackForm from '../components/coach/FeedbackForm';
import { toast } from "sonner";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ClientDiaryView() {
  const query = useQuery();
  const clientId = query.get('client_id');
  
  const [client, setClient] = useState(null);
  const [diaryEntry, setDiaryEntry] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) {
        setError("No client ID provided.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);

        const clientData = await base44.entities.User.get(clientId);
        setClient(clientData);
        
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const entries = await base44.entities.DailyDiary.filter({ client_id: clientId, date: dateStr });
        
        if (entries.length > 0) {
          const entry = entries[0];
          setDiaryEntry(entry);

          // Load coach feedback
          const feedbacks = await base44.entities.CoachFeedback.filter({
            diary_id: entry.id
          });
          if (feedbacks.length > 0) {
            setCoachFeedback(feedbacks[0]);
          } else {
            setCoachFeedback(null);
          }
        } else {
          setDiaryEntry(null);
          setCoachFeedback(null);
        }
      } catch (err) {
        console.error("Error loading client diary:", err);
        setError("Failed to load client data. You may not have permission to view this client.");
      }
      setLoading(false);
    };

    loadData();
  }, [clientId, selectedDate]);

  const handleSaveFeedback = async (feedbackData) => {
    if (!diaryEntry || !currentUser) {
      toast.error("Unable to save feedback");
      return;
    }

    setSavingFeedback(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const payload = {
        diary_id: diaryEntry.id,
        client_id: clientId,
        coach_id: currentUser.id,
        date: dateStr,
        ...feedbackData
      };

      let saved;
      if (coachFeedback) {
        saved = await base44.entities.CoachFeedback.update(coachFeedback.id, payload);
        toast.success("Feedback updated successfully!");
      } else {
        saved = await base44.entities.CoachFeedback.create(payload);
        toast.success("Feedback added successfully!");
      }
      
      setCoachFeedback(saved);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error(`Failed to save feedback: ${error.message}`);
    }
    setSavingFeedback(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowFeedbackForm(false);
  };
  
  const DiarySectionCard = ({ title, icon: Icon, color, children }) => (
    <Card className="border-sage-200 shadow-sm">
        <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl text-stone-900">{title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Client Header */}
        <Card className="mb-8 border-sage-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sage-700 font-medium text-2xl">
                  {client?.full_name?.charAt(0) || 'C'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900">{client?.full_name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-stone-600">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{client?.email}</span></div>
                  {client?.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{client.phone}</span></div>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Date Selector */}
        <Card className="mb-8 border-sage-200 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
                 <Button variant="outline" size="icon" onClick={() => handleDateChange(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-64 justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, 'PPP')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
                    </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={() => handleDateChange(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>

        {/* Diary Content */}
        {diaryEntry ? (
          <div className="space-y-6">
            {/* Coach Feedback Section */}
            {!showFeedbackForm && coachFeedback && (
              <div className="relative">
                <CoachFeedbackDisplay 
                  feedback={coachFeedback}
                  isClient={false}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => setShowFeedbackForm(true)}
                    variant="outline"
                    className="border-sage-200 text-sage-700 hover:bg-sage-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Edit Feedback
                  </Button>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {showFeedbackForm && (
              <FeedbackForm
                existingFeedback={coachFeedback}
                onSave={handleSaveFeedback}
                onCancel={() => setShowFeedbackForm(false)}
                saving={savingFeedback}
              />
            )}

            {/* Add Feedback Button */}
            {!showFeedbackForm && !coachFeedback && (
              <Card className="border-2 border-dashed border-sage-300 bg-sage-50/50">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-sage-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-900 mb-2">No Feedback Yet</h3>
                  <p className="text-stone-600 mb-4">Add personalized feedback for this diary entry</p>
                  <Button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-sage-600 hover:bg-sage-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Feedback
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Diary Sections */}
            {diaryEntry.sleep?.hours && <DiarySectionCard title="Sleep" icon={Moon} color="bg-blue-500">
                <p><strong>Hours:</strong> {diaryEntry.sleep.hours}</p>
                <p><strong>Quality:</strong> {diaryEntry.sleep.quality}/10</p>
                {diaryEntry.sleep.latency_minutes && <p><strong>Time to Fall Asleep:</strong> {diaryEntry.sleep.latency_minutes} min</p>}
                {diaryEntry.sleep.night_wakes && <p><strong>Night Wakes:</strong> {diaryEntry.sleep.night_wakes}</p>}
             </DiarySectionCard>}

            {diaryEntry.meals?.length > 0 && <DiarySectionCard title="Food & Drink" icon={UtensilsCrossed} color="bg-sage-500">
                <div className="space-y-4">
                {diaryEntry.meals.map((meal, idx) => (
                    <div key={idx} className="p-4 bg-sage-50 rounded-lg">
                        <h4 className="font-semibold text-stone-800">Meal {idx+1} at {meal.time}</h4>
                        {meal.photo_url && <img src={meal.photo_url} alt={`Meal ${idx+1}`} className="mt-2 rounded-lg w-full max-w-sm h-auto" />}
                        <p className="mt-2 text-sm text-stone-700">{meal.description}</p>
                        {meal.environment && <p className="text-xs text-stone-600 mt-1">Environment: {meal.environment}</p>}
                        {meal.emotions && <p className="text-xs text-stone-600">Emotions: {meal.emotions}</p>}
                        <div className="flex gap-4 mt-2 text-xs text-stone-600">
                          {meal.hunger_before && <span>Hunger Before: {meal.hunger_before}/10</span>}
                          {meal.fullness_after && <span>Fullness After: {meal.fullness_after}/10</span>}
                        </div>
                    </div>
                ))}
                </div>
            </DiarySectionCard>}

             {(diaryEntry.energy_morning || diaryEntry.energy_afternoon || diaryEntry.energy_evening) && <DiarySectionCard title="Energy" icon={Battery} color="bg-yellow-500">
                <div className="space-y-2">
                  {diaryEntry.energy_morning && <p><strong>Morning:</strong> {diaryEntry.energy_morning}/10</p>}
                  {diaryEntry.energy_afternoon && <p><strong>Afternoon:</strong> {diaryEntry.energy_afternoon}/10</p>}
                  {diaryEntry.energy_evening && <p><strong>Evening:</strong> {diaryEntry.energy_evening}/10</p>}
                  {diaryEntry.energy_notes && <p className="mt-2 text-sm italic">Notes: {diaryEntry.energy_notes}</p>}
                </div>
             </DiarySectionCard>}

             {diaryEntry.bowel_movements?.length > 0 && <DiarySectionCard title="Bowel Movements" icon={Activity} color="bg-green-500">
                <div className="space-y-3">
                  {diaryEntry.bowel_movements.map((bm, idx) => (
                    <div key={idx} className="p-3 bg-green-50 rounded-lg">
                      <p><strong>Time:</strong> {bm.time}</p>
                      <p><strong>Bristol Scale:</strong> {bm.bristol_scale}</p>
                      {bm.urgency && <Badge variant="outline" className="bg-red-50 text-red-700">Urgency</Badge>}
                      {bm.notes && <p className="text-sm mt-1">{bm.notes}</p>}
                    </div>
                  ))}
                </div>
             </DiarySectionCard>}
             
             {diaryEntry.stress_level && <DiarySectionCard title="Stress" icon={Brain} color="bg-red-500">
                <p><strong>Level:</strong> {diaryEntry.stress_level}/10</p>
                {diaryEntry.stress_sources?.length > 0 && <p><strong>Sources:</strong> {diaryEntry.stress_sources.join(', ')}</p>}
                {diaryEntry.stress_notes && <p className="mt-2 text-sm italic">Notes: {diaryEntry.stress_notes}</p>}
             </DiarySectionCard>}

             {diaryEntry.abdominal_pain?.intensity > 0 && <DiarySectionCard title="Abdominal Pain" icon={AlertTriangle} color="bg-orange-500">
                <p><strong>Location:</strong> {diaryEntry.abdominal_pain.quadrant}</p>
                <p><strong>Intensity:</strong> {diaryEntry.abdominal_pain.intensity}/10</p>
                {diaryEntry.abdominal_pain.timing && <p><strong>Timing:</strong> {diaryEntry.abdominal_pain.timing}</p>}
             </DiarySectionCard>}

             {diaryEntry.ailments?.length > 0 && <DiarySectionCard title="Pain & Ailments" icon={Activity} color="bg-purple-500">
                <div className="space-y-3">
                  {diaryEntry.ailments.map((ailment, idx) => (
                    <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{ailment.type}</p>
                          <p className="text-sm text-stone-600">Location: {ailment.location}</p>
                        </div>
                        <Badge variant="outline" className={
                          ailment.intensity <= 3 ? "bg-green-100 text-green-700" :
                          ailment.intensity <= 6 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }>
                          {ailment.intensity}/10
                        </Badge>
                      </div>
                      {ailment.time_occurred && <p className="text-sm mt-1">Time: {ailment.time_occurred}</p>}
                      {ailment.duration && <p className="text-sm">Duration: {ailment.duration}</p>}
                      {ailment.notes && <p className="text-sm mt-2 italic">{ailment.notes}</p>}
                    </div>
                  ))}
                </div>
             </DiarySectionCard>}

             {diaryEntry.cravings?.length > 0 && <DiarySectionCard title="Cravings" icon={Cookie} color="bg-pink-500">
                <div className="space-y-2">
                  {diaryEntry.cravings.map((craving, idx) => (
                    <div key={idx} className="p-2 bg-pink-50 rounded">
                      <p><strong>{craving.type}</strong> - {craving.timing}</p>
                      {craving.trigger && <p className="text-sm">Trigger: {craving.trigger}</p>}
                    </div>
                  ))}
                </div>
             </DiarySectionCard>}

             {(diaryEntry.exercise?.length > 0 || diaryEntry.steps) && <DiarySectionCard title="Exercise" icon={Footprints} color="bg-indigo-500">
                {diaryEntry.steps && <p className="mb-3"><strong>Steps:</strong> {diaryEntry.steps}</p>}
                {diaryEntry.exercise?.length > 0 && (
                  <div className="space-y-3">
                    {diaryEntry.exercise.map((ex, idx) => (
                      <div key={idx} className="p-3 bg-indigo-50 rounded-lg">
                        <p className="font-semibold">{ex.type}</p>
                        <div className="text-sm mt-1 space-y-1">
                          {ex.duration_minutes && <p>Duration: {ex.duration_minutes} min</p>}
                          {ex.rpe && <p>RPE: {ex.rpe}/10</p>}
                          {ex.feeling_after && <p>Feeling After: {ex.feeling_after}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </DiarySectionCard>}
          </div>
        ) : (
          <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">No Diary Entry</h3>
              <p className="text-stone-600">The client did not submit a diary entry for this day.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}