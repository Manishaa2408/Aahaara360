"use client"

import { useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function FoodFilters() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // useDebouncedCallback is a hook to prevent sending too many requests while the user is typing.
    // It waits for the user to stop typing for 500ms before running.
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        // This updates the URL without causing a full page reload.
        replace(`${pathname}?${params.toString()}`)
    }, 500) 

    return (
        <Card className="border-border/50">
            <CardContent className="pt-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search foods by name..." 
                        className="pl-10"
                        // Set the default value from the URL's query parameter so it persists on reload.
                        defaultValue={searchParams.get('q')?.toString()}
                        onChange={(e) => {
                            handleSearch(e.target.value)
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

