
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Activity, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import WeeklyGoalBanner from "./WeeklyGoalBanner";

const bristolScaleLabels = {
  1: "Separate hard lumps",
  2: "Sausage-shaped but lumpy",
  3: "Sausage-shaped with cracks",
  4: "Sausage-shaped, smooth and soft",
  5: "Soft blobs with clear cut edges",
  6: "Fluffy pieces with ragged edges",
  7: "Watery, no solid pieces"
};

export default function BowelSection({ movements, onChange, goal, isInitiallyExpanded }) {
  const addMovement = () => {
    const newMovement = {
      time: "",
      bristol_scale: 4,
      urgency: false,
      mucus: false,
      blood: false,
      odor: "",
      color: "",
      notes: "",
      photo_url: ""
    };
    onChange([...movements, newMovement]);
  };

  const updateMovement = (index, field, value) => {
    const updated = [...movements];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeMovement = (index) => {
    onChange(movements.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Bowel Movements</CardTitle>
            <p className="text-sm text-stone-600">Track digestive patterns and health</p>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        {movements.map((movement, index) => (
          <div key={index} className="border border-sage-100 rounded-xl p-4 bg-sage-50/30">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-stone-900">Movement {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMovement(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-stone-700">Time</Label>
                <Input
                  type="time"
                  value={movement.time}
                  onChange={(e) => updateMovement(index, 'time', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor={`bristol-scale-${index}`} className="text-stone-700">Bristol Scale (1-7)</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-sage-600 hover:bg-sage-100 h-auto p-1 text-sm">
                        <Info className="w-4 h-4 mr-1" />
                        View Chart
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Bristol Stool Chart</DialogTitle>
                      </DialogHeader>
                      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a2cb22c48637d39936ac04/a19cdcf21_BristolStoolChart.png" alt="Bristol Stool Chart" className="rounded-lg w-full" />
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={movement.bristol_scale?.toString()}
                  onValueChange={(value) => updateMovement(index, 'bristol_scale', parseInt(value))}
                >
                  <SelectTrigger id={`bristol-scale-${index}`} className="border-sage-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(bristolScaleLabels).map(([scale, label]) => (
                      <SelectItem key={scale} value={scale}>
                        {scale} - {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`urgency-${index}`}
                  checked={movement.urgency}
                  onCheckedChange={(checked) => updateMovement(index, 'urgency', checked)}
                />
                <Label htmlFor={`urgency-${index}`} className="text-stone-700">Urgency</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`mucus-${index}`}
                  checked={movement.mucus}
                  onCheckedChange={(checked) => updateMovement(index, 'mucus', checked)}
                />
                <Label htmlFor={`mucus-${index}`} className="text-stone-700">Mucus</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`blood-${index}`}
                  checked={movement.blood}
                  onCheckedChange={(checked) => updateMovement(index, 'blood', checked)}
                />
                <Label htmlFor={`blood-${index}`} className="text-stone-700">Blood</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-stone-700">Color</Label>
                <Input
                  placeholder="e.g., Brown, light brown, dark"
                  value={movement.color}
                  onChange={(e) => updateMovement(index, 'color', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Odor</Label>
                <Input
                  placeholder="e.g., Normal, strong, mild"
                  value={movement.odor}
                  onChange={(e) => updateMovement(index, 'odor', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-stone-700">Additional Notes</Label>
              <Textarea
                placeholder="Any additional observations..."
                value={movement.notes}
                onChange={(e) => updateMovement(index, 'notes', e.target.value)}
                className="mt-1 border-sage-200 h-16"
              />
            </div>
          </div>
        ))}

        <Button
          onClick={addMovement}
          variant="outline"
          className="w-full border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 rounded-xl py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bowel Movement
        </Button>
      </CardContent>
    </Card>
  );
}
