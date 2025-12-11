
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Cookie } from "lucide-react";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

export default function CravingsSection({ cravings, onChange, goal, isInitiallyExpanded }) {
  const addCraving = () => {
    const newCraving = {
      type: "",
      timing: "",
      trigger: ""
    };
    onChange([...cravings, newCraving]);
  };

  const updateCraving = (index, field, value) => {
    const updated = [...cravings];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCraving = (index) => {
    onChange(cravings.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
            <Cookie className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Cravings</CardTitle>
            <p className="text-sm text-stone-600">Track food cravings and their triggers</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        {cravings.map((craving, index) => (
          <div key={index} className="border border-sage-100 rounded-xl p-4 bg-sage-50/30">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-stone-900">Craving {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCraving(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-stone-700">Food Type</Label>
                <Input
                  placeholder="e.g., Chocolate, salty snacks"
                  value={craving.type}
                  onChange={(e) => updateCraving(index, 'type', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Timing</Label>
                <Input
                  placeholder="e.g., 3pm, after dinner"
                  value={craving.timing}
                  onChange={(e) => updateCraving(index, 'timing', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Trigger</Label>
                <Input
                  placeholder="e.g., Stress, boredom, TV"
                  value={craving.trigger}
                  onChange={(e) => updateCraving(index, 'trigger', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          onClick={addCraving}
          variant="outline"
          className="w-full border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 rounded-xl py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Craving
        </Button>
      </CardContent>
    </Card>
  );
}
