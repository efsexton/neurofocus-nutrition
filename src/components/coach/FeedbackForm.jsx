import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackForm({ existingFeedback, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState(existingFeedback || {
    positive_notes: "",
    feedback: "",
    areas_for_improvement: "",
    questions_for_client: "",
    action_items: []
  });

  const [newActionItem, setNewActionItem] = useState({
    task: "",
    priority: "medium"
  });

  const addActionItem = () => {
    if (newActionItem.task.trim()) {
      setFormData(prev => ({
        ...prev,
        action_items: [
          ...prev.action_items,
          { ...newActionItem, completed: false }
        ]
      }));
      setNewActionItem({ task: "", priority: "medium" });
    }
  };

  const removeActionItem = (index) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.feedback && !formData.positive_notes && !formData.areas_for_improvement && 
        !formData.questions_for_client && formData.action_items.length === 0) {
      toast.error("Please provide at least one piece of feedback");
      return;
    }
    onSave(formData);
  };

  return (
    <Card className="border-2 border-sage-300 shadow-lg">
      <CardHeader className="bg-sage-100 border-b border-sage-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-stone-900">
                {existingFeedback ? "Edit Feedback" : "Add Coach Feedback"}
              </CardTitle>
              <p className="text-sm text-stone-600">Provide personalized guidance for this diary entry</p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Positive Notes */}
        <div>
          <Label className="text-stone-700 font-medium flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            What They're Doing Great
          </Label>
          <Textarea
            placeholder="Highlight positive behaviors, good choices, or improvements you've noticed..."
            value={formData.positive_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, positive_notes: e.target.value }))}
            className="border-sage-200 h-24"
          />
        </div>

        {/* General Feedback */}
        <div>
          <Label className="text-stone-700 font-medium flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-sage-500 rounded-full"></span>
            General Feedback
          </Label>
          <Textarea
            placeholder="Overall observations, patterns you've noticed, or general comments..."
            value={formData.feedback}
            onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
            className="border-sage-200 h-24"
          />
        </div>

        {/* Areas for Improvement */}
        <div>
          <Label className="text-stone-700 font-medium flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Areas to Focus On
          </Label>
          <Textarea
            placeholder="Constructive suggestions for improvement or areas that need attention..."
            value={formData.areas_for_improvement}
            onChange={(e) => setFormData(prev => ({ ...prev, areas_for_improvement: e.target.value }))}
            className="border-sage-200 h-24"
          />
        </div>

        {/* Action Items */}
        <div>
          <Label className="text-stone-700 font-medium flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            Action Items
          </Label>
          <p className="text-sm text-stone-600 mb-3">Create specific tasks for the client to complete</p>
          
          {/* Existing Action Items */}
          {formData.action_items.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.action_items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-stone-800">{item.task}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.priority} priority
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActionItem(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Action Item */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Drink 8 glasses of water daily"
              value={newActionItem.task}
              onChange={(e) => setNewActionItem(prev => ({ ...prev, task: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
              className="flex-1 border-sage-200"
            />
            <Select
              value={newActionItem.priority}
              onValueChange={(value) => setNewActionItem(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-32 border-sage-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={addActionItem}
              variant="outline"
              className="border-sage-200 text-sage-700 hover:bg-sage-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Questions for Client */}
        <div>
          <Label className="text-stone-700 font-medium flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
            Questions to Consider
          </Label>
          <Textarea
            placeholder="Thought-provoking questions to help the client reflect on their choices..."
            value={formData.questions_for_client}
            onChange={(e) => setFormData(prev => ({ ...prev, questions_for_client: e.target.value }))}
            className="border-sage-200 h-24"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-sage-200">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="border-sage-200 text-sage-700 hover:bg-sage-50"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-sage-600 hover:bg-sage-700 text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {existingFeedback ? "Update Feedback" : "Save Feedback"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}