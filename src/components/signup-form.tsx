
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, Upload, Check, Loader2, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useChainId, useSwitchChain } from 'wagmi';
import { baseChain, celoChain } from '@/lib/web3';
import { defaultProfile } from '@/lib/constants';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  avatar: z.string().min(1, { message: "Please upload an avatar." }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [formCompleted, setFormCompleted] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();
  
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [preferredChainId, setPreferredChainId] = useState<number>(Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || baseChain.id));

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      avatar: '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: 'destructive',
            title: 'Image too large',
            description: 'Please select an image smaller than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        form.setValue('avatar', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = () => {
    setFormCompleted(true);
    toast({
        title: 'Profile Details Saved!',
        description: 'Please connect your wallet to complete your account setup.',
    });
  };

  useEffect(() => {
    // This runs after the wallet is connected
    const tryComplete = async () => {
      if (formCompleted && isConnected && address) {
          const formData = form.getValues();
          // Ensure the user's wallet is on the preferred chain
          if (typeof preferredChainId === 'number' && chainId && chainId !== preferredChainId) {
            if (switchChain) {
              try {
                await switchChain(preferredChainId);
                toast({ title: 'Network switched', description: `Switched wallet to ${preferredChainId}` });
              } catch (e) {
                toast({ variant: 'destructive', title: 'Switch failed', description: 'Please switch your wallet network to proceed.' });
                return;
              }
            } else {
              toast({ variant: 'destructive', title: 'Unsupported', description: 'Please switch your wallet to the preferred network.' });
              return;
            }
          }

          const profileData = {
              ...defaultProfile,
              address: address,
              name: formData.username,
              avatar: formData.avatar,
              preferredChainId: preferredChainId,
          };
          localStorage.setItem(`userProfile-${address}`, JSON.stringify(profileData));
          localStorage.setItem('userProfile', JSON.stringify(profileData));

          toast({
              title: 'Account Created!',
              description: `Welcome to the PlayVerse, ${formData.username}!`,
          });
          router.push('/games');
      }
    };
    tryComplete();
  }, [formCompleted, isConnected, address, form, router, preferredChainId, chainId, switchChain]);


   const handleConnect = () => {
        const connector = connectors.find(c => c.id === 'injected') || connectors[0];
        connect({ connector });
    };


  return (
    <Form {...form}>
        {!formCompleted ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col items-center space-y-4">
                    <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/50">
                                {avatarPreview ? (
                                    <Image
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    width={128}
                                    height={128}
                                    className="rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-16 w-16 text-muted-foreground" />
                                )}
                                </div>
                                <label
                                htmlFor="avatar-upload"
                                className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
                                >
                                <Upload className="h-5 w-5" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif"
                                    className="sr-only"
                                    onChange={handleAvatarChange}
                                />
                                </label>
                            </div>
                        </FormControl>
                        <FormMessage className='text-center' />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormItem>
                  <FormLabel>Preferred Network</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={preferredChainId === baseChain.id ? 'default' : 'ghost'} onClick={() => setPreferredChainId(baseChain.id)}>Base (ETH)</Button>
                      <Button variant={preferredChainId === celoChain.id ? 'default' : 'ghost'} onClick={() => setPreferredChainId(celoChain.id)}>Celo</Button>
                    </div>
                  </FormControl>
                </FormItem>
                
                <Button type="submit" className="w-full">
                    <Check className="mr-2 h-5 w-5" />
                    Save Profile & Continue
                </Button>
            </form>
        ) : (
            <div className="flex flex-col items-center gap-4 pt-8">
                 <p className="text-center text-muted-foreground">Connect your wallet to secure your account.</p>
                 <div className="flex flex-col sm:flex-row gap-3 w-full">
                   <Button
                      onClick={handleConnect}
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? (
                          <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Connecting...
                          </>
                      ) : (
                           <>
                              <Wallet className="mr-2"/>
                              Connect Wallet
                          </>
                      )}
                    </Button>
                 </div>
            </div>
        )}
    </Form>
  );
}
