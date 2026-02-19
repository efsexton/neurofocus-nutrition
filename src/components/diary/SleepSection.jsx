import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Moon } from "lucide-react";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hours of Sleep */}
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">Hours of Sleep</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="24"
              placeholder="e.g., 7.5"
              value={sleep.hours || ''}
              onChange={(e) => updateSleep('hours', e.target.value ? parseFloat(e.target.value) : null)}
              className="border-sage-200"
            />
          </div>

          {/* Sleep Latency */}
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">Time to Fall Asleep (minutes)</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 15"
              value={sleep.latency_minutes ?? ''}
              onChange={(e) => updateSleep('latency_minutes', e.target.value !== '' ? parseInt(e.target.value) : null)}
              className="border-sage-200"
            />
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-stone-700 font-medium">How rested did you feel on waking?</Label>
            {sleep.quality && (
              <span className={`text-sm font-medium ${getQualityColor(sleep.quality)}`}>
                {sleep.quality}/10 - {getQualityLabel(sleep.quality)}
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
          <p className="text-xs text-stone-500 mt-2">
            1 = exhausted/groggy, 5 = somewhat rested, 10 = fully refreshed
          </p>
        </div>

        {/* Night Wakes */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Number of Night Wakes</Label>
          <Input
            type="number"
            min="0"
            placeholder="e.g., 2"
            value={sleep.night_wakes ?? ''}
            onChange={(e) => updateSleep('night_wakes', e.target.value !== '' ? parseInt(e.target.value) : null)}
            className="border-sage-200"
          />
        </div>

        {/* Snoring */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Snoring last night?</Label>
          <div className="flex gap-3">
            {['yes', 'no', "don't know"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateSleep('snoring', sleep.snoring === option ? null : option)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                  sleep.snoring === option
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-white border-sage-200 text-stone-600 hover:bg-sage-50'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Alcohol within 3 hours of bed */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Alcohol within 3 hours of bed?</Label>
          <div className="flex gap-3">
            {['yes', 'no'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateSleep('alcohol_before_bed', sleep.alcohol_before_bed === option ? null : option)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                  sleep.alcohol_before_bed === option
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-white border-sage-200 text-stone-600 hover:bg-sage-50'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Caffeine after 2pm */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Caffeine after 2pm?</Label>
          <div className="flex gap-3">
            {['yes', 'no'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateSleep('caffeine_after_2pm', sleep.caffeine_after_2pm === option ? null : option)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                  sleep.caffeine_after_2pm === option
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-white border-sage-200 text-stone-600 hover:bg-sage-50'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}