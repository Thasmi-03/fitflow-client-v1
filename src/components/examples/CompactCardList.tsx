import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpRight } from "lucide-react"

interface CompactCardProps {
    title: string
    value: string
    trend: string
    status: "active" | "pending" | "inactive"
}

const data: CompactCardProps[] = [
    { title: "Total Revenue", value: "$45,231.89", trend: "+20.1%", status: "active" },
    { title: "Subscriptions", value: "+2350", trend: "+180.1%", status: "active" },
    { title: "Active Now", value: "+573", trend: "+201", status: "pending" },
    { title: "Sales", value: "+12,234", trend: "+19%", status: "inactive" },
    { title: "Bounce Rate", value: "42.3%", trend: "-4%", status: "active" },
    { title: "Avg. Session", value: "4m 12s", trend: "+12%", status: "active" },
]

export function CompactCardList() {
    return (
        <div className="grid gap-[var(--spacing-card-gap)] grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item, index) => (
                <Card key={index} className="shadow-[var(--shadow-card)] border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-[var(--spacing-card-compact)]">
                        <CardTitle className="text-[var(--font-size-sm)] font-medium text-muted-foreground">
                            {item.title}
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-[var(--spacing-card-compact)] pt-0">
                        <div className="text-2xl font-bold tracking-tight text-foreground">{item.value}</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-[var(--font-size-xs)] text-muted-foreground">
                                <span className="text-success font-medium inline-flex items-center">
                                    {item.trend} <ArrowUpRight className="h-3 w-3 ml-0.5" />
                                </span>{" "}
                                from last month
                            </p>
                            <Badge
                                variant={item.status === 'active' ? 'default' : item.status === 'pending' ? 'secondary' : 'outline'}
                                className="h-5 px-1.5 text-[10px] uppercase tracking-wider"
                            >
                                {item.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
