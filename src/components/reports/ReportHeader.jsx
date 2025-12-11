import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, BarChart } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

export default function ReportHeader({ clients, onGenerateReport, isGenerating }) {
    const [clientId, setClientId] = useState('');
    const [date, setDate] = useState({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const handleGenerate = () => {
        onGenerateReport({ clientId, dateRange: date });
    };

    return (
        <Card className="border-sage-200 shadow-sm">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="client-select">Client</Label>
                        <Select value={clientId} onValueChange={setClientId}>
                            <SelectTrigger id="client-select" className="border-sage-200">
                                <SelectValue placeholder="Select a client..." />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.full_name || c.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date-range">Date Range</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-range"
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal border-sage-200"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={handleGenerate} disabled={isGenerating || !clientId}>
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <BarChart className="w-4 h-4 mr-2" />
                                Generate Report
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}