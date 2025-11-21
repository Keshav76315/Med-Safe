import React from 'https://esm.sh/react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22'
import { WelcomeEmail } from './_templates/welcome.tsx'
import { VerifyEmail } from './_templates/verify-email.tsx'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      try {
        wh.verify(payload, headers)
      } catch (error) {
        console.error('Webhook verification failed:', error)
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    const data = JSON.parse(payload)
    const { user, email_data } = data
    
    console.log('Processing auth email:', {
      type: email_data.email_action_type,
      user_email: user.email,
    })

    let html: string
    let subject: string
    let fromName = 'MediSafe'

    // Determine which template to use based on email action type
    switch (email_data.email_action_type) {
      case 'signup':
      case 'invite':
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            email: user.email,
            full_name: user.raw_user_meta_data?.full_name,
          })
        )
        subject = 'Welcome to MediSafe! 🏥'
        break

      case 'magiclink':
      case 'email_change':
      case 'confirmation':
        html = await renderAsync(
          React.createElement(VerifyEmail, {
            token: email_data.token,
            token_hash: email_data.token_hash,
            redirect_to: email_data.redirect_to,
            email_action_type: email_data.email_action_type,
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          })
        )
        subject = 'Verify your MediSafe email'
        break

      case 'recovery':
      case 'reauthentication':
        html = await renderAsync(
          React.createElement(PasswordResetEmail, {
            token: email_data.token,
            token_hash: email_data.token_hash,
            redirect_to: email_data.redirect_to,
            email_action_type: email_data.email_action_type,
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          })
        )
        subject = 'Reset your MediSafe password'
        break

      default:
        console.error('Unknown email action type:', email_data.email_action_type)
        return new Response(
          JSON.stringify({ error: 'Unknown email type' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: `${fromName} <onboarding@resend.dev>`,
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Auth email sent successfully to:', user.email)

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
