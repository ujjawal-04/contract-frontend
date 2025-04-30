import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Avatar,
  AvatarFallback, 
  AvatarImage 
} from "../ui/avatar"; // Import all Avatar components from the same source
import Link from "next/link";
import { Icons } from "./icons";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/zustand";

function googlesignIn(): Promise<void> {
  return new Promise((resolve) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    resolve();
  });
}

export function UserButton() {
  const router = useRouter();
  const { user } = useCurrentUser();
  
  const handleLogout = async () => {
    await logout();
    window.location.reload();
    setInterval(() => router.push("/"), 1000);
  };
  
  const { openModal } = useModalStore();
  
  return (
    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.profilePicture || ""}
                  alt={`${user?.displayName || "User"}'s profile`}
                  className="object-cover"
                />
                <AvatarFallback>
                  {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover text-popover-foreground" align="end" sideOffset={5}>
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium line-clamp-1">
                {user?.displayName || "User"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {user?.email || ""}
              </p>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex w-full cursor-pointer items-center">
                <Icons.dashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex w-full cursor-pointer items-center">
                <Icons.settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center"
            >
              <Icons.logout className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="hidden md:inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-primary-foreground"
          onClick={() => openModal("connectAccountModal")}
        >
          Connect Google Account
        </Button>
      )}
    </div>
  );
}