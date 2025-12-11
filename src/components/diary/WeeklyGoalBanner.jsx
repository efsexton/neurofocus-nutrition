import React, { useState, useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Target, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function WeeklyGoalBanner({ goal, isInitiallyExpanded }) {
  const [isOpen, setIsOpen] = useState(isInitiallyExpanded);
  
  // Log when component receives a goal
  useEffect(() => {
    console.log("WeeklyGoalBanner received goal:", goal);
  }, [goal]);
  
  // Strip HTML tags to check if instructions have real content
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };
  
  const hasInstructions = goal?.instructions && 
    goal.instructions !== "EDIT WITH BASE 44" && 
    stripHtml(goal.instructions).length > 0;

  const hasGoalText = goal?.goal && goal.goal.trim().length > 0;

  useEffect(() => {
    setIsOpen(isInitiallyExpanded);
  }, [isInitiallyExpanded]);
  
  if (!goal) {
    console.log("WeeklyGoalBanner: No goal provided");
    return null;
  }
  
  // Show banner if there's EITHER a goal text OR instructions OR links
  if (!hasGoalText && !hasInstructions && (!goal.links || goal.links.length === 0)) {
    console.log("WeeklyGoalBanner: Goal has no content (no title, instructions, or links)");
    return null;
  }

  console.log("WeeklyGoalBanner: Rendering goal banner", {
    hasGoalText,
    hasInstructions,
    hasLinks: goal.links && goal.links.length > 0
  });

  return (
    <div className="mx-6 mb-4">
      <Alert className="border-2 border-sage-300 bg-gradient-to-r from-sage-50 to-green-50 p-0 shadow-md">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-sage-50/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-sage-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Badge className="bg-sage-600 text-white border-0 mb-2">
                📋 This Week's Goal from Your Coach
              </Badge>
              {hasGoalText ? (
                <p className="font-semibold text-stone-900 text-base">{goal.goal}</p>
              ) : (
                <p className="font-semibold text-stone-900 text-base">View instructions below</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {(hasInstructions || (goal.links && goal.links.length > 0)) && (
              <Badge variant="outline" className="border-sage-300 text-sage-700">
                {isOpen ? 'Hide Details' : 'View Details'}
              </Badge>
            )}
            {(hasInstructions || (goal.links && goal.links.length > 0)) && (
              isOpen ? 
                <ChevronUp className="w-5 h-5 text-sage-600" /> : 
                <ChevronDown className="w-5 h-5 text-sage-600" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (hasInstructions || (goal.links && goal.links.length > 0)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t-2 border-sage-200 mx-4 my-2"></div>
              <div className="px-4 pb-4 space-y-3">
                {hasInstructions && (
                  <div>
                    <h4 className="text-sm font-semibold text-sage-800 mb-2">📝 Instructions from Your Coach:</h4>
                    <div className="prose prose-sm prose-stone max-w-none bg-white p-3 rounded-lg border border-sage-200">
                      <ReactMarkdown>{goal.instructions}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {goal.links && goal.links.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-sage-800 mb-2">🔗 Helpful Resources:</h4>
                    <div className="bg-white p-3 rounded-lg border border-sage-200 space-y-2">
                      {goal.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sage-700 hover:text-sage-900 text-sm font-medium hover:underline transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Alert>
    </div>
  );
}