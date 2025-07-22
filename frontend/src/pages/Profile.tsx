import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const [email, setEmail] = useState('user@example.com');
  const [name, setName] = useState('John Doe');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const handleSignOut = () => {
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    toast({
      title: darkMode ? "Light mode enabled" : "Dark mode enabled",
      description: `Switched to ${darkMode ? 'light' : 'dark'} theme.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-center">Profile</h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Information */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="w-5 h-5 mr-2 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>
            
            <Button onClick={handleSaveProfile} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive goal reminders</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <Button 
              onClick={handleSignOut}
              variant="destructive" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>HealthTrack v1.0.0</p>
          <p>Made with ❤️ for your wellness journey</p>
        </div>
      </div>
    </div>
  );
}