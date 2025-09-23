import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, LogOut, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useGmailAuth } from '@/hooks/useGmailAuth';
import { toast } from '@/hooks/use-toast';

export const EmailSignIn = () => {
  const { connectGmail, disconnectGmail, isConnecting, connectedAccounts } = useGmailAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGmailConnect = async () => {
    const result = await connectGmail();
    
    if (result.success) {
      toast({
        title: "Gmail Connected! 🎉",
        description: `Successfully connected ${result.email}`,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Connection Failed",
        description: result.error || "Failed to connect Gmail",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (email: string) => {
    const result = await disconnectGmail(email);
    
    if (result.success) {
      toast({
        title: "Account Disconnected",
        description: `Removed ${email}`,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Connected Accounts */}
      {connectedAccounts.map(email => (
        <Badge key={email} variant="secondary" className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          {email}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleDisconnect(email)}
          >
            <LogOut className="w-2 h-2" />
          </Button>
        </Badge>
      ))}

      {/* Connect Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Mail className="w-3 h-3 mr-1" />
            Connect Email
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Email Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your email account to automatically sync load-related emails and enable AI assistance.
            </p>
            
            <Button
              onClick={handleGmailConnect}
              disabled={isConnecting}
              className="w-full justify-start"
              variant="outline"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-3 bg-red-500 rounded flex items-center justify-center">
                  <Mail className="w-3 h-3 text-white" />
                </div>
              )}
              {isConnecting ? 'Connecting to Gmail...' : 'Connect Gmail'}
            </Button>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Secure OAuth Connection</p>
                <p>We use secure OAuth 2.0. We never store your password.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
