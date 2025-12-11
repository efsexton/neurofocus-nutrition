import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Brain, Activity } from 'lucide-react';

export default function SummaryMetrics({ metrics }) {
    const summaryItems = [
        { title: 'Avg Sleep', value: metrics.avgSleep, unit: 'hrs', icon: Moon, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Avg Stress', value: metrics.avgStress, unit: '/10', icon: Brain, color: 'text-red-600', bg: 'bg-red-100' },
        { title: 'Avg Energy', value: metrics.avgEnergy, unit: '/10', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {summaryItems.map((item, index) => (
                <Card key={index} className="border-sage-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                         <div>
                            <p className="text-stone-600 text-sm">{item.title}</p>
                            <p className="text-2xl font-bold text-stone-900">
                                {item.value} <span className="text-lg font-normal text-stone-500">{item.unit}</span>
                            </p>
                        </div>
                        <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}