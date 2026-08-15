import type { APIRoute } from 'astro'

const recipient = import.meta.env.INQUIRY_RECIPIENT_EMAIL

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData()
  const payload = Object.fromEntries(form.entries())

  if (!payload.name || !payload.Email || !payload.ContactNumber || !payload.TermsAccepted) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), { status: 400 })
  }

  // Production storage is intended to be handled by the Payload `inquiries` collection.
  // This endpoint keeps the frontend form contract stable for Cloudflare Workers.
  if (import.meta.env.RESEND_API_KEY && recipient) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: import.meta.env.FORM_FROM_EMAIL || 'Centrix <onboarding@resend.dev>',
          to: [recipient],
          subject: 'New Centrix landing page inquiry',
          text: JSON.stringify(payload, null, 2),
        }),
      })
    } catch (error) {
      console.error('Inquiry email failed', error)
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
