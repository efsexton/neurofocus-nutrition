import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { DailyDiary } from '@/entities/DailyDiary';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileText, Activity, Moon, Brain } from 'lucide-react';
import ReportHeader from '../components/reports/ReportHeader';
import SummaryMetrics from '../components/reports/SummaryMetrics';
import TrendsChart from '../components/reports/TrendsChart';
import SymptomFrequencyChart from '../components/reports/SymptomFrequencyChart';

export default function Reports() {
    const [currentUser, setCurrentUser] = useState(null);
    const [clients, setClients] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const me = await User.me();
                setCurrentUser(me);
                if (me.role === 'admin' || me.user_type === 'coach') {
                    const clientList = await User.filter({ user_type: 'client' });
                    setClients(clientList);
                }
            } catch (e) {
                console.error("Error loading data", e);
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

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

    const handleGenerateReport = async ({ clientId, dateRange }) => {
        if (!clientId || !dateRange?.from || !dateRange?.to) {
            alert("Please select a client and a date range.");
            return;
        }
        setGenerating(true);
        setReportData(null);
        try {
            const entries = await DailyDiary.filter({
                client_id: clientId,
                // Assuming the backend can handle date range filters. If not, this needs adjustment.
                // For this example, we assume it works like this.
                date: {
                    $gte: format(dateRange.from, 'yyyy-MM-dd'),
                    $lte: format(dateRange.to, 'yyyy-MM-dd'),
                }
            }, '-date', 500); // limit to 500 entries for performance
            
            const processedData = processReportData(entries);
            setReportData(processedData);
        } catch (error) {
            console.error('Error generating report:', error);
            alert(`Failed to generate report: ${error.message}`);
        }
        setGenerating(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
            </div>
        );
    }
    
    if (currentUser?.role !== 'admin' && currentUser?.user_type !== 'coach') {
        return (
          <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
              <CardContent><p>You do not have permission to view this page.</p></CardContent>
            </Card>
          </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-stone-900">Client Reports</h1>
                
                <ReportHeader 
                    clients={clients} 
                    onGenerateReport={handleGenerateReport}
                    isGenerating={generating}
                />

                {generating && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sage-600" />
                        <p className="ml-4 text-stone-600">Generating report...</p>
                    </div>
                )}
                
                {reportData && (
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
                )}

                {!reportData && !generating && (
                     <Card className="border-dashed border-sage-300">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-stone-900 mb-2">Generate a Report</h3>
                            <p className="text-stone-600">Select a client and date range to view their progress summary.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}