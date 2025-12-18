'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import AnalyticsSidebar from '@/components/styler/AnalyticsSidebar';

export default function AnalyticsPage() {
    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="styler" />
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Closet Insights</h1>
                            <p className="mt-2 text-muted-foreground">
                                Analyze your wardrobe health and usage
                            </p>
                        </div>

                        {/* Analytics Content */}
                        <div className="bg-card border border-border rounded-lg shadow-sm">
                            <AnalyticsSidebar variant="full" />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
