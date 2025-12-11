import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Battery, Sunrise, Sun, Moon } from "lucide-react";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

export default function EnergySection({ morning, afternoon, evening, notes, onChange, goal, isInitiallyExpanded }) {
  const getEnergyColor = (value) => {
    if (value <= 3) return "text-red-500";
    if (value <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  const getEnergyLabel = (value) => {
    if (value <= 2) return "Very Low";
    if (value <= 4) return "Low";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "High";
    return "Very High";
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Battery className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Energy Levels</CardTitle>
            <p className="text-sm text-stone-600">Rate your energy throughout the day</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-8">
        {/* Morning Energy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sunrise className="w-5 h-5 text-orange-500" />
            <Label className="text-stone-700 font-medium">Morning Energy</Label>
            {morning && (
              <span className={`text-sm font-medium ${getEnergyColor(morning)}`}>
                {morning}/10 - {getEnergyLabel(morning)}
              </span>
            )}
          </div>
          <Slider
            value={[morning || 5]}
            onValueChange={(value) => onChange('energy_morning', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Afternoon Energy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <Label className="text-stone-700 font-medium">Afternoon Energy</Label>
            {afternoon && (
              <span className={`text-sm font-medium ${getEnergyColor(afternoon)}`}>
                {afternoon}/10 - {getEnergyLabel(afternoon)}
              </span>
            )}
          </div>
          <Slider
            value={[afternoon || 5]}
            onValueChange={(value) => onChange('energy_afternoon', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Evening Energy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-blue-500" />
            <Label className="text-stone-700 font-medium">Evening Energy</Label>
            {evening && (
              <span className={`text-sm font-medium ${getEnergyColor(evening)}`}>
                {evening}/10 - {getEnergyLabel(evening)}
              </span>
            )}
          </div>
          <Slider
            value={[evening || 5]}
            onValueChange={(value) => onChange('energy_evening', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Energy Notes */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Additional Notes</Label>
          <Textarea
            placeholder="Any additional observations about your energy levels today..."
            value={notes || ''}
            onChange={(e) => onChange('energy_notes', e.target.value)}
            className="border-sage-200 h-20"
          />
        </div>
      </CardContent>
    </Card>
  );
}