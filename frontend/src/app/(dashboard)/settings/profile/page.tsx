'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Calendar,
  Activity,
  Fuel,
  Mail,
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const [copied, setCopied] = useState(false);
  
  // Mock data - would come from wallet connection
  const isConnected = true;
  const address = '0x1234567890abcdef1234567890abcdef12345678';
  const walletType = 'MetaMask';
  const connectedDate = new Date('2025-12-01');
  const totalPaymasters = 4;
  const totalTransactions = 12847;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and connected wallet.
        </p>
      </div>

      {/* Connected Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" />
            Connected Wallet
          </CardTitle>
          <CardDescription>
            Your wallet is used to sign transactions and authenticate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  Connected via {walletType}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <code className="text-sm font-mono flex-1 break-all">
                  {address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="shrink-0"
                >
                  <a
                    href={`https://sepolia.mantlescan.xyz/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Wallet?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out and will need to reconnect your wallet
                      to access the dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Disconnect</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to get started.
              </p>
              <Button>Connect Wallet</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>
            Overview of your account activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">First Connected</p>
                <p className="text-sm font-medium">
                  {connectedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paymasters</p>
                <p className="text-sm font-medium">{totalPaymasters}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions Sponsored</p>
                <p className="text-sm font-medium">{totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>
            Manage your current session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Session</p>
              <p className="text-xs text-muted-foreground">
                Active since {new Date().toLocaleDateString()}
              </p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
          <Button variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <p className="text-xs text-muted-foreground">
            Signing out clears your session but you can reconnect anytime.
          </p>
        </CardContent>
      </Card>

      {/* Linked Accounts (Future Feature) */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Linked Accounts</CardTitle>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
          <CardDescription>
            Link an email address for recovery and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-xs text-muted-foreground">
                Password recovery, notifications, and alerts
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
