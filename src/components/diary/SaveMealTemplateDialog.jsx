import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, Star } from "lucide-react";
import { toast } from "sonner";

export default function SaveMealTemplateDialog({ meal, userId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("other");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!meal.description || !meal.description.trim()) {
      toast.error("Cannot save empty meal as template");
      return;
    }

    setSaving(true);
    try {
      const template = await base44.entities.MealTemplate.create({
        client_id: userId,
        name: templateName.trim(),
        description: meal.description,
        time: meal.time || "",
        environment: meal.environment || "",
        emotions: meal.emotions || "",
        hunger_before: meal.hunger_before || 5,
        fullness_after: meal.fullness_after || 5,
        category: category,
        is_favorite: isFavorite,
        usage_count: 0
      });

      toast.success("Meal template saved!");
      setOpen(false);
      setTemplateName("");
      setCategory("other");
      setIsFavorite(false);
      
      if (onSaved) onSaved(template);
    } catch (error) {
      console.error("Error saving meal template:", error);
      toast.error("Failed to save template");
    }
    setSaving(false);
  };

  const isValidMeal = meal.description && meal.description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={!isValidMeal}
          className="text-sage-700 hover:bg-sage-50"
          title={!isValidMeal ? "Add meal description first" : "Save as template"}
        >
          <Bookmark className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Meal Template</DialogTitle>
          <DialogDescription>
            Save this meal as a template for quick access in the future
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g., My usual breakfast"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-2 border-sage-200"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="mt-2 border-sage-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "bg-yellow-500 hover:bg-yellow-600" : "border-sage-200"}
            >
              <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-white' : ''}`} />
              {isFavorite ? "Marked as Favorite" : "Mark as Favorite"}
            </Button>
          </div>

          <div className="bg-sage-50 p-3 rounded-lg text-sm text-stone-700">
            <p className="font-medium mb-1">This template will save:</p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Food description: {meal.description?.substring(0, 50)}{meal.description?.length > 50 ? '...' : ''}</li>
              {meal.time && <li>• Time: {meal.time}</li>}
              {meal.environment && <li>• Environment: {meal.environment}</li>}
              {meal.emotions && <li>• Emotions: {meal.emotions}</li>}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !templateName.trim()}
            className="bg-sage-600 hover:bg-sage-700"
          >
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}