import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/OptimizedImage';
import medSafeLogo from "@/assets/medsafe-logo.jpg";

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email too long" }),
  password: z.string().min(1, { message: "Password is required" })
});

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email too long" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain a number" }),
  fullName: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name too long" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" })
});

const phoneSchema = z.object({
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Use international format (e.g., +1234567890)" })
});


const Auth = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '' });

  // Check if user arrived via password reset link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordReset(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!auth.loading && auth.user && !isPasswordReset) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.user, auth.loading, navigate, isPasswordReset]);

  const { signIn, signUp } = auth;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signInSchema.safeParse(signInData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    setSubmitLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    setSubmitLoading(false);
    if (!error) navigate('/dashboard');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signUpSchema.safeParse(signUpData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    setSubmitLoading(true);
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    setSubmitLoading(false);
    if (!error) {
      setSignUpData({ email: '', password: '', fullName: '' });
      // Store flag for demo
      localStorage.setItem('showDemo', 'true');
      navigate('/dashboard');
    }
  };


  const handleGoogleSignIn = async () => {
    setSubmitLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setSubmitLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!signInData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    const emailValidation = signInSchema.pick({ email: true }).safeParse({ email: signInData.email });
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(signInData.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setSubmitLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a password reset link",
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = signUpSchema.pick({ password: true }).safeParse({ password: newPassword });
    if (!passwordValidation.success) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated",
      });
      setIsPasswordReset(false);
      setNewPassword('');
      navigate('/dashboard');
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = phoneSchema.safeParse({ phone: phoneNumber });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);

    if (!otpSent) {
      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      setSubmitLoading(false);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Check your phone for the verification code",
        });
      }
    } else {
      // Verify OTP
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      setSubmitLoading(false);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully signed in",
        });
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-background to-medical-green/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <OptimizedImage 
            src={medSafeLogo} 
            alt="MedSafe Logo" 
            className="w-24 h-24 mx-auto mb-4 object-contain"
            priority
          />
          <h1 className="text-3xl font-bold text-foreground">MedSafe</h1>
          <p className="text-muted-foreground mt-2">Drug Verification & Patient Safety System</p>
        </div>

        {isPasswordReset ? (
          <Card>
            <CardHeader>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={submitLoading}>
                  {submitLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Choose your preferred sign-in method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auth Method Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => {
                      setAuthMethod('email');
                      setOtpSent(false);
                      setPhoneNumber('');
                      setOtp('');
                    }}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => {
                      setAuthMethod('phone');
                      setSignInData({ email: '', password: '' });
                    }}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Button>
                </div>
                {authMethod === 'email' ? (
                  <>
                    {/* Google Sign In */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={submitLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm text-primary hover:underline"
                        onClick={handleForgotPassword}
                        disabled={submitLoading}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                      <Button type="submit" className="w-full" disabled={submitLoading}>
                        {submitLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </>
                ) : (
                  <form onSubmit={handlePhoneAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        disabled={otpSent}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use international format (e.g., +1234567890)
                      </p>
                    </div>
                    
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          maxLength={6}
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={submitLoading}>
                      {submitLoading ? 'Processing...' : otpSent ? 'Verify Code' : 'Send Code'}
                    </Button>

                    {otpSent && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                      >
                        Use Different Number
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up for a new MedSafe account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auth Method Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => {
                      setAuthMethod('email');
                      setOtpSent(false);
                      setPhoneNumber('');
                      setOtp('');
                    }}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => {
                      setAuthMethod('phone');
                      setSignUpData({ email: '', password: '', fullName: '' });
                    }}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Button>
                </div>
                {authMethod === 'email' ? (
                  <>
                    {/* Google Sign Up */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={submitLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, and numbers
                    </p>
                  </div>
                      <Button type="submit" className="w-full" disabled={submitLoading}>
                        {submitLoading ? 'Creating account...' : 'Sign Up'}
                      </Button>
                    </form>
                  </>
                ) : (
                  <form onSubmit={handlePhoneAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        disabled={otpSent}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use international format (e.g., +1234567890)
                      </p>
                    </div>
                    
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-otp">Verification Code</Label>
                        <Input
                          id="signup-otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          maxLength={6}
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={submitLoading}>
                      {submitLoading ? 'Processing...' : otpSent ? 'Verify & Sign Up' : 'Send Code'}
                    </Button>

                    {otpSent && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                      >
                        Use Different Number
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
};

export default Auth;
