import { Loader2, LogIn, FileText, CheckCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from './use-auth'

const features = [
  {
    icon: FileText,
    title: 'Text Transcription',
    description: 'Correct and refine noisy text transcriptions',
  },
  {
    icon: CheckCircle,
    title: 'Quality Review',
    description: 'Multi-stage review process for accuracy',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with role-based access',
  },
]

export function LoginForm() {
  const { login, isLoading } = useAuth()

  const handleLogin = () => {
    login()
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Branding Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Image Text Aligner
          </h1>
        </div>
        <p className="text-muted-foreground">
          Streamline your text transcription workflow
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleLogin}
            className="w-full h-11 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in with Auth0
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Features
              </span>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
              >
                <feature.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Secure authentication powered by Auth0
      </p>
    </div>
  )
}
