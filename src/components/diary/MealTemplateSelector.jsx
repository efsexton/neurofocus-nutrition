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
import { Star, Clock, Search, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MealTemplateSelector({ onSelectTemplate, userId }) {
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadTemplates();
    }
  }, [open, userId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await base44.entities.MealTemplate.filter(
        { client_id: userId },
        '-last_used_date',
        100
      );
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error loading meal templates:", error);
      toast.error("Failed to load meal templates");
    }
    setLoading(false);
  };

  const handleSelectTemplate = async (template) => {
    try {
      // Update usage stats
      await base44.entities.MealTemplate.update(template.id, {
        usage_count: (template.usage_count || 0) + 1,
        last_used_date: format(new Date(), 'yyyy-MM-dd')
      });

      // Return template data without the metadata
      onSelectTemplate({
        description: template.description,
        time: template.time || "",
        environment: template.environment || "",
        emotions: template.emotions || "",
        hunger_before: template.hunger_before || 5,
        fullness_after: template.fullness_after || 5,
        photo_url: ""
      });

      toast.success(`Added "${template.name}" to your diary`);
      setOpen(false);
    } catch (error) {
      console.error("Error using template:", error);
      toast.error("Failed to use template");
    }
  };

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meal template?")) return;

    try {
      await base44.entities.MealTemplate.delete(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success("Template deleted");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const toggleFavorite = async (template, e) => {
    e.stopPropagation();
    try {
      const updated = await base44.entities.MealTemplate.update(template.id, {
        is_favorite: !template.is_favorite
      });
      setTemplates(templates.map(t => t.id === template.id ? updated : t));
      toast.success(updated.is_favorite ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteTemplates = filteredTemplates.filter(t => t.is_favorite);
  const recentTemplates = filteredTemplates
    .filter(t => t.last_used_date)
    .sort((a, b) => new Date(b.last_used_date) - new Date(a.last_used_date))
    .slice(0, 10);
  const allTemplates = filteredTemplates;

  const categoryTemplates = (category) => 
    filteredTemplates.filter(t => t.category === category);

  const TemplateCard = ({ template }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all border-sage-200 hover:border-sage-400"
      onClick={() => handleSelectTemplate(template)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-stone-900">{template.name}</h4>
              {template.is_favorite && (
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <p className="text-sm text-stone-600 line-clamp-2">{template.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {template.category && (
            <Badge variant="outline" className="text-xs capitalize">
              {template.category}
            </Badge>
          )}
          {template.time && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {template.time}
            </Badge>
          )}
          {template.usage_count > 0 && (
            <Badge variant="outline" className="text-xs text-sage-700">
              Used {template.usage_count}x
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-sage-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => toggleFavorite(template, e)}
            className="text-xs"
          >
            <Star className={`w-3 h-3 mr-1 ${template.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {template.is_favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteTemplate(template.id, e)}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-sage-200 text-sage-700 hover:bg-sage-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Add from Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Meal Templates</DialogTitle>
        </DialogHeader>

        <div className="flex-shrink-0 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search templates..."
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
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 mb-2">No meal templates yet</p>
            <p className="text-sm text-stone-500">
              Save meals as templates to quickly add them in the future
            </p>
          </div>
        ) : (
          <Tabs defaultValue="favorites" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="favorites" className="mt-0">
                {favoriteTemplates.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">
                    No favorite templates yet. Click the star icon to add favorites.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteTemplates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-0">
                {recentTemplates.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">
                    No recently used templates
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentTemplates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="breakfast" className="mt-0">
                {categoryTemplates('breakfast').length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No breakfast templates</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTemplates('breakfast').map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lunch" className="mt-0">
                {categoryTemplates('lunch').length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No lunch templates</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTemplates('lunch').map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dinner" className="mt-0">
                {categoryTemplates('dinner').length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No dinner templates</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTemplates('dinner').map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}