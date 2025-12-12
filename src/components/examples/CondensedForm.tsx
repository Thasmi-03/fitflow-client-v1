"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email.",
    }),
    role: z.string({
        required_error: "Please select a role.",
    }),
    bio: z.string().max(160).min(4),
    website: z.string().url().optional(),
})

export function CondensedForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            bio: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-[var(--shadow-card)]">
            <CardHeader className="p-[var(--spacing-card-expanded)] pb-2 border-b border-border/50">
                <CardTitle className="text-lg">Edit Profile</CardTitle>
                <CardDescription className="text-[var(--font-size-sm)]">
                    Make changes to your profile here. Click save when you're done.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-[var(--spacing-card-expanded)]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[var(--font-size-xs)] uppercase tracking-wide text-muted-foreground font-semibold">Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="shadcn" {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[var(--font-size-xs)] uppercase tracking-wide text-muted-foreground font-semibold">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[var(--font-size-xs)] uppercase tracking-wide text-muted-foreground font-semibold">Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="partner">Partner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[var(--font-size-xs)] uppercase tracking-wide text-muted-foreground font-semibold">Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[var(--font-size-xs)] uppercase tracking-wide text-muted-foreground font-semibold">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us a little bit about yourself"
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[10px]">
                                        You can <span>@mention</span> other users and organizations.
                                    </FormDescription>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end pt-2">
                            <Button type="submit" size="sm" className="h-8 px-4 text-xs font-medium">Save changes</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
