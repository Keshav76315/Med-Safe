import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface WelcomeEmailProps {
  email: string;
  full_name?: string;
}

export const WelcomeEmail = ({ email, full_name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MediSafe - Your Drug Safety Guardian</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🏥 Welcome to MediSafe</Heading>
        <Text style={text}>
          Hello {full_name || 'there'}!
        </Text>
        <Text style={text}>
          Thank you for joining MediSafe, your trusted partner in pharmaceutical safety and drug verification.
        </Text>
        <Section style={features}>
          <Text style={featureTitle}>What you can do with MediSafe:</Text>
          <Text style={feature}>✅ Verify drug authenticity instantly</Text>
          <Text style={feature}>🔍 Scan QR codes on drug packaging</Text>
          <Text style={feature}>📊 Track your medication history</Text>
          <Text style={feature}>🛡️ Get real-time counterfeit alerts</Text>
          <Text style={feature}>💊 Monitor your safety score</Text>
        </Section>
        <Text style={text}>
          Your account is ready to use. Start protecting yourself and your loved ones from counterfeit medications today.
        </Text>
        <Section style={buttonContainer}>
          <Link
            href="https://7066549e-aeac-4073-8172-c728424ec087.lovableproject.com/"
            style={button}
          >
            Get Started
          </Link>
        </Section>
        <Text style={footer}>
          Stay safe,<br />
          The MediSafe Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

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

const features = {
  padding: '0 40px',
  margin: '24px 0',
}

const featureTitle = {
  color: '#0F766E',
  fontSize: '18px',
  fontWeight: '600',
  margin: '16px 0 12px',
}

const feature = {
  color: '#555',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
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

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0 0',
  padding: '0 40px',
}
