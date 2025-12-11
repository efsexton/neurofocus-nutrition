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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddCustomFoodDialog({ userId, onFoodAdded }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [foodData, setFoodData] = useState({
    name: "",
    category: "other",
    serving_size: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    fiber_g: "",
    is_custom: true,
    is_public: false
  });

  const handleSave = async () => {
    if (!foodData.name.trim() || !foodData.serving_size.trim() || !foodData.calories) {
      toast.error("Please fill in name, serving size, and calories");
      return;
    }

    setSaving(true);
    try {
      const newFood = await base44.entities.FoodDatabase.create({
        ...foodData,
        created_by_user_id: userId,
        calories: parseFloat(foodData.calories) || 0,
        protein_g: parseFloat(foodData.protein_g) || 0,
        carbs_g: parseFloat(foodData.carbs_g) || 0,
        fat_g: parseFloat(foodData.fat_g) || 0,
        fiber_g: parseFloat(foodData.fiber_g) || 0,
      });

      toast.success("Custom food added to database!");
      setOpen(false);
      setFoodData({
        name: "",
        category: "other",
        serving_size: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fat_g: "",
        fiber_g: "",
        is_custom: true,
        is_public: false
      });
      
      if (onFoodAdded) onFoodAdded(newFood);
    } catch (error) {
      console.error("Error adding custom food:", error);
      toast.error("Failed to add custom food");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-sage-200 text-sage-700 hover:bg-sage-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Food
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Custom Food</DialogTitle>
          <DialogDescription>
            Create a custom food item with nutritional information
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Homemade Chicken Salad"
              value={foodData.name}
              onChange={(e) => setFoodData({...foodData, name: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={foodData.category} 
              onValueChange={(value) => setFoodData({...foodData, category: value})}
            >
              <SelectTrigger id="category" className="mt-2 border-sage-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protein">Protein</SelectItem>
                <SelectItem value="vegetable">Vegetable</SelectItem>
                <SelectItem value="fruit">Fruit</SelectItem>
                <SelectItem value="grain">Grain</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="fat">Fat/Oil</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="condiment">Condiment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="serving">Serving Size *</Label>
            <Input
              id="serving"
              placeholder="e.g., 1 cup, 100g, 1 piece"
              value={foodData.serving_size}
              onChange={(e) => setFoodData({...foodData, serving_size: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>

          <div className="col-span-2 border-t border-sage-200 pt-4 mt-2">
            <h4 className="font-medium text-stone-900 mb-3">Nutritional Information</h4>
          </div>

          <div>
            <Label htmlFor="calories">Calories *</Label>
            <Input
              id="calories"
              type="number"
              placeholder="0"
              value={foodData.calories}
              onChange={(e) => setFoodData({...foodData, calories: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>

          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              step="0.1"
              placeholder="0"
              value={foodData.protein_g}
              onChange={(e) => setFoodData({...foodData, protein_g: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>

          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              step="0.1"
              placeholder="0"
              value={foodData.carbs_g}
              onChange={(e) => setFoodData({...foodData, carbs_g: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>

          <div>
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              step="0.1"
              placeholder="0"
              value={foodData.fat_g}
              onChange={(e) => setFoodData({...foodData, fat_g: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>

          <div>
            <Label htmlFor="fiber">Fiber (g)</Label>
            <Input
              id="fiber"
              type="number"
              step="0.1"
              placeholder="0"
              value={foodData.fiber_g}
              onChange={(e) => setFoodData({...foodData, fiber_g: e.target.value})}
              className="mt-2 border-sage-200"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-sage-600 hover:bg-sage-700"
          >
            {saving ? "Saving..." : "Add Food"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}