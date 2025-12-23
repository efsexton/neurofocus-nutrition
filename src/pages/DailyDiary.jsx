import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, addDays, startOfWeek, getDay, addWeeks } from "date-fns";
import { toast } from "sonner";

import DiaryHeader from "../components/diary/DiaryHeader";
import MealsSection from "../components/diary/MealsSection";
import EnergySection from "../components/diary/EnergySection";
import BowelSection from "../components/diary/BowelSection";
import StressSection from "../components/diary/StressSection";
import PainSection from "../components/diary/PainSection";
import SleepSection from "../components/diary/SleepSection";
import CravingsSection from "../components/diary/CravingsSection";
import ExerciseSection from "../components/diary/ExerciseSection";
import AilmentsSection from "../components/diary/AilmentsSection";
import HydrationSection from "../components/diary/HydrationSection";
import CoachFeedbackDisplay from "../components/diary/CoachFeedbackDisplay";

export default function DailyDiary() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [diaryData, setDiaryData] = useState({
    meals: [],
    energy_morning: null,
    energy_afternoon: null,
    energy_evening: null,
    energy_notes: '',
    bowel_movements: [],
    stress_level: null,
    stress_sources: [],
    stress_notes: '',
    abdominal_pain: { quadrant: "none", intensity: 0, timing: "" },
    ailments: [],
    sleep: { hours: null, quality: null, latency_minutes: null, night_wakes: null },
    hydration: { amount: null, unit: 'glasses' },
    cravings: [],
    exercise: [],
    steps: null
  });
  const [weeklyGoals, setWeeklyGoals] = useState({});
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [existingDiary, setExistingDiary] = useState(null);
  const [coachFeedback, setCoachFeedback] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        console.log("=== 🔍 LOADING DIARY DATA ===");
        console.log("📅 Current Date:", format(currentDate, 'yyyy-MM-dd (EEEE)'));
        console.log("👤 Current User:", currentUser.id, currentUser.email);
        
        // Load existing diary for current date - get the MOST RECENT one
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const existingDiaries = await base44.entities.DailyDiary.filter({
          client_id: currentUser.id,
          date: dateStr
        }, '-created_date');
        
        if (existingDiaries.length > 0) {
          // IMPORTANT: If there are multiple entries for the same date, use the most recent one
          const diary = existingDiaries[0];
          
          // Log if there are duplicates (for debugging)
          if (existingDiaries.length > 1) {
            console.warn(`Found ${existingDiaries.length} diary entries for ${dateStr}. Using most recent.`);
          }
          
          setExistingDiary(diary);
          
          // IMPORTANT: Ensure backward compatibility with meals created before food database
          const normalizedMeals = (diary.meals || []).map(meal => ({
            ...meal,
            foods: meal.foods || [],
            total_calories: meal.total_calories || 0,
            total_protein: meal.total_protein || 0,
            total_carbs: meal.total_carbs || 0,
            total_fat: meal.total_fat || 0
          }));
          
          setDiaryData({
            meals: normalizedMeals,
            energy_morning: diary.energy_morning,
            energy_afternoon: diary.energy_afternoon,
            energy_evening: diary.energy_evening,
            energy_notes: diary.energy_notes || '',
            bowel_movements: diary.bowel_movements || [],
            stress_level: diary.stress_level,
            stress_sources: diary.stress_sources || [],
            stress_notes: diary.stress_notes || '',
            abdominal_pain: diary.abdominal_pain || { quadrant: "none", intensity: 0, timing: "" },
            ailments: diary.ailments || [],
            sleep: diary.sleep || { hours: null, quality: null, latency_minutes: null, night_wakes: null },
            hydration: diary.hydration || { amount: null, unit: 'glasses' },
            cravings: diary.cravings || [],
            exercise: diary.exercise || [],
            steps: diary.steps
          });

          // Load coach feedback for this diary entry
          const feedbacks = await base44.entities.CoachFeedback.filter({
            diary_id: diary.id
          });
          if (feedbacks.length > 0) {
            setCoachFeedback(feedbacks[0]);
          } else {
            setCoachFeedback(null); // Clear feedback if no associated feedback found
          }
        } else {
          // Reset to empty state
          setExistingDiary(null);
          setCoachFeedback(null);
          setDiaryData({
            meals: [],
            energy_morning: null,
            energy_afternoon: null,
            energy_evening: null,
            energy_notes: '',
            bowel_movements: [],
            stress_level: null,
            stress_sources: [],
            stress_notes: '',
            abdominal_pain: { quadrant: "none", intensity: 0, timing: "" },
            ailments: [],
            sleep: { hours: null, quality: null, latency_minutes: null, night_wakes: null },
            hydration: { amount: null, unit: 'glasses' },
            cravings: [],
            exercise: [],
            steps: null
          });
        }

        // Load weekly goals - find goals where current date falls within the 7-day range
        const currentDateStr = format(currentDate, 'yyyy-MM-dd');

        console.log("\n=== 📋 LOADING WEEKLY GOALS ===");
        console.log("📅 Current Date:", currentDateStr);
        console.log("👤 Client ID:", currentUser.id);
        console.log("🔍 Loading all goals for client to check date ranges...");

        // Get all goals for this client and filter by date range
        const allGoals = await base44.entities.WeeklyGoals.filter({
          client_id: currentUser.id
        });

        console.log(`   - Found ${allGoals.length} total goal entries`);

        // Filter goals where current date is within the 7-day period
        const goals = allGoals.filter(goal => {
          const goalStart = new Date(goal.week_starting);
          const goalEnd = addWeeks(goalStart, 1);
          const current = new Date(currentDate);
          current.setHours(0, 0, 0, 0);
          goalStart.setHours(0, 0, 0, 0);
          goalEnd.setHours(0, 0, 0, 0);

          const isInRange = current >= goalStart && current < goalEnd;

          if (isInRange) {
            console.log(`   ✓ Goal "${goal.goal}" (${goal.section}) applies: ${goal.week_starting} to ${format(goalEnd, 'yyyy-MM-dd')}`);
          }

          return isInRange;
        });
        
        console.log("\n✅ Goals Query Result:");
        console.log("   - Number of goals found:", goals.length);
        
        if (goals.length > 0) {
          console.log("   - Goals details:");
          goals.forEach(goal => {
            console.log(`     • Section: ${goal.section}`);
            console.log(`       Goal: ${goal.goal || '(no goal text)'}`);
            console.log(`       Has instructions: ${!!goal.instructions}`);
            console.log(`       Has links: ${goal.links?.length || 0}`);
          });
        } else {
          console.log("   ⚠️ NO GOALS FOUND!");
          console.log("   💡 Possible reasons:");
          console.log("      1. Coach hasn't set goals for this week yet");
          console.log("      2. Coach set goals for a different week");
          console.log("      3. Date mismatch between coach and client week calculation");
        }
        
        const goalsMap = {};
        goals.forEach(goal => {
          goalsMap[goal.section] = goal;
        });
        setWeeklyGoals(goalsMap);
        
        console.log("\n📊 Goals Map Created:");
        Object.keys(goalsMap).forEach(section => {
          console.log(`   ✓ ${section}: "${goalsMap[section].goal}"`);
        });
        
        console.log("\n=== END LOADING ===\n");
        
      } catch (error) {
        console.error("❌ Error loading diary data:", error);
        toast.error("Failed to load diary data. Please refresh the page.");
      }
    };

    loadData();
  }, [currentDate]);

  const handleActionItemToggle = async (index) => {
    if (!coachFeedback) return;

    const updatedActionItems = [...coachFeedback.action_items];
    updatedActionItems[index] = {
      ...updatedActionItems[index],
      completed: !updatedActionItems[index].completed
    };

    try {
      const updated = await base44.entities.CoachFeedback.update(coachFeedback.id, {
        action_items: updatedActionItems
      });
      setCoachFeedback(updated);
      toast.success("Action item updated!");
    } catch (error) {
      console.error("Error updating action item:", error);
      toast.error("Failed to update action item");
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.error("No user found when trying to save");
      toast.error("Please log in to save your diary entry");
      return;
    }
    
    setSaving(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const diaryEntry = {
        client_id: user.id,
        assigned_coach_id: user.assigned_coach_id || null,
        date: dateStr,
        meals: diaryData.meals,
        energy_morning: diaryData.energy_morning,
        energy_afternoon: diaryData.energy_afternoon,
        energy_evening: diaryData.energy_evening,
        energy_notes: diaryData.energy_notes,
        bowel_movements: diaryData.bowel_movements,
        stress_level: diaryData.stress_level,
        stress_sources: diaryData.stress_sources,
        stress_notes: diaryData.stress_notes,
        abdominal_pain: diaryData.abdominal_pain,
        ailments: diaryData.ailments,
        sleep: diaryData.sleep,
        hydration: diaryData.hydration,
        cravings: diaryData.cravings,
        exercise: diaryData.exercise,
        steps: diaryData.steps
      };

      console.log("=== SAVING DIARY ENTRY ===");
      console.log("Date:", dateStr);
      console.log("Existing diary ID:", existingDiary?.id || "None - creating new");
      console.log("Full diary data being saved:", JSON.stringify(diaryEntry, null, 2));

      if (existingDiary) {
        console.log("Updating existing diary with ID:", existingDiary.id);
        const updated = await base44.entities.DailyDiary.update(existingDiary.id, diaryEntry);
        console.log("✅ Diary updated successfully");
        setExistingDiary(updated);
        
        // Check for and clean up any duplicate entries for this date
        const allEntriesForDate = await base44.entities.DailyDiary.filter({
          client_id: user.id,
          date: dateStr
        }, '-created_date');
        
        // If there are duplicates (more than just the one we updated), delete them
        if (allEntriesForDate.length > 1) {
          console.log(`Found ${allEntriesForDate.length} entries for ${dateStr}, cleaning up duplicates...`);
          for (let i = 1; i < allEntriesForDate.length; i++) {
            try {
              await base44.entities.DailyDiary.delete(allEntriesForDate[i].id);
              console.log(`Deleted duplicate entry: ${allEntriesForDate[i].id}`);
            } catch (deleteError) {
              console.warn(`Could not delete duplicate entry ${allEntriesForDate[i].id}:`, deleteError);
            }
          }
        }
        
        toast.success("Entry updated successfully!");
      } else {
        // Before creating a new entry, check if one was created while we were filling out the form
        const possibleDuplicates = await base44.entities.DailyDiary.filter({
          client_id: user.id,
          date: dateStr
        }, '-created_date');
        
        if (possibleDuplicates.length > 0) {
          // Update the existing one instead of creating a new one
          console.log("Found existing entry while trying to create new one. Updating instead.");
          const updated = await base44.entities.DailyDiary.update(possibleDuplicates[0].id, diaryEntry);
          console.log("✅ Diary updated successfully (prevented duplicate)");
          setExistingDiary(updated);
        } else {
          console.log("Creating new diary entry");
          const newDiary = await base44.entities.DailyDiary.create(diaryEntry);
          console.log("✅ Diary created successfully:", newDiary.id);
          setExistingDiary(newDiary);
        }
        toast.success("Entry saved successfully!");
      }
      
    } catch (error) {
      console.error("=== ERROR SAVING DIARY ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      
      if (error.message) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        toast.error("Failed to save entry. Please try again.");
      }
    }
    setSaving(false);
  };

  const updateDiarySection = (section, data) => {
    console.log(`Updating section: ${section}`, data);
    setDiaryData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const goToPrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const goToNextDay = () => setCurrentDate(prev => addDays(prev, 1));

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  const isFirstDayOfWeek = getDay(currentDate) === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <DiaryHeader 
          currentDate={currentDate}
          onPrevDay={goToPrevDay}
          onNextDay={goToNextDay}
        />

        {/* Coach Feedback Section */}
        {coachFeedback && (
          <div className="mb-8">
            <CoachFeedbackDisplay 
              feedback={coachFeedback}
              onActionItemToggle={handleActionItemToggle}
              isClient={true}
            />
          </div>
        )}

        <div className="space-y-6">
          <SleepSection 
            sleep={diaryData.sleep}
            onChange={(sleep) => updateDiarySection('sleep', sleep)}
            goal={weeklyGoals.sleep}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <MealsSection 
            meals={diaryData.meals}
            onChange={(meals) => updateDiarySection('meals', meals)}
            goal={weeklyGoals.food_drink}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <EnergySection 
            morning={diaryData.energy_morning}
            afternoon={diaryData.energy_afternoon}
            evening={diaryData.energy_evening}
            notes={diaryData.energy_notes}
            onChange={(field, value) => {
              console.log(`Energy section change: ${field}`, value);
              if (field.startsWith('energy_')) {
                setDiaryData(prev => ({
                  ...prev,
                  [field]: value
                }));
              } else if (field === 'energy_notes') {
                setDiaryData(prev => ({
                  ...prev,
                  energy_notes: value
                }));
              }
            }}
            goal={weeklyGoals.energy}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <BowelSection 
            movements={diaryData.bowel_movements}
            onChange={(movements) => updateDiarySection('bowel_movements', movements)}
            goal={weeklyGoals.bowel}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <StressSection 
            level={diaryData.stress_level}
            sources={diaryData.stress_sources}
            notes={diaryData.stress_notes}
            onLevelChange={(level) => updateDiarySection('stress_level', level)}
            onSourcesChange={(sources) => updateDiarySection('stress_sources', sources)}
            onNotesChange={(notes) => updateDiarySection('stress_notes', notes)}
            goal={weeklyGoals.stress}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <PainSection 
            pain={diaryData.abdominal_pain}
            onChange={(pain) => updateDiarySection('abdominal_pain', pain)}
            goal={weeklyGoals.pain}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <AilmentsSection 
            ailments={diaryData.ailments}
            onChange={(ailments) => updateDiarySection('ailments', ailments)}
            goal={weeklyGoals.ailments}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <HydrationSection 
            hydration={diaryData.hydration}
            onChange={(hydration) => updateDiarySection('hydration', hydration)}
            goal={weeklyGoals.hydration}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <CravingsSection 
            cravings={diaryData.cravings}
            onChange={(cravings) => updateDiarySection('cravings', cravings)}
            goal={weeklyGoals.cravings}
            isInitiallyExpanded={isFirstDayOfWeek}
          />

          <ExerciseSection 
            exercise={diaryData.exercise}
            steps={diaryData.steps}
            onExerciseChange={(exercise) => updateDiarySection('exercise', exercise)}
            onStepsChange={(steps) => updateDiarySection('steps', steps)}
            goal={weeklyGoals.exercise}
            isInitiallyExpanded={isFirstDayOfWeek}
          />
        </div>
      </div>

      {/* Sticky Submit Button at Bottom - Global Save */}
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
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Save className="w-7 h-7" />
                <span>Submit All Entries</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}