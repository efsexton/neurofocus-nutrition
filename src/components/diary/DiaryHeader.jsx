import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function DiaryHeader({ currentDate, onPrevDay, onNextDay }) {
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  return (
    <Card className="mb-8 border-sage-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl text-stone-900 mb-2">Daily Nutrition Diary</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sage-700">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-lg font-medium">
                  {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </span>
                {isToday && (
                  <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center bg-white border border-sage-200 rounded-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevDay}
              className="rounded-l-xl hover:bg-sage-50 text-stone-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextDay}
              disabled={isToday}
              className="rounded-r-xl hover:bg-sage-50 text-stone-600 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}