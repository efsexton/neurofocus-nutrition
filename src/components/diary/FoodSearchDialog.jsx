import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, Apple, Beef, Coffee } from "lucide-react";
import { toast } from "sonner";

export default function FoodSearchDialog({ onSelectFood }) {
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadFoods();
    }
  }, [open]);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const allFoods = await base44.entities.FoodDatabase.list('name', 500);
      setFoods(allFoods);
    } catch (error) {
      console.error("Error loading food database:", error);
      toast.error("Failed to load food database");
    }
    setLoading(false);
  };

  const handleSelectFood = (food) => {
    onSelectFood({
      food_id: food.id,
      food_name: food.name,
      serving_size: food.serving_size,
      quantity: 1,
      calories: food.calories || 0,
      protein_g: food.protein_g || 0,
      carbs_g: food.carbs_g || 0,
      fat_g: food.fat_g || 0,
      fiber_g: food.fiber_g || 0
    });
    toast.success(`Added ${food.name}`);
    setOpen(false);
  };

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categoryFoods = (category) => 
    filteredFoods.filter(f => f.category === category);

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'protein': return Beef;
      case 'fruit': return Apple;
      case 'beverage': return Coffee;
      default: return Apple;
    }
  };

  const FoodCard = ({ food }) => {
    const Icon = getCategoryIcon(food.category);
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-all border-sage-200 hover:border-sage-400"
        onClick={() => handleSelectFood(food)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-sage-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-stone-900 text-sm">{food.name}</h4>
                <p className="text-xs text-stone-500">{food.serving_size}</p>
              </div>
            </div>
            {food.is_custom && (
              <Badge variant="outline" className="text-xs">Custom</Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
            <div className="text-center">
              <p className="font-semibold text-stone-900">{food.calories || 0}</p>
              <p className="text-stone-500">cal</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-blue-600">{food.protein_g || 0}g</p>
              <p className="text-stone-500">protein</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-yellow-600">{food.carbs_g || 0}g</p>
              <p className="text-stone-500">carbs</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-red-600">{food.fat_g || 0}g</p>
              <p className="text-stone-500">fat</p>
            </div>
          </div>

          {food.tags && food.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {food.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-sage-200 text-sage-700 hover:bg-sage-50"
        >
          <Search className="w-4 h-4 mr-2" />
          Search Food Database
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Food Database</DialogTitle>
        </DialogHeader>

        <div className="flex-shrink-0 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by name, category, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-sage-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 mb-2">No foods in database yet</p>
            <p className="text-sm text-stone-500">
              Ask your coach to add common foods, or add your own custom items
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="protein">Protein</TabsTrigger>
              <TabsTrigger value="vegetable">Veggies</TabsTrigger>
              <TabsTrigger value="fruit">Fruits</TabsTrigger>
              <TabsTrigger value="grain">Grains</TabsTrigger>
              <TabsTrigger value="dairy">Dairy</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFoods.map(food => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </TabsContent>

              {['protein', 'vegetable', 'fruit', 'grain', 'dairy'].map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  {categoryFoods(category).length === 0 ? (
                    <p className="text-center text-stone-500 py-8">
                      No {category} items found
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryFoods(category).map(food => (
                        <FoodCard key={food.id} food={food} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}