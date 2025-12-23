import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets } from "lucide-react";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

export default function HydrationSection({ hydration, onChange, goal, isInitiallyExpanded }) {
  const updateHydration = (field, value) => {
    onChange({ ...hydration, [field]: value });
  };

  const getHydrationInML = () => {
    if (!hydration.amount) return 0;
    
    switch (hydration.unit) {
      case 'glasses':
        return hydration.amount * 250; // 1 glass = 250ml
      case 'litres':
        return hydration.amount * 1000;
      case 'ml':
      default:
        return hydration.amount;
    }
  };

  const hydrationML = getHydrationInML();
  const recommendedML = 2000; // 2 litres recommended
  const percentage = Math.min((hydrationML / recommendedML) * 100, 100);

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Hydration</CardTitle>
            <p className="text-sm text-stone-600">Track your daily water intake</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">Amount</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g., 8"
              value={hydration.amount || ''}
              onChange={(e) => updateHydration('amount', e.target.value ? parseFloat(e.target.value) : null)}
              className="border-sage-200"
            />
          </div>

          {/* Unit Selector */}
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">Unit</Label>
            <Select 
              value={hydration.unit || 'glasses'} 
              onValueChange={(value) => updateHydration('unit', value)}
            >
              <SelectTrigger className="border-sage-200">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="glasses">Glasses (250ml each)</SelectItem>
                <SelectItem value="ml">Millilitres (ml)</SelectItem>
                <SelectItem value="litres">Litres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hydration Progress Bar */}
        {hydration.amount && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-stone-700">Daily Goal Progress</span>
              <span className="text-sm text-stone-600">
                {hydrationML.toFixed(0)}ml / {recommendedML}ml ({percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-sage-100 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            {percentage >= 100 ? (
              <p className="text-sm text-green-600 font-medium">
                🎉 Great job! You've met your hydration goal!
              </p>
            ) : (
              <p className="text-sm text-stone-600">
                Keep going! Aim for at least 2 litres (8 glasses) per day.
              </p>
            )}
          </div>
        )}

        {/* Quick Reference */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-blue-900">Quick Reference:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 1 glass = 250ml</li>
            <li>• 1 litre = 1000ml = 4 glasses</li>
            <li>• Recommended daily intake: 2-3 litres (8-12 glasses)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}