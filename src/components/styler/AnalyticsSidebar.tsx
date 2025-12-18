"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Shirt } from "lucide-react";

const COLOR_MAP: Record<string, string> = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    black: "#000000",
    white: "#ffffff",
    gray: "#6b7280",
    brown: "#78350f",
    pink: "#ec4899",
    purple: "#a855f7",
    orange: "#f97316",
    beige: "#d6d3d1",
    navy: "#1e3a8a",
    maroon: "#7f1d1d",
    teal: "#14b8a6",
    coral: "#ff7f50",
    multi: "url(#multiGradient)", // We'll need a defs for this or just a placeholder
    gold: "#ffd700",
    silver: "#c0c0c0"
};

// Fallback color for unknown colors
const DEFAULT_COLOR = "#cbd5e1";

interface AnalyticsSidebarProps {
    variant?: 'sidebar' | 'full';
}

export default function AnalyticsSidebar({ variant = 'sidebar' }: AnalyticsSidebarProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const token = Cookies.get("token");
                const res = await axios.get("http://localhost:5000/api/analytics/health", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
    }, []);

    if (loading) return <div className="p-4 text-center text-muted-foreground">Loading Analytics...</div>;
    if (!data) return null;

    const { stats } = data;

    const isFull = variant === 'full';

    const usageData = [
        { name: 'Worn', value: stats.worn },
        { name: 'Unused', value: stats.unused }
    ];
    const USAGE_COLORS = ["#22c55e", "#ef4444"]; // Green for worn, Red for unused

    return (
        <div className={`w-full h-full overflow-y-auto ${isFull ? 'p-0' : 'p-6'} bg-background`}>
            {!isFull && <h2 className="text-xl font-bold mb-4">Closet Insights</h2>}

            <div className="space-y-6">

                {/* Row 2: Usage & Suggestions (Grid for Full) */}
                <div className="space-y-6">
                    {/* Usage Analysis */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Wardrobe Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={usageData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isFull ? 50 : 35}
                                        outerRadius={isFull ? 70 : 55}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {usageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={USAGE_COLORS[index % USAGE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-2">
                                {usageData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center text-xs text-muted-foreground">
                                        <div
                                            className="w-3 h-3 rounded-full mr-1"
                                            style={{ backgroundColor: USAGE_COLORS[index % USAGE_COLORS.length] }}
                                        />
                                        <span>{entry.name}: {entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
                {/* Row 3: Color & Category (Grid for Full) */}
                <div className="space-y-6">
                    {/* Color Analysis */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Color Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className={isFull ? "h-[250px]" : "h-[180px]"}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <linearGradient id="multiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ff0000" />
                                            <stop offset="20%" stopColor="#ffff00" />
                                            <stop offset="40%" stopColor="#00ff00" />
                                            <stop offset="60%" stopColor="#00ffff" />
                                            <stop offset="80%" stopColor="#0000ff" />
                                            <stop offset="100%" stopColor="#ff00ff" />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={stats.colors}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isFull ? 60 : 35}
                                        outerRadius={isFull ? 80 : 60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.colors.map((entry: any, index: number) => {
                                            const colorKey = entry.name.toLowerCase();
                                            const fill = COLOR_MAP[colorKey] || DEFAULT_COLOR;
                                            return <Cell key={`cell-${index}`} fill={fill} stroke={colorKey === 'white' ? '#e2e8f0' : 'none'} />;
                                        })}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 justify-center mt-2">
                                {stats.colors.slice(0, isFull ? 8 : 4).map((entry: any, index: number) => {
                                    const colorKey = entry.name.toLowerCase();
                                    const bg = COLOR_MAP[colorKey] || DEFAULT_COLOR;
                                    return (
                                        <div key={entry.name} className="flex items-center text-xs text-muted-foreground">
                                            <div
                                                className={`w-3 h-3 rounded-full mr-1 ${colorKey === 'multi' ? '' : ''}`}
                                                style={{ background: bg, border: colorKey === 'white' ? '1px solid #e2e8f0' : 'none' }}
                                            />
                                            <span className="capitalize">{entry.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Analysis */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Category Balance</CardTitle>
                        </CardHeader>
                        <CardContent className={isFull ? "h-[250px]" : "h-[180px]"}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.categories.slice(0, isFull ? 8 : 5)} layout="vertical" margin={{ left: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={80}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#b45309" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
