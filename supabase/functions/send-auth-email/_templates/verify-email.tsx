import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface VerifyEmailProps {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  supabase_url: string;
}

export const VerifyEmail = ({
  token,
  token_hash,
  redirect_to,
  email_action_type,
  supabase_url,
}: VerifyEmailProps) => {
  const verifyUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
  
  return (
    <Html>
      <Head />
      <Preview>Verify your MediSafe account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🔐 Verify Your Email</Heading>
          <Text style={text}>
            Thank you for signing up for MediSafe! We need to verify your email address to activate your account.
          </Text>
          <Section style={buttonContainer}>
            <Link href={verifyUrl} style={button}>
              Verify Email Address
            </Link>
          </Section>
          <Text style={text}>
            Or copy and paste this verification code:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{token}</Text>
          </Section>
          <Text style={helperText}>
            This verification link will expire in 24 hours for security reasons.
          </Text>
          <Text style={helperText}>
            If you didn't create a MediSafe account, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            Stay safe,<br />
            The MediSafe Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  border: '1px solid #e8e8e8',
}

const h1 = {
  color: '#0F766E',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.3',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const buttonContainer = {
  padding: '0 40px',
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0F766E',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
}

const codeContainer = {
  backgroundColor: '#f4f4f4',
  borderRadius: '6px',
  margin: '16px 40px',
  padding: '16px',
  border: '1px solid #e8e8e8',
}

const code = {
  color: '#0F766E',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '4px',
  margin: '0',
}

const helperText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
  padding: '0 40px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0 0',
  padding: '0 40px',
}
