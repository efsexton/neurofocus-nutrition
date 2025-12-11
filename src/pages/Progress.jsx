import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { DailyDiary } from '@/entities/DailyDiary';
import { addDays, format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FileText, Activity, Moon, Brain, BarChart } from 'lucide-react';

import SummaryMetrics from '../components/reports/SummaryMetrics';
import TrendsChart from '../components/reports/TrendsChart';
import SymptomFrequencyChart from '../components/reports/SymptomFrequencyChart';

export default function Progress() {
    const [currentUser, setCurrentUser] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const processReportData = (entries) => {
        if (!entries || entries.length === 0) return null;

        const trendData = entries.map(entry => ({
            date: format(parseISO(entry.date), 'MMM d'),
            energy: ((entry.energy_morning || 0) + (entry.energy_afternoon || 0) + (entry.energy_evening || 0)) / 3,
            stress: entry.stress_level,
            sleep: entry.sleep?.hours,
        })).reverse();

        const summary = entries.reduce((acc, entry) => {
            acc.totalSleep += entry.sleep?.hours || 0;
            acc.totalStress += entry.stress_level || 0;
            acc.totalEnergy += ((entry.energy_morning || 0) + (entry.energy_afternoon || 0) + (entry.energy_evening || 0)) / 3;
            if (entry.sleep?.hours) acc.sleepDays++;
            if (entry.stress_level) acc.stressDays++;
            if (entry.energy_morning || entry.energy_afternoon || entry.energy_evening) acc.energyDays++;

            if(entry.abdominal_pain?.intensity > 0) acc.symptoms.pain++;
            entry.bowel_movements.forEach(bm => {
                if ([1,2,6,7].includes(bm.bristol_scale)) acc.symptoms.bowel++;
            });
            if(entry.cravings?.length > 0) acc.symptoms.cravings++;

            return acc;
        }, { 
            totalSleep: 0, totalStress: 0, totalEnergy: 0, 
            sleepDays: 0, stressDays: 0, energyDays: 0,
            symptoms: { pain: 0, bowel: 0, cravings: 0 }
        });
        
        const symptomFrequency = [
            { name: 'Pain Days', count: summary.symptoms.pain },
            { name: 'Bowel Issues', count: summary.symptoms.bowel },
            { name: 'Cravings', count: summary.symptoms.cravings },
        ];

        return {
            trendData,
            summaryMetrics: {
                avgSleep: summary.sleepDays > 0 ? (summary.totalSleep / summary.sleepDays).toFixed(1) : 'N/A',
                avgStress: summary.stressDays > 0 ? (summary.totalStress / summary.stressDays).toFixed(1) : 'N/A',
                avgEnergy: summary.energyDays > 0 ? (summary.totalEnergy / summary.energyDays).toFixed(1) : 'N/A',
            },
            symptomFrequency
        };
    };

    useEffect(() => {
        const loadReportData = async () => {
            setLoading(true);
            try {
                const me = await User.me();
                setCurrentUser(me);

                if (!me || me.user_type !== 'client') {
                    setLoading(false);
                    return;
                }

                if (!dateRange?.from || !dateRange?.to) {
                    setLoading(false);
                    return;
                }

                const entries = await DailyDiary.filter({
                    client_id: me.id,
                    date: {
                        $gte: format(dateRange.from, 'yyyy-MM-dd'),
                        $lte: format(dateRange.to, 'yyyy-MM-dd'),
                    }
                }, '-date', 500);
                
                const processedData = processReportData(entries);
                setReportData(processedData);
            } catch (error) {
                console.error('Error generating report:', error);
            }
            setLoading(false);
        };

        loadReportData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
            </div>
        );
    }
    
    if (currentUser?.user_type !== 'client') {
        return (
          <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
              <CardContent><p>This page is for clients only.</p></CardContent>
            </Card>
          </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-stone-900">My Progress</h1>

                <Card>
                    <CardContent className="p-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-range"
                                    variant={"outline"}
                                    className="w-full md:w-[300px] justify-start text-left font-normal border-sage-200"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>
                
                {reportData ? (
                    <div className="space-y-6">
                        <SummaryMetrics metrics={reportData.summaryMetrics} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-600" />Energy Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TrendsChart data={reportData.trendData} dataKey="energy" color="#f59e0b" />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-red-600" />Stress Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TrendsChart data={reportData.trendData} dataKey="stress" color="#ef4444" />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Moon className="w-5 h-5 text-blue-600" />Sleep Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TrendsChart data={reportData.trendData} dataKey="sleep" color="#3b82f6" />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5 text-purple-600" />Symptom Frequency</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <SymptomFrequencyChart data={reportData.symptomFrequency} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                     <Card className="border-dashed border-sage-300">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-stone-900 mb-2">No Data Available</h3>
                            <p className="text-stone-600">No diary entries found for the selected date range. Try expanding your date range or add new entries.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}