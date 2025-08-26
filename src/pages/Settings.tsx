import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const initialApiKeys: { id: string; name: string; key: string; createdAt: string }[] = [];

export function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [apiKeys, setApiKeys] = useState(initialApiKeys);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and workspace settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" alt={name || 'User'} />
                <AvatarFallback>{(name || 'U').slice(0,2)}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Upload Avatar</Button>
            </div>
            <div>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage access keys for integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeys.length === 0 && (
              <p className="text-sm text-muted-foreground">No API keys yet.</p>
            )}
            <Button variant="outline">Generate New Key</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}