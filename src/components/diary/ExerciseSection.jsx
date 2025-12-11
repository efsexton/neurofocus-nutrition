
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Activity } from "lucide-react";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

export default function ExerciseSection({ exercise, steps, onExerciseChange, onStepsChange, goal, isInitiallyExpanded }) {
  const addExercise = () => {
    const newExercise = {
      type: "",
      duration_minutes: null,
      rpe: null,
      calories_burned: null,
      feeling_before: "",
      feeling_after: ""
    };
    onExerciseChange([...exercise, newExercise]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercise];
    updated[index] = { ...updated[index], [field]: value };
    onExerciseChange(updated);
  };

  const removeExercise = (index) => {
    onExerciseChange(exercise.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Exercise & Movement</CardTitle>
            <p className="text-sm text-stone-600">Track physical activity and step count</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        {/* Steps */}
        <div className="bg-sage-50/30 rounded-xl p-4 border border-sage-100">
          <Label className="text-stone-700 font-medium">Daily Steps</Label>
          <Input
            type="number"
            placeholder="e.g., 10000"
            value={steps || ''}
            onChange={(e) => onStepsChange(e.target.value ? parseInt(e.target.value) : null)}
            className="mt-2 border-sage-200"
          />
        </div>

        {/* Exercise Entries */}
        {exercise.map((entry, index) => (
          <div key={index} className="border border-sage-100 rounded-xl p-4 bg-sage-50/30">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-stone-900">Exercise {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExercise(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-stone-700">Exercise Type</Label>
                <Input
                  placeholder="e.g., Running, Yoga, Weightlifting"
                  value={entry.type}
                  onChange={(e) => updateExercise(index, 'type', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={entry.duration_minutes || ''}
                  onChange={(e) => updateExercise(index, 'duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-stone-700">RPE (1-10 difficulty)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Rate of Perceived Exertion"
                  value={entry.rpe || ''}
                  onChange={(e) => updateExercise(index, 'rpe', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Calories Burned (optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 250"
                  value={entry.calories_burned || ''}
                  onChange={(e) => updateExercise(index, 'calories_burned', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700">Feeling Before</Label>
                <Input
                  placeholder="e.g., Tired, energetic, motivated"
                  value={entry.feeling_before}
                  onChange={(e) => updateExercise(index, 'feeling_before', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Feeling After</Label>
                <Input
                  placeholder="e.g., Refreshed, accomplished, sore"
                  value={entry.feeling_after}
                  onChange={(e) => updateExercise(index, 'feeling_after', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          onClick={addExercise}
          variant="outline"
          className="w-full border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 rounded-xl py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </CardContent>
    </Card>
  );
}
