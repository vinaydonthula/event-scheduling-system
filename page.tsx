"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUserStore } from '@/lib/store/user-store'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole } from '@/lib/types'
import { GraduationCap } from 'lucide-react'

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['student', 'alumni']),
  department: z.string().optional(),
  batch: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const { updateProfile, error } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  
  // Redirect if not logged in or already has profile
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else if (profile) {
      router.push('/feed')
    }
  }, [user, profile, router])
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      role: 'student',
      department: '',
      batch: '',
      company: '',
      jobTitle: '',
      bio: '',
    },
  })
  
  // Show alumni fields based on role
  const watchRole = form.watch('role')
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // Prepare profile data
      const profileData = {
        uid: user.uid,
        email: user.email || '',
        displayName: data.displayName,
        photoURL: user.photoURL || '',
        role: data.role as UserRole,
        department: data.department,
        batch: data.batch,
        company: data.company,
        jobTitle: data.jobTitle,
        bio: data.bio,
        isVerified: data.role === 'student', // Auto-verify students
        createdAt: Date.now(),
        updatedAt: Date.now(),
        visibilitySettings: {
          email: true,
          phone: false,
          socialLinks: true,
          professionalDetails: true,
        }
      }
      
      await updateProfile(user.uid, profileData)
      
      if (data.role === 'alumni') {
        router.push('/auth/pending-verification')
      } else {
        router.push('/feed')
      }
    } catch (error) {
      console.error('Profile completion failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!user) {
    return null
  }
  
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-2">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Please provide some additional information to complete your profile
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Alumni accounts require verification by admin
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department/Major</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch/Graduation Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchRole === 'alumni' && (
                <>
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Google" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us a bit about yourself" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Completing Profile..." : "Complete Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}