import { useState } from 'react'
import { Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuth } from './use-auth'
import { UserRole, ROLE_CONFIG } from '@/types'

// Demo users for quick login
const demoUsers = [
  { email: 'alex@example.com', name: 'Alex Admin', role: UserRole.Admin },
  { email: 'taylor@example.com', name: 'Taylor Transcriber', role: UserRole.Transcriber },
  { email: 'jordan@example.com', name: 'Jordan Jones', role: UserRole.Transcriber },
  { email: 'riley@example.com', name: 'Riley Reviewer', role: UserRole.Reviewer },
  { email: 'morgan@example.com', name: 'Morgan Manager', role: UserRole.FinalReviewer },
]

export function LoginForm() {
  const [selectedEmail, setSelectedEmail] = useState<string>('')
  const { login, isLoading } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEmail) {
      login(selectedEmail)
    }
  }

  const selectedUser = demoUsers.find((u) => u.email === selectedEmail)

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Select a demo user to explore the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger id="user" className="w-full">
                <SelectValue placeholder="Choose a demo user..." />
              </SelectTrigger>
              <SelectContent>
                {demoUsers.map((user) => (
                  <SelectItem key={user.email} value={user.email}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({ROLE_CONFIG[user.role].label})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="rounded-lg border border-border bg-muted/50 p-3 animate-fade-in">
              <p className="text-sm font-medium">{selectedUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_CONFIG[selectedUser.role].description}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedEmail || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Quick Access
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoUsers.slice(0, 4).map((user) => (
              <Button
                key={user.email}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEmail(user.email)
                  login(user.email)
                }}
                disabled={isLoading}
                className="text-xs"
              >
                {user.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

