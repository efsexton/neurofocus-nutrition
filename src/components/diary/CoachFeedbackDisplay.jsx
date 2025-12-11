import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, CheckCircle2, AlertCircle, HelpCircle, ThumbsUp } from "lucide-react";

export default function CoachFeedbackDisplay({ feedback, onActionItemToggle, isClient }) {
  if (!feedback) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-2 border-sage-300 shadow-lg bg-gradient-to-br from-sage-50 to-white">
      <CardHeader className="bg-sage-100 border-b border-sage-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-stone-900">Coach Feedback</CardTitle>
            <p className="text-sm text-stone-600">
              Provided by your coach on {new Date(feedback.created_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Positive Notes */}
        {feedback.positive_notes && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">What You're Doing Great</h4>
                <p className="text-green-800 whitespace-pre-wrap">{feedback.positive_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* General Feedback */}
        {feedback.feedback && (
          <div className="bg-sage-50 border-l-4 border-sage-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-stone-900 mb-2">General Feedback</h4>
                <p className="text-stone-700 whitespace-pre-wrap">{feedback.feedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.areas_for_improvement && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Areas to Focus On</h4>
                <p className="text-blue-800 whitespace-pre-wrap">{feedback.areas_for_improvement}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Items */}
        {feedback.action_items && feedback.action_items.length > 0 && (
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-3">Action Items</h4>
                <div className="space-y-2">
                  {feedback.action_items.map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                        item.completed ? 'border-green-200 bg-green-50' : 'border-purple-200'
                      }`}
                    >
                      {isClient && onActionItemToggle && (
                        <Checkbox
                          id={`action-${index}`}
                          checked={item.completed}
                          onCheckedChange={() => onActionItemToggle(index)}
                          className="mt-0.5"
                        />
                      )}
                      {!isClient && (
                        <div className="mt-1">
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded border-2 border-purple-300" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`text-stone-800 ${item.completed ? 'line-through text-stone-500' : ''}`}>
                          {item.task}
                        </p>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions for Client */}
        {feedback.questions_for_client && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-2">Questions to Consider</h4>
                <p className="text-orange-800 whitespace-pre-wrap">{feedback.questions_for_client}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}