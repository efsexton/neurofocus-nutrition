import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Activity, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WeeklyGoalBanner from "./WeeklyGoalBanner";

const commonAilments = [
  "Headache",
  "Joint Pain",
  "Muscle Pain",
  "Back Pain",
  "Neck Pain",
  "Circulation Issues",
  "Hand Pain",
  "Foot Pain",
  "Numbness/Tingling",
  "Inflammation",
  "Other"
];

export default function AilmentsSection({ ailments, onChange, goal, isInitiallyExpanded }) {
  const [showForm, setShowForm] = useState(false);
  const [currentAilment, setCurrentAilment] = useState({
    type: "",
    location: "",
    intensity: 5,
    time_occurred: "",
    duration: "",
    notes: ""
  });

  const addAilment = () => {
    if (currentAilment.type && currentAilment.location) {
      onChange([...ailments, { ...currentAilment }]);
      setCurrentAilment({
        type: "",
        location: "",
        intensity: 5,
        time_occurred: "",
        duration: "",
        notes: ""
      });
      setShowForm(false);
    }
  };

  const removeAilment = (index) => {
    onChange(ailments.filter((_, i) => i !== index));
  };

  const getIntensityColor = (value) => {
    if (value <= 3) return "text-green-600";
    if (value <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getIntensityLabel = (value) => {
    if (value <= 3) return "Mild";
    if (value <= 6) return "Moderate";
    return "Severe";
  };

  const getIntensityBadge = (value) => {
    if (value <= 3) return "bg-green-100 text-green-700 border-green-200";
    if (value <= 6) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-stone-900">Pain & Ailments</CardTitle>
              <p className="text-sm text-stone-600">Track any pain or discomfort throughout the day</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ailment
          </Button>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-4">
        {/* Add Ailment Form */}
        {showForm && (
          <div className="bg-purple-50 p-4 rounded-xl space-y-4 border-2 border-purple-200">
            <h4 className="font-medium text-stone-900">Log New Ailment</h4>
            
            {/* Common Ailment Types */}
            <div>
              <Label className="text-stone-700 text-sm mb-2 block">Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {commonAilments.map((type) => (
                  <Button
                    key={type}
                    variant={currentAilment.type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentAilment({ ...currentAilment, type })}
                    className={currentAilment.type === type 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "border-purple-200 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Type */}
            <div>
              <Label className="text-stone-700 text-sm">Or Enter Custom Type</Label>
              <Input
                placeholder="e.g., Wrist pain, Knee ache..."
                value={currentAilment.type}
                onChange={(e) => setCurrentAilment({ ...currentAilment, type: e.target.value })}
                className="mt-1 border-purple-200"
              />
            </div>

            {/* Location */}
            <div>
              <Label className="text-stone-700 text-sm">Location/Body Part</Label>
              <Input
                placeholder="e.g., Left hand, Right knee, Lower back..."
                value={currentAilment.location}
                onChange={(e) => setCurrentAilment({ ...currentAilment, location: e.target.value })}
                className="mt-1 border-purple-200"
              />
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-stone-700 text-sm">Pain Intensity</Label>
                <span className={`text-sm font-medium ${getIntensityColor(currentAilment.intensity)}`}>
                  {currentAilment.intensity}/10 - {getIntensityLabel(currentAilment.intensity)}
                </span>
              </div>
              <Slider
                value={[currentAilment.intensity]}
                onValueChange={(value) => setCurrentAilment({ ...currentAilment, intensity: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Time and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700 text-sm">Time Occurred</Label>
                <Input
                  type="time"
                  value={currentAilment.time_occurred}
                  onChange={(e) => setCurrentAilment({ ...currentAilment, time_occurred: e.target.value })}
                  className="mt-1 border-purple-200"
                />
              </div>
              <div>
                <Label className="text-stone-700 text-sm">Duration</Label>
                <Input
                  placeholder="e.g., 30 minutes, 2 hours"
                  value={currentAilment.duration}
                  onChange={(e) => setCurrentAilment({ ...currentAilment, duration: e.target.value })}
                  className="mt-1 border-purple-200"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-stone-700 text-sm">Additional Notes</Label>
              <Textarea
                placeholder="What were you doing when it occurred? Any triggers? How did you treat it?"
                value={currentAilment.notes}
                onChange={(e) => setCurrentAilment({ ...currentAilment, notes: e.target.value })}
                className="mt-1 border-purple-200 h-20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setCurrentAilment({
                    type: "",
                    location: "",
                    intensity: 5,
                    time_occurred: "",
                    duration: "",
                    notes: ""
                  });
                }}
                className="border-purple-200 text-purple-700"
              >
                Cancel
              </Button>
              <Button
                onClick={addAilment}
                disabled={!currentAilment.type || !currentAilment.location}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Ailment
              </Button>
            </div>
          </div>
        )}

        {/* List of Ailments */}
        {ailments.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-stone-400" />
            <p>No ailments logged for today</p>
            <p className="text-sm">Click "Add Ailment" to track any pain or discomfort</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ailments.map((ailment, index) => (
              <div
                key={index}
                className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-stone-900">{ailment.type}</h4>
                      <Badge variant="outline" className={getIntensityBadge(ailment.intensity)}>
                        {ailment.intensity}/10 - {getIntensityLabel(ailment.intensity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600">Location: {ailment.location}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAilment(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-stone-600 mb-2">
                  {ailment.time_occurred && (
                    <div>
                      <span className="font-medium">Time:</span> {ailment.time_occurred}
                    </div>
                  )}
                  {ailment.duration && (
                    <div>
                      <span className="font-medium">Duration:</span> {ailment.duration}
                    </div>
                  )}
                </div>

                {ailment.notes && (
                  <p className="text-sm text-stone-600 bg-purple-50 p-2 rounded">
                    {ailment.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {ailments.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-stone-900 mb-2">Daily Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-stone-600">Total Ailments</p>
                <p className="text-xl font-bold text-purple-700">{ailments.length}</p>
              </div>
              <div>
                <p className="text-stone-600">Average Intensity</p>
                <p className="text-xl font-bold text-purple-700">
                  {(ailments.reduce((sum, a) => sum + a.intensity, 0) / ailments.length).toFixed(1)}/10
                </p>
              </div>
              <div>
                <p className="text-stone-600">Highest Pain</p>
                <p className="text-xl font-bold text-red-600">
                  {Math.max(...ailments.map(a => a.intensity))}/10
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}