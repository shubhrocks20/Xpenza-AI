import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { Loader2 } from "lucide-react"


const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one number")
    .regex(/[@$!%*?&]/, "Password must include at least one special character (@$!%*?&)") ,
  
  avatar: z.any().optional(), // Allow file upload

})

export type FormData = z.infer<typeof formSchema>

interface AccountUpdateFormProps {
    open: boolean
    setOpen: (open: boolean) => void
    defaultValues: Partial<FormData>
    onSubmit: (data: Partial<FormData>) => void
    updateUserMutation: any
    authProvider: any
  }
  

export function AccountUpdateForm({ open, setOpen, defaultValues, onSubmit, updateUserMutation, authProvider }: AccountUpdateFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(defaultValues.avatar || null)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null) 

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
      setSelectedAvatar(file)
    }
  }

  const onValidSubmit = (data: FormData) => {
    const changedFields: Partial<FormData> = {}

    Object.keys(data).forEach((key) => {
      if (data[key as keyof FormData] !== defaultValues[key as keyof FormData]) {
        changedFields[key as keyof FormData] = data[key as keyof FormData]
      }
    })

    if (selectedAvatar) {
      changedFields.avatar = selectedAvatar
    }

    if (Object.keys(changedFields).length > 0) {
      onSubmit(changedFields)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-50 max-w-md">
        <DialogHeader>
          <DialogTitle>Update Account Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {
              authProvider === 'GITHUB' &&  <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter a new email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            }
           
          
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter a new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            

            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleAvatarChange} />
              </FormControl>
              {avatarPreview && <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 mt-2 rounded-full" />}
            </FormItem>

            <Button type="submit" className="w-full">
              {updateUserMutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Changes' }
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
