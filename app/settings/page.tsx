"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Settings,
  Target,
  Bell,
  User,
  Hash,
  Users,
  Plus,
  X,
  Save,
  Trash2,
  Clock,
  Zap,
  Brain,
  Volume2,
  Mail,
  Smartphone,
  Check,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TargetAccount {
  id: string
  username: string
  displayName: string
  followers: number
  isActive: boolean
}

interface Keyword {
  id: string
  value: string
  isActive: boolean
}

interface NotificationSettings {
  emailAlerts: boolean
  pushAlerts: boolean
  soundEnabled: boolean
  alertFrequency: "realtime" | "hourly" | "daily"
  minScoreThreshold: number
  quietHoursStart: number
  quietHoursEnd: number
}

interface AISettings {
  defaultTone: "professional" | "casual" | "witty"
  autoSuggest: boolean
  learnFromWins: boolean
  voiceProfileEnabled: boolean
}

export default function SettingsPage() {
  // Target Accounts State
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([
    { id: "1", username: "elonmusk", displayName: "Elon Musk", followers: 150000000, isActive: true },
    { id: "2", username: "naval", displayName: "Naval", followers: 2100000, isActive: true },
    { id: "3", username: "paulg", displayName: "Paul Graham", followers: 1800000, isActive: false },
  ])
  const [newAccountUsername, setNewAccountUsername] = useState("")

  // Keywords State
  const [keywords, setKeywords] = useState<Keyword[]>([
    { id: "1", value: "startup", isActive: true },
    { id: "2", value: "AI", isActive: true },
    { id: "3", value: "growth", isActive: true },
    { id: "4", value: "product", isActive: false },
  ])
  const [newKeyword, setNewKeyword] = useState("")

  // Notification Settings State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    pushAlerts: true,
    soundEnabled: false,
    alertFrequency: "realtime",
    minScoreThreshold: 75,
    quietHoursStart: 22,
    quietHoursEnd: 8,
  })

  // AI Settings State
  const [aiSettings, setAISettings] = useState<AISettings>({
    defaultTone: "professional",
    autoSuggest: true,
    learnFromWins: true,
    voiceProfileEnabled: false,
  })

  // Saving state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Handlers
  const addTargetAccount = () => {
    if (!newAccountUsername.trim()) return
    const newAccount: TargetAccount = {
      id: Date.now().toString(),
      username: newAccountUsername.replace("@", ""),
      displayName: newAccountUsername.replace("@", ""),
      followers: 0,
      isActive: true,
    }
    setTargetAccounts([...targetAccounts, newAccount])
    setNewAccountUsername("")
  }

  const removeTargetAccount = (id: string) => {
    setTargetAccounts(targetAccounts.filter(a => a.id !== id))
  }

  const toggleTargetAccount = (id: string) => {
    setTargetAccounts(targetAccounts.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ))
  }

  const addKeyword = () => {
    if (!newKeyword.trim()) return
    const keyword: Keyword = {
      id: Date.now().toString(),
      value: newKeyword.toLowerCase().trim(),
      isActive: true,
    }
    setKeywords([...keywords, keyword])
    setNewKeyword("")
  }

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id))
  }

  const toggleKeyword = (id: string) => {
    setKeywords(keywords.map(k => 
      k.id === id ? { ...k, isActive: !k.isActive } : k
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-foreground-muted">
              Configure your targets, alerts, and AI preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="targets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="targets" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Targets</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Target Accounts Tab */}
          <TabsContent value="targets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Target Accounts
                </CardTitle>
                <CardDescription>
                  Monitor tweets from these accounts for reply opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Account Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">@</span>
                    <Input
                      value={newAccountUsername}
                      onChange={(e) => setNewAccountUsername(e.target.value)}
                      placeholder="username"
                      className="pl-8"
                      onKeyDown={(e) => e.key === "Enter" && addTargetAccount()}
                    />
                  </div>
                  <Button onClick={addTargetAccount} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Account List */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {targetAccounts.map((account) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 transition-colors",
                          account.isActive
                            ? "border-surface-3 bg-surface-1"
                            : "border-surface-3/50 bg-surface-1/50 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold">
                            {account.displayName[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{account.displayName}</div>
                            <div className="text-sm text-foreground-muted">@{account.username}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Paused"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTargetAccount(account.id)}
                          >
                            {account.isActive ? "Pause" : "Enable"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTargetAccount(account.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {targetAccounts.length === 0 && (
                  <div className="rounded-lg border border-dashed border-surface-3 p-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-foreground-muted" />
                    <p className="mt-2 text-sm text-foreground-muted">
                      No target accounts yet. Add accounts to monitor.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-accent" />
                  Keywords & Topics
                </CardTitle>
                <CardDescription>
                  Track tweets containing these keywords for opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Keyword Input */}
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Enter keyword or phrase"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                  />
                  <Button onClick={addKeyword} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Keywords Grid */}
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {keywords.map((keyword) => (
                      <motion.div
                        key={keyword.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Badge
                          variant={keyword.isActive ? "default" : "secondary"}
                          className={cn(
                            "cursor-pointer gap-1 px-3 py-1.5 text-sm",
                            !keyword.isActive && "opacity-60"
                          )}
                          onClick={() => toggleKeyword(keyword.id)}
                        >
                          #{keyword.value}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeKeyword(keyword.id)
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {keywords.length === 0 && (
                  <div className="rounded-lg border border-dashed border-surface-3 p-8 text-center">
                    <Hash className="mx-auto h-8 w-8 text-foreground-muted" />
                    <p className="mt-2 text-sm text-foreground-muted">
                      No keywords yet. Add keywords to track.
                    </p>
                  </div>
                )}

                {/* Keyword Tips */}
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <h4 className="mb-2 text-sm font-medium text-foreground">Tips for effective keywords</h4>
                  <ul className="space-y-1 text-xs text-foreground-muted">
                    <li>• Use specific terms related to your expertise</li>
                    <li>• Include industry jargon your audience uses</li>
                    <li>• Add competitor brand names for strategic opportunities</li>
                    <li>• Mix broad and niche terms for balanced coverage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Alert Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive opportunity alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Channels */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Alert Channels</Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 transition-colors",
                        notifications.emailAlerts
                          ? "border-accent bg-accent/10"
                          : "border-surface-3 bg-surface-1"
                      )}
                    >
                      <Mail className={cn("h-5 w-5", notifications.emailAlerts ? "text-accent" : "text-foreground-muted")} />
                      <div className="text-left">
                        <div className="font-medium text-foreground">Email</div>
                        <div className="text-xs text-foreground-muted">Daily digest</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setNotifications({ ...notifications, pushAlerts: !notifications.pushAlerts })}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 transition-colors",
                        notifications.pushAlerts
                          ? "border-accent bg-accent/10"
                          : "border-surface-3 bg-surface-1"
                      )}
                    >
                      <Smartphone className={cn("h-5 w-5", notifications.pushAlerts ? "text-accent" : "text-foreground-muted")} />
                      <div className="text-left">
                        <div className="font-medium text-foreground">Push</div>
                        <div className="text-xs text-foreground-muted">Real-time</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setNotifications({ ...notifications, soundEnabled: !notifications.soundEnabled })}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 transition-colors",
                        notifications.soundEnabled
                          ? "border-accent bg-accent/10"
                          : "border-surface-3 bg-surface-1"
                      )}
                    >
                      <Volume2 className={cn("h-5 w-5", notifications.soundEnabled ? "text-accent" : "text-foreground-muted")} />
                      <div className="text-left">
                        <div className="font-medium text-foreground">Sound</div>
                        <div className="text-xs text-foreground-muted">In-app alerts</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Alert Frequency */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Alert Frequency</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["realtime", "hourly", "daily"] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setNotifications({ ...notifications, alertFrequency: freq })}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-colors",
                          notifications.alertFrequency === freq
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-surface-3 bg-surface-1 text-foreground-muted hover:text-foreground"
                        )}
                      >
                        <div className="font-medium capitalize">{freq}</div>
                        <div className="text-xs opacity-70">
                          {freq === "realtime" && "Instant alerts"}
                          {freq === "hourly" && "Batched hourly"}
                          {freq === "daily" && "Once per day"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Score Threshold */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Minimum Score Threshold</Label>
                    <span className="text-sm font-semibold text-accent">{notifications.minScoreThreshold}</span>
                  </div>
                  <Slider
                    value={[notifications.minScoreThreshold]}
                    onValueChange={([value]) => setNotifications({ ...notifications, minScoreThreshold: value })}
                    min={50}
                    max={95}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-foreground-muted">
                    Only receive alerts for opportunities scoring {notifications.minScoreThreshold} or higher
                  </p>
                </div>

                {/* Quiet Hours */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quiet Hours</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-foreground-muted" />
                      <select
                        value={notifications.quietHoursStart}
                        onChange={(e) => setNotifications({ ...notifications, quietHoursStart: parseInt(e.target.value) })}
                        className="rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-foreground"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-foreground-muted">to</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={notifications.quietHoursEnd}
                        onChange={(e) => setNotifications({ ...notifications, quietHoursEnd: parseInt(e.target.value) })}
                        className="rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-foreground"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-muted">
                    No push notifications during these hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  AI Preferences
                </CardTitle>
                <CardDescription>
                  Customize how AI assists with your replies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Tone */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Default Reply Tone</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["professional", "casual", "witty"] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setAISettings({ ...aiSettings, defaultTone: tone })}
                        className={cn(
                          "rounded-lg border p-4 text-center transition-colors",
                          aiSettings.defaultTone === tone
                            ? "border-accent bg-accent/10"
                            : "border-surface-3 bg-surface-1"
                        )}
                      >
                        <div className={cn(
                          "font-medium capitalize",
                          aiSettings.defaultTone === tone ? "text-accent" : "text-foreground"
                        )}>
                          {tone}
                        </div>
                        <div className="mt-1 text-xs text-foreground-muted">
                          {tone === "professional" && "Thought leader style"}
                          {tone === "casual" && "Friendly & approachable"}
                          {tone === "witty" && "Clever & memorable"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Features */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">AI Features</Label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setAISettings({ ...aiSettings, autoSuggest: !aiSettings.autoSuggest })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 transition-colors",
                        aiSettings.autoSuggest
                          ? "border-accent bg-accent/10"
                          : "border-surface-3 bg-surface-1"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Zap className={cn("h-5 w-5", aiSettings.autoSuggest ? "text-accent" : "text-foreground-muted")} />
                        <div className="text-left">
                          <div className="font-medium text-foreground">Auto-suggest replies</div>
                          <div className="text-xs text-foreground-muted">
                            Automatically generate reply suggestions when viewing opportunities
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "h-6 w-11 rounded-full transition-colors",
                        aiSettings.autoSuggest ? "bg-accent" : "bg-surface-3"
                      )}>
                        <div className={cn(
                          "h-5 w-5 rounded-full bg-white transition-transform mt-0.5",
                          aiSettings.autoSuggest ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>

                    <button
                      onClick={() => setAISettings({ ...aiSettings, learnFromWins: !aiSettings.learnFromWins })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 transition-colors",
                        aiSettings.learnFromWins
                          ? "border-accent bg-accent/10"
                          : "border-surface-3 bg-surface-1"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Brain className={cn("h-5 w-5", aiSettings.learnFromWins ? "text-accent" : "text-foreground-muted")} />
                        <div className="text-left">
                          <div className="font-medium text-foreground">Learn from your wins</div>
                          <div className="text-xs text-foreground-muted">
                            Improve suggestions based on your successful replies
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "h-6 w-11 rounded-full transition-colors",
                        aiSettings.learnFromWins ? "bg-accent" : "bg-surface-3"
                      )}>
                        <div className={cn(
                          "h-5 w-5 rounded-full bg-white transition-transform mt-0.5",
                          aiSettings.learnFromWins ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>

                    <button
                      onClick={() => setAISettings({ ...aiSettings, voiceProfileEnabled: !aiSettings.voiceProfileEnabled })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 transition-colors",
                        aiSettings.voiceProfileEnabled
                          ? "border-accent bg-accent/10"
                          : "border-surface-3 bg-surface-1"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <User className={cn("h-5 w-5", aiSettings.voiceProfileEnabled ? "text-accent" : "text-foreground-muted")} />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Voice profile</span>
                            <Badge variant="secondary" className="text-xs">Beta</Badge>
                          </div>
                          <div className="text-xs text-foreground-muted">
                            Match AI suggestions to your unique writing style
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "h-6 w-11 rounded-full transition-colors",
                        aiSettings.voiceProfileEnabled ? "bg-accent" : "bg-surface-3"
                      )}>
                        <div className={cn(
                          "h-5 w-5 rounded-full bg-white transition-transform mt-0.5",
                          aiSettings.voiceProfileEnabled ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Voice Profile Setup (if enabled) */}
                {aiSettings.voiceProfileEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-lg border border-accent/20 bg-accent/5 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Set up your voice profile</h4>
                        <p className="mt-1 text-sm text-foreground-muted">
                          We'll analyze your recent tweets to understand your writing style. This helps generate replies that sound authentically like you.
                        </p>
                        <Button size="sm" className="mt-3 gap-2">
                          <Zap className="h-4 w-4" />
                          Analyze My Tweets
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
