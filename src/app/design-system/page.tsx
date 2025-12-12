import { CompactCardList } from "@/components/examples/CompactCardList"
import { CondensedForm } from "@/components/examples/CondensedForm"
import { AdminDashboardSidebar } from "@/components/layout/AdminDashboardSidebar"

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <AdminDashboardSidebar />
            <main className="flex-1 ml-[var(--sidebar-width-compact)] p-[var(--spacing-container-desktop)] space-y-8">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Design System Preview</h1>
                    <p className="text-muted-foreground">
                        Preview of the new compact UI components and theme.
                    </p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Compact Card List</h2>
                    <CompactCardList />
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Condensed Form</h2>
                    <CondensedForm />
                </section>
            </main>
        </div>
    )
}
