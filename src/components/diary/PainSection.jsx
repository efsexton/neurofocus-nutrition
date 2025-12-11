
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

const quadrantLabels = {
  "none": "No Pain",
  "upper_left": "Upper Left",
  "upper_centre": "Upper Centre", 
  "upper_right": "Upper Right",
  "middle_left": "Middle Left",
  "middle_centre": "Middle Centre",
  "middle_right": "Middle Right",
  "lower_left": "Lower Left",
  "lower_centre": "Lower Centre",
  "lower_right": "Lower Right"
};

export default function PainSection({ pain, onChange, goal, isInitiallyExpanded }) {
  const updatePain = (field, value) => {
    onChange({ ...pain, [field]: value });
  };

  const getPainColor = (value) => {
    if (value === 0) return "text-green-500";
    if (value <= 3) return "text-yellow-500";
    if (value <= 7) return "text-orange-500";
    return "text-red-500";
  };

  const getPainLabel = (value) => {
    if (value === 0) return "No Pain";
    if (value <= 3) return "Mild";
    if (value <= 7) return "Moderate";
    return "Severe";
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Abdominal Pain</CardTitle>
            <p className="text-sm text-stone-600">Track pain location and intensity</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        {/* Pain Quadrant */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="pain-location" className="text-stone-700 font-medium">Pain Location</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sage-600 hover:bg-sage-100 h-auto p-1 text-sm">
                  <Info className="w-4 h-4 mr-1" />
                  View Regions
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Abdominal Pain Regions</DialogTitle>
                </DialogHeader>
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a2cb22c48637d39936ac04/f62bdea78_AbdonimalPainLocator.jpg" alt="Abdominal Pain Locator" className="rounded-lg w-full" />
              </DialogContent>
            </Dialog>
          </div>
          <Select
            value={pain.quadrant || "none"}
            onValueChange={(value) => updatePain('quadrant', value)}
          >
            <SelectTrigger id="pain-location" className="border-sage-200 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(quadrantLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pain Intensity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-stone-700 font-medium">Pain Intensity</Label>
            <span className={`text-sm font-medium ${getPainColor(pain.intensity || 0)}`}>
              {pain.intensity || 0}/10 - {getPainLabel(pain.intensity || 0)}
            </span>
          </div>
          <Slider
            value={[pain.intensity || 0]}
            onValueChange={(value) => updatePain('intensity', value[0])}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Pain Timing */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Pain Timing</Label>
          <Input
            placeholder="e.g., After meals, morning, constant"
            value={pain.timing || ''}
            onChange={(e) => updatePain('timing', e.target.value)}
            className="border-sage-200"
          />
        </div>
      </CardContent>
    </Card>
  );
}
