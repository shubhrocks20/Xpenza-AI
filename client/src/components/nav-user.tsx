import { useState } from "react"
import {

  ChevronsUpDown,
  
  LogOut,
  
  User
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Cookies from "js-cookie"
import { AccountUpdateForm } from "./AccountUpdateForm"
import {  useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/http"
import { toast } from "sonner"

export function NavUser({
  user
}: {
  user: {
    username: string
    email: string
    avatar: string
    authProvider: string
  }
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient();
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    mutationKey: ['update-user'],
    onSuccess: (data) => {
      toast(data.success, {
        description: data.message,
   
      })
      queryClient.invalidateQueries({queryKey: ['me']})
      setOpen(false)
  
    },
    onError: (err) => {
      toast("Error occured", {
        description: err.message,
        
      })

    },
  })

  // Handle form submission
  const handleUpdate = (data: any) => {

    updateUserMutation.mutate(data)
    
    
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.username}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.username}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={(e) => { 
                  e.stopPropagation()
                  setOpen(true) 
                }}>
                  <User  />
                  Account Details
                </DropdownMenuItem>
             
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                Cookies.remove("access_token")
                window.location.reload()
              }}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Account Update Form */}
      <AccountUpdateForm 
        open={open} 
        setOpen={setOpen} 
        updateUserMutation={updateUserMutation}
        defaultValues={{ 
          username: user.username, 
          email: user.email,
          password: "", 
          avatar: user.avatar 
        }} 
        authProvider={user.authProvider}
        onSubmit={handleUpdate} 
      />
    </>
  )
}
