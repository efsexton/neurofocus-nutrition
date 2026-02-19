import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Moon } from "lucide-react";
import WeeklyGoalBanner from "./WeeklyGoalBanner";

const ToggleOptions = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(value === option ? null : option)}
        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
          value === option
            ? 'bg-blue-100 border-blue-400 text-blue-800'
            : 'bg-white border-sage-200 text-stone-600 hover:bg-sage-50'
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

export default function SleepSection({ sleep, onChange, goal, isInitiallyExpanded }) {
  const updateSleep = (field, value) => {
    onChange({ ...sleep, [field]: value });
  };

  const getQualityColor = (value) => {
    if (value <= 3) return "text-red-500";
    if (value <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  const getQualityLabel = (value) => {
    if (value <= 2) return "Exhausted";
    if (value <= 4) return "Groggy";
    if (value <= 6) return "Somewhat Rested";
    if (value <= 8) return "Well Rested";
    return "Fully Refreshed";
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Moon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Sleep</CardTitle>
            <p className="text-sm text-stone-600">Track your sleep patterns and quality</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">

        {/* 1. Sleep Quality */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-stone-700 font-medium">1. How rested did you feel on waking?</Label>
            {sleep.quality && (
              <span className={`text-sm font-medium ${getQualityColor(sleep.quality)}`}>
                {sleep.quality}/10 — {getQualityLabel(sleep.quality)}
              </span>
            )}
          </div>
          <Slider
            value={[sleep.quality || 5]}
            onValueChange={(value) => updateSleep('quality', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-stone-500">1 = exhausted/groggy &nbsp;·&nbsp; 5 = somewhat rested &nbsp;·&nbsp; 10 = fully refreshed</p>
        </div>

        {/* 2. Sleep Latency */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">2. How long did it take you to fall asleep? <span className="text-stone-400 font-normal">(minutes)</span></Label>
          <Input
            type="number"
            min="0"
            placeholder="e.g., 15"
            value={sleep.latency_minutes ?? ''}
            onChange={(e) => updateSleep('latency_minutes', e.target.value !== '' ? parseInt(e.target.value) : null)}
            className="border-sage-200 max-w-xs"
          />
          <p className="text-xs text-stone-500">Wearables estimate but are often inaccurate. Latency is important for the stress pillar.</p>
        </div>

        {/* 3. Night Wakes */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">3. How many times did you wake during the night?</Label>
          <Input
            type="number"
            min="0"
            placeholder="e.g., 2"
            value={sleep.night_wakes ?? ''}
            onChange={(e) => updateSleep('night_wakes', e.target.value !== '' ? parseInt(e.target.value) : null)}
            className="border-sage-200 max-w-xs"
          />
        </div>

        {/* 4. Snoring */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">4. Did you snore last night?</Label>
          <ToggleOptions
            options={['Yes', 'No', "Don't know", 'No partner / unsure']}
            value={sleep.snoring}
            onChange={(val) => updateSleep('snoring', val)}
          />
        </div>

        {/* 5. Alcohol */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">5. Alcohol within 3 hours of bed?</Label>
          <ToggleOptions
            options={['Yes', 'No']}
            value={sleep.alcohol_before_bed}
            onChange={(val) => updateSleep('alcohol_before_bed', val)}
          />
        </div>

        {/* 6. Caffeine */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">6. Caffeine after 2pm?</Label>
          <ToggleOptions
            options={['Yes', 'No']}
            value={sleep.caffeine_after_2pm}
            onChange={(val) => updateSleep('caffeine_after_2pm', val)}
          />
        </div>

      </CardContent>
    </Card>
  );
}