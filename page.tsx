"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUserStore } from '@/lib/store/user-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { CheckCircle, XCircle, Loader2, Users, BookOpen, Calendar, Briefcase, AlertTriangle } from 'lucide-react'
import { UserProfile } from '@/lib/types'

// Mock data for analytics - would be replaced with real data from Firebase
const userStats = [
  { name: 'Jan', students: 40, alumni: 25 },
  { name: 'Feb', students: 45, alumni: 30 },
  { name: 'Mar', students: 55, alumni: 35 },
  { name: 'Apr', students: 60, alumni: 40 },
  { name: 'May', students: 75, alumni: 45 },
  { name: 'Jun', students: 85, alumni: 55 },
];

const userDistribution = [
  { name: 'Students', value: 320 },
  { name: 'Alumni', value: 180 },
  { name: 'Admins', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function AdminPage() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const { users, loading, error, fetchUsers, verifyAlumni } = useUserStore()
  
  const [pendingAlumni, setPendingAlumni] = useState<UserProfile[]>([])
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({})
  
  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else if (profile && profile.role !== 'admin') {
      router.push('/')
    }
  }, [user, profile, router])
  
  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  
  // Filter pending alumni verification requests
  useEffect(() => {
    const pending = users.filter(user => 
      user.role === 'alumni' && !user.isVerified
    )
    setPendingAlumni(pending)
  }, [users])
  
  // Handle alumni verification
  const handleVerifyAlumni = async (userId: string) => {
    setIsVerifying({ ...isVerifying, [userId]: true })
    
    try {
      await verifyAlumni(userId)
      // Remove from pending list
      setPendingAlumni(pendingAlumni.filter(user => user.uid !== userId))
    } catch (error) {
      console.error('Error verifying alumni:', error)
    } finally {
      setIsVerifying({ ...isVerifying, [userId]: false })
    }
  }
  
  if (!user || (profile && profile.role !== 'admin')) {
    return null
  }
  
  return (
    <div className="container max-w-6xl mx-auto pb-16">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">
            Verification Requests
            {pendingAlumni.length > 0 && (
              <Badge variant="destructive\" className="ml-2">
                {pendingAlumni.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="text-3xl">{users.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Active community members</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Verifications</CardDescription>
                <CardTitle className="text-3xl">{pendingAlumni.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Alumni waiting for approval</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resources Shared</CardDescription>
                <CardTitle className="text-3xl">24</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>Articles and guides posted</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Job Listings</CardDescription>
                <CardTitle className="text-3xl">12</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>Active opportunities</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  Monthly new registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userStats}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="hsl(var(--chart-1))" name="Students" />
                      <Bar dataKey="alumni" fill="hsl(var(--chart-2))" name="Alumni" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>
                  Breakdown by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Alumni Verification Requests</CardTitle>
              <CardDescription>
                Review and approve alumni accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingAlumni.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-muted-foreground mb-2">No pending verification requests</p>
                  <p className="text-sm text-muted-foreground">
                    All alumni accounts have been verified
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {pendingAlumni.map((alumnus) => (
                      <Card key={alumnus.uid}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={alumnus.photoURL} alt={alumnus.displayName} />
                                <AvatarFallback>{alumnus.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">{alumnus.displayName}</CardTitle>
                                <CardDescription>
                                  {alumnus.email}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                              Pending
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <span className="text-sm font-medium">Department/Major:</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {alumnus.department || 'Not provided'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Batch/Graduation Year:</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {alumnus.batch || 'Not provided'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Company:</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {alumnus.company || 'Not provided'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Job Title:</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {alumnus.jobTitle || 'Not provided'}
                              </span>
                            </div>
                          </div>
                          
                          {alumnus.bio && (
                            <div className="mt-4">
                              <span className="text-sm font-medium">Bio:</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {alumnus.bio}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                          <Button variant="outline">Reject</Button>
                          <Button
                            onClick={() => handleVerifyAlumni(alumnus.uid)}
                            disabled={isVerifying[alumnus.uid]}
                          >
                            {isVerifying[alumnus.uid] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-2">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Joined</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.uid} className="hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.displayName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                : user.role === 'alumni'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.role === 'alumni' && (
                              <Badge variant={user.isVerified ? "outline" : "destructive"}>
                                {user.isVerified ? 'Verified' : 'Pending'}
                              </Badge>
                            )}
                            {user.role !== 'alumni' && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/profile/${user.uid}`}>View</a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}