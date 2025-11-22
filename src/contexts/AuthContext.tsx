import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes (including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          try {
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            setUserRole(data?.role || null);
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
          } finally {
            // CRITICAL: Set loading to false after handling auth state change
            setLoading(false);
          }
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          setUserRole(data?.role || null);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          is_new_user: true
        }
      }
    });
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Welcome to MedSafe!"
      });
    }
    
    return { error, isNewUser: true };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
