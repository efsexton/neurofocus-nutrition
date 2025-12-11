import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Brain } from "lucide-react";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

const commonStressSources = [
  "Work", "Family", "Health", "Money", "Relationships", "Traffic", "Sleep", "Social"
];

export default function StressSection({ level, sources, notes, onLevelChange, onSourcesChange, onNotesChange, goal, isInitiallyExpanded }) {
  const [newSource, setNewSource] = React.useState("");

  const getStressColor = (value) => {
    if (value <= 3) return "text-green-500";
    if (value <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getStressLabel = (value) => {
    if (value <= 2) return "Very Low";
    if (value <= 4) return "Low";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "High";
    return "Very High";
  };

  const addSource = (source) => {
    if (source && !sources.includes(source)) {
      onSourcesChange([...sources, source]);
      setNewSource("");
    }
  };

  const removeSource = (sourceToRemove) => {
    onSourcesChange(sources.filter(source => source !== sourceToRemove));
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Stress Level</CardTitle>
            <p className="text-sm text-stone-600">Track your stress and its sources</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        {/* Stress Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-stone-700 font-medium">Overall Stress Level</Label>
            {level && (
              <span className={`text-sm font-medium ${getStressColor(level)}`}>
                {level}/10 - {getStressLabel(level)}
              </span>
            )}
          </div>
          <Slider
            value={[level || 5]}
            onValueChange={(value) => onLevelChange(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Stress Sources */}
        <div className="space-y-4">
          <Label className="text-stone-700 font-medium">Stress Sources</Label>
          
          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2">
            {commonStressSources.map((source) => (
              <Button
                key={source}
                variant={sources.includes(source) ? "default" : "outline"}
                size="sm"
                onClick={() => 
                  sources.includes(source) 
                    ? removeSource(source)
                    : addSource(source)
                }
                className={sources.includes(source) 
                  ? "bg-sage-600 hover:bg-sage-700" 
                  : "border-sage-200 text-sage-700 hover:bg-sage-50"
                }
              >
                {source}
                {sources.includes(source) && <X className="w-3 h-3 ml-1" />}
              </Button>
            ))}
          </div>

          {/* Custom Source Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom stress source..."
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSource(newSource)}
              className="border-sage-200"
            />
            <Button
              onClick={() => addSource(newSource)}
              variant="outline"
              className="border-sage-200 text-sage-700 hover:bg-sage-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Sources */}
          {sources.length > 0 && (
            <div className="space-y-2">
              <Label className="text-stone-700 text-sm">Selected sources:</Label>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-sage-100 text-sage-700 border-sage-200"
                  >
                    {source}
                    <button
                      onClick={() => removeSource(source)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Notes */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">Additional Notes</Label>
          <Textarea
            placeholder="Any additional observations about your stress today..."
            value={notes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            className="border-sage-200 h-20"
          />
        </div>
      </CardContent>
    </Card>
  );
}