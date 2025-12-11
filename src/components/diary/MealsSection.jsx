
import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Camera, Trash2, UtensilsCrossed, ImageIcon, CheckCircle2, X, Calculator } from "lucide-react";
import { toast } from "sonner";

import WeeklyGoalBanner from "./WeeklyGoalBanner";
import MealTemplateSelector from "./MealTemplateSelector";
import SaveMealTemplateDialog from "./SaveMealTemplateDialog";
import FoodSearchDialog from "./FoodSearchDialog";
import AddCustomFoodDialog from "./AddCustomFoodDialog";

export default function MealsSection({ meals, onChange, goal, isInitiallyExpanded }) {
  const [uploading, setUploading] = React.useState({});
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const addMeal = () => {
    const newMeal = {
      time: "",
      photo_url: "",
      description: "",
      environment: "",
      emotions: "",
      hunger_before: null,
      fullness_after: null,
      foods: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0
    };
    onChange([...meals, newMeal]);
  };

  const addMealFromTemplate = (templateMeal) => {
    onChange([...meals, {
      ...templateMeal, 
      foods: [], 
      total_calories: 0, 
      total_protein: 0, 
      total_carbs: 0, 
      total_fat: 0
    }]);
  };

  const updateMeal = (index, field, value) => {
    const updated = [...meals];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addFoodToMeal = (mealIndex, food) => {
    const updated = [...meals];
    const meal = updated[mealIndex];
    
    // Ensure the meal has the food tracking structure
    if (!meal.foods) meal.foods = [];
    
    // Add food with quantity
    meal.foods = [...meal.foods, { ...food, quantity: 1 }];
    
    // Recalculate totals with safety checks
    meal.total_calories = meal.foods.reduce((sum, f) => sum + ((f.calories || 0) * (f.quantity || 1)), 0);
    meal.total_protein = meal.foods.reduce((sum, f) => sum + ((f.protein_g || 0) * (f.quantity || 1)), 0);
    meal.total_carbs = meal.foods.reduce((sum, f) => sum + ((f.carbs_g || 0) * (f.quantity || 1)), 0);
    meal.total_fat = meal.foods.reduce((sum, f) => sum + ((f.fat_g || 0) * (f.quantity || 1)), 0);
    
    onChange(updated);
  };

  const updateFoodQuantity = (mealIndex, foodIndex, quantity) => {
    const updated = [...meals];
    const meal = updated[mealIndex];
    meal.foods[foodIndex].quantity = parseFloat(quantity) || 1;
    
    // Recalculate totals with safety checks
    meal.total_calories = meal.foods.reduce((sum, f) => sum + ((f.calories || 0) * (f.quantity || 1)), 0);
    meal.total_protein = meal.foods.reduce((sum, f) => sum + ((f.protein_g || 0) * (f.quantity || 1)), 0);
    meal.total_carbs = meal.foods.reduce((sum, f) => sum + ((f.carbs_g || 0) * (f.quantity || 1)), 0);
    meal.total_fat = meal.foods.reduce((sum, f) => sum + ((f.fat_g || 0) * (f.quantity || 1)), 0);
    
    onChange(updated);
  };

  const removeFoodFromMeal = (mealIndex, foodIndex) => {
    const updated = [...meals];
    const meal = updated[mealIndex];
    meal.foods = meal.foods.filter((_, i) => i !== foodIndex);
    
    // Recalculate totals with safety checks
    meal.total_calories = meal.foods.reduce((sum, f) => sum + ((f.calories || 0) * (f.quantity || 1)), 0);
    meal.total_protein = meal.foods.reduce((sum, f) => sum + ((f.protein_g || 0) * (f.quantity || 1)), 0);
    meal.total_carbs = meal.foods.reduce((sum, f) => sum + ((f.carbs_g || 0) * (f.quantity || 1)), 0);
    meal.total_fat = meal.foods.reduce((sum, f) => sum + ((f.fat_g || 0) * (f.quantity || 1)), 0);
    
    onChange(updated);
  };

  const removeMeal = (index) => {
    onChange(meals.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async (file, mealIndex) => {
    setUploading(prev => ({ ...prev, [mealIndex]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateMeal(mealIndex, 'photo_url', file_url);
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading meal photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    }
    setUploading(prev => ({ ...prev, [mealIndex]: false }));
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-stone-900">Food & Drink</CardTitle>
              <p className="text-sm text-stone-600">Track your meals and eating patterns</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {goal && <WeeklyGoalBanner goal={goal} isInitiallyExpanded={isInitiallyExpanded} />}

      <CardContent className="space-y-6">
        {/* Quick Add Buttons */}
        {user && (
          <div className="flex flex-wrap gap-3 justify-center pb-2">
            <MealTemplateSelector 
              onSelectTemplate={addMealFromTemplate}
              userId={user.id}
            />
            <FoodSearchDialog 
              onSelectFood={(food) => {
                // Add to most recent meal or prompt to create one
                if (meals.length > 0) {
                  addFoodToMeal(meals.length - 1, food);
                } else {
                  toast.error("Please add a meal first before adding food to it.");
                }
              }}
            />
            <AddCustomFoodDialog 
              userId={user.id}
              onFoodAdded={() => toast.success("Custom food added! It's now available in search.")}
            />
          </div>
        )}

        {meals.map((meal, index) => (
          <div key={index} className="border border-sage-100 rounded-xl p-4 bg-sage-50/30">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-stone-900">Meal {index + 1}</h4>
                {user && (
                  <SaveMealTemplateDialog 
                    meal={meal}
                    userId={user.id}
                    onSaved={() => toast.success("Template saved!")}
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMeal(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Meal Photo Upload */}
            <div className="mb-4">
              <Label className="text-stone-700 font-medium">Meal Photo</Label>
              {meal.photo_url ? (
                <div className="mt-2 space-y-3">
                  <div className="relative">
                    <img 
                      src={meal.photo_url} 
                      alt="Meal photo" 
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-sage-200"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateMeal(index, 'photo_url', '')}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 hover:text-red-700 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Photo uploaded successfully
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-3">
                    {/* Take Photo Button */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0], index)}
                      className="hidden"
                      id={`meal-photo-take-${index}`}
                      disabled={uploading[index]}
                    />
                    <label htmlFor={`meal-photo-take-${index}`} className="flex-1 min-w-[150px]">
                      <Button
                        variant="outline"
                        disabled={uploading[index]}
                        className="border-sage-200 text-sage-700 hover:bg-sage-50 w-full"
                        asChild
                      >
                        <div className="cursor-pointer flex items-center justify-center gap-2 py-3">
                          {uploading[index] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-600" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4" />
                              Take Photo
                            </>
                          )}
                        </div>
                      </Button>
                    </label>

                    {/* Upload Photo Button */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0], index)}
                      className="hidden"
                      id={`meal-photo-upload-${index}`}
                      disabled={uploading[index]}
                    />
                    <label htmlFor={`meal-photo-upload-${index}`} className="flex-1 min-w-[150px]">
                      <Button
                        variant="outline"
                        disabled={uploading[index]}
                        className="border-sage-200 text-sage-700 hover:bg-sage-50 w-full"
                        asChild
                      >
                        <div className="cursor-pointer flex items-center justify-center gap-2 py-3">
                          {uploading[index] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-600" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4" />
                              Upload Photo
                            </>
                          )}
                        </div>
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Food Items List */}
            {(meal.foods && meal.foods.length > 0) && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-stone-700 font-medium">Foods in this meal:</Label>
                  {user && (
                    <FoodSearchDialog 
                      onSelectFood={(food) => addFoodToMeal(index, food)}
                    />
                  )}
                </div>
                
                {meal.foods.map((food, foodIndex) => (
                  <div key={foodIndex} className="bg-white border border-sage-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-2">
                        <p className="font-medium text-stone-900 text-sm">{food.food_name}</p>
                        <p className="text-xs text-stone-500">{food.serving_size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={food.quantity || 1}
                          onChange={(e) => updateFoodQuantity(index, foodIndex, e.target.value)}
                          className="w-20 h-8 text-sm border-sage-200 text-center"
                        />
                        <span className="text-xs text-stone-500 whitespace-nowrap">servings</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFoodFromMeal(index, foodIndex)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                      <div>
                        <span className="font-semibold">{Math.round((food.calories || 0) * (food.quantity || 1))}</span>
                        <span className="text-stone-500 ml-1">cal</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-600">{((food.protein_g || 0) * (food.quantity || 1)).toFixed(1)}g</span>
                        <span className="text-stone-500 ml-1">protein</span>
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-600">{((food.carbs_g || 0) * (food.quantity || 1)).toFixed(1)}g</span>
                        <span className="text-stone-500 ml-1">carbs</span>
                      </div>
                      <div>
                        <span className="font-semibold text-red-600">{((food.fat_g || 0) * (food.quantity || 1)).toFixed(1)}g</span>
                        <span className="text-stone-500 ml-1">fat</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Meal Totals */}
                <div className="bg-sage-100 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-stone-900 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Meal Totals
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-stone-900 text-lg">{Math.round(meal.total_calories || 0)}</p>
                      <p className="text-stone-600">calories</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600 text-lg">{(meal.total_protein || 0).toFixed(1)}g</p>
                      <p className="text-stone-600">protein</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-yellow-600 text-lg">{(meal.total_carbs || 0).toFixed(1)}g</p>
                      <p className="text-stone-600">carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-red-600 text-lg">{(meal.total_fat || 0).toFixed(1)}g</p>
                      <p className="text-stone-600">fat</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Food Button if no foods yet */}
            {(!meal.foods || meal.foods.length === 0) && user && (
              <div className="mb-4">
                <FoodSearchDialog 
                  onSelectFood={(food) => addFoodToMeal(index, food)}
                  trigger={<Button variant="outline" className="w-full border-sage-200 text-sage-700 hover:bg-sage-50"><Plus className="w-4 h-4 mr-2" /> Add Food</Button>}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-stone-700">Time</Label>
                <Input
                  type="time"
                  value={meal.time}
                  onChange={(e) => updateMeal(index, 'time', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Environment</Label>
                <Input
                  placeholder="e.g., At home, restaurant, car"
                  value={meal.environment}
                  onChange={(e) => updateMeal(index, 'environment', e.target.value)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-stone-700">Food Description</Label>
              <Textarea
                placeholder="Describe what you ate and drank..."
                value={meal.description}
                onChange={(e) => updateMeal(index, 'description', e.target.value)}
                className="mt-1 border-sage-200 h-20"
              />
            </div>

            <div className="mb-4">
              <Label className="text-stone-700">Emotions</Label>
              <Input
                placeholder="How were you feeling while eating?"
                value={meal.emotions}
                onChange={(e) => updateMeal(index, 'emotions', e.target.value)}
                className="mt-1 border-sage-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-stone-700">Hunger Before (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Rate 1-10"
                  value={meal.hunger_before || ''}
                  onChange={(e) => updateMeal(index, 'hunger_before', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 border-sage-200"
                />
              </div>
              <div>
                <Label className="text-stone-700">Fullness After (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Rate 1-10"
                  value={meal.fullness_after || ''}
                  onChange={(e) => updateMeal(index, 'fullness_after', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 border-sage-200"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          onClick={addMeal}
          variant="outline"
          className="w-full border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 rounded-xl py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Meal
        </Button>
      </CardContent>
    </Card>
  );
}
