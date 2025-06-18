import { Menu } from "lucide-react"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import NavigationSidebar from "./navigation/navigation-sidebar"
import ServerSidebar from "./server/server-sidebar"


export const MobileToggle = ({
    serverId
}: {
    serverId: string
}) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex">
                <SheetClose className="hidden" />
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-full">
                    <div className="w-[72px] flex-shrink-0">
                        <NavigationSidebar />
                    </div>
                    <div className="flex-1">
                        <ServerSidebar serverId={serverId} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}