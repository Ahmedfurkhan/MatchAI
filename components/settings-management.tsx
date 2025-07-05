"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  User,
  Key,
  Smartphone,
  Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

interface SettingsData {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    matchAlerts: boolean
    meetingReminders: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: "public" | "private" | "connections"
    showOnlineStatus: boolean
    allowMessages: boolean
    shareAnalytics: boolean
  }
  appearance: {
    theme: "light" | "dark" | "auto"
    compactMode: boolean
    showAvatars: boolean
    animations: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    loginNotifications: boolean
    passwordExpiry: number
  }
}

const defaultSettings: SettingsData = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    matchAlerts: true,
    meetingReminders: true,
    weeklyDigest: false,
  },
  privacy: {
    profileVisibility: "connections",
    showOnlineStatus: true,
    allowMessages: true,
    shareAnalytics: true,
  },
  appearance: {
    theme: "auto",
    compactMode: false,
    showAvatars: true,
    animations: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    passwordExpiry: 90,
  },
}

export function SettingsManagement() {
  const { user } = useUser()
  const { toast } = useToast()
  const { setTheme } = useTheme()
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (!error && data) {
          setSettings({ ...defaultSettings, ...data.settings })
        } else {
          // Try to load from localStorage as fallback
          const savedSettings = localStorage.getItem('userSettings')
          if (savedSettings) {
            setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
          }
        }
      } else {
        // Try to load from localStorage as fallback
        const savedSettings = localStorage.getItem('userSettings')
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
        }
      }
    } catch (error) {
      console.warn("Failed to load settings, using defaults:", error)
      // Try to load from localStorage as final fallback
      try {
        const savedSettings = localStorage.getItem('userSettings')
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
        }
      } catch (localStorageError) {
        console.warn("Failed to load settings from localStorage:", localStorageError)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      if (isSupabaseConfigured && supabase && user) {
        // Try to save to database, but don't fail if table doesn't exist
        const { error } = await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            settings: settings,
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.warn("Failed to save settings to database:", error)
          // Show warning toast but continue with localStorage
          toast({
            title: "Warning",
            description: "Settings saved locally (database unavailable)",
            variant: "destructive",
          })
        } else {
          // Show success toast
          toast({
            title: "Success",
            description: "Settings saved successfully!",
          })
        }
      } else {
        // Show info toast for local-only save
        toast({
          title: "Info",
          description: "Settings saved locally",
        })
      }
      
      // Always save to localStorage as fallback
      localStorage.setItem('userSettings', JSON.stringify(settings))
      
    } catch (error) {
      console.error("Error saving settings:", error)
      // Save to localStorage as fallback even if database fails
      localStorage.setItem('userSettings', JSON.stringify(settings))
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
    
    // Apply theme changes immediately
    if (category === "appearance" && key === "theme") {
      setTheme(value)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSetting("notifications", "email", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateSetting("notifications", "push", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => updateSetting("notifications", "sms", checked)}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Match Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new matches are found</p>
                  </div>
                  <Switch
                    checked={settings.notifications.matchAlerts}
                    onCheckedChange={(checked) => updateSetting("notifications", "matchAlerts", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Meeting Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming meetings</p>
                  </div>
                  <Switch
                    checked={settings.notifications.meetingReminders}
                    onCheckedChange={(checked) => updateSetting("notifications", "meetingReminders", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of activity</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => updateSetting("notifications", "weeklyDigest", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground mb-2">Control who can see your profile</p>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => updateSetting("privacy", "profileVisibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Everyone can see your profile</SelectItem>
                      <SelectItem value="connections">Connections - Only your connections can see</SelectItem>
                      <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => updateSetting("privacy", "showOnlineStatus", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Allow others to send you messages</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowMessages}
                    onCheckedChange={(checked) => updateSetting("privacy", "allowMessages", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Share Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve the platform by sharing usage data</p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareAnalytics}
                    onCheckedChange={(checked) => updateSetting("privacy", "shareAnalytics", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-2">Choose your preferred theme</p>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateSetting("appearance", "theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (follow system)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting("appearance", "compactMode", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Avatars</Label>
                    <p className="text-sm text-muted-foreground">Display user avatars throughout the interface</p>
                  </div>
                  <Switch
                    checked={settings.appearance.showAvatars}
                    onCheckedChange={(checked) => updateSetting("appearance", "showAvatars", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) => updateSetting("appearance", "animations", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground mb-2">How long to keep you logged in</p>
                  <Select
                    value={settings.security.sessionTimeout.toString()}
                    onValueChange={(value) => updateSetting("security", "sessionTimeout", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={settings.security.loginNotifications}
                    onCheckedChange={(checked) => updateSetting("security", "loginNotifications", checked)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Password Expiry</Label>
                  <p className="text-sm text-muted-foreground mb-2">How often to require password changes</p>
                  <Select
                    value={settings.security.passwordExpiry.toString()}
                    onValueChange={(value) => updateSetting("security", "passwordExpiry", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Change Password</Label>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Update Password</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Export Data</Label>
                  <p className="text-sm text-muted-foreground">Download a copy of your data</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-red-600">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">Delete Account</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 