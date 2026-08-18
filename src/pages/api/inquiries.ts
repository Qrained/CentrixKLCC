import type { APIRoute } from 'astro'

const recipient = import.meta.env.INQUIRY_RECIPIENT_EMAIL

type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => { run: () => Promise<unknown> }
  }
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

const clean = (value: FormDataEntryValue | null, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

export const POST: APIRoute = async ({ request, locals }) => {
  let form: FormData

  try {
    form = await request.formData()
  } catch {
    return json({ ok: false, error: 'Invalid form submission' }, 400)
  }

  const title = clean(form.get('Title'), 40)
  const name = clean(form.get('name'), 150)
  const contactNumber = clean(form.get('ContactNumber'), 50)
  const email = clean(form.get('Email'), 254).toLowerCase()
  const countryOfResidence = clean(form.get('CountryOfResidence'), 100)
  const interestedType = clean(form.get('InterestedType'), 80)
  const message = clean(form.get('Message'), 4000)
  const termsAccepted = form.get('TermsAccepted') === 'Accepted'

  if (!title || !name || !contactNumber || !email || !countryOfResidence || !interestedType || !termsAccepted) {
    return json({ ok: false, error: 'Missing required fields' }, 400)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Invalid email address' }, 400)
  }

  const db = (locals as any).runtime?.env?.DB as D1DatabaseLike | undefined
  if (!db) {
    console.error('The DB binding is unavailable')
    return json({ ok: false, error: 'Unable to save inquiry' }, 503)
  }

  const now = new Date().toISOString()
  const sourcePage = request.headers.get('Referer')?.slice(0, 1000) || ''
  let sourceUrl: URL | undefined

  try {
    sourceUrl = sourcePage ? new URL(sourcePage) : undefined
  } catch {
    sourceUrl = undefined
  }

  try {
    await db
      .prepare(`
        INSERT INTO inquiries (
          id, title, name, contact_number, email, country_of_residence,
          interested_type, message, terms_accepted, consented_at, status,
          source_page, utm_source, utm_medium, utm_campaign, gclid, fbclid,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(), title, name, contactNumber, email, countryOfResidence,
        interestedType, message || null, 1, now, 'new', sourcePage || null,
        sourceUrl?.searchParams.get('utm_source')?.slice(0, 200) || null,
        sourceUrl?.searchParams.get('utm_medium')?.slice(0, 200) || null,
        sourceUrl?.searchParams.get('utm_campaign')?.slice(0, 200) || null,
        sourceUrl?.searchParams.get('gclid')?.slice(0, 300) || null,
        sourceUrl?.searchParams.get('fbclid')?.slice(0, 300) || null,
        now, now,
      )
      .run()
  } catch (error) {
    console.error('Inquiry database insert failed', error)
    return json({ ok: false, error: 'Unable to save inquiry' }, 500)
  }

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
          text: JSON.stringify({ title, name, contactNumber, email, countryOfResidence, interestedType, message }, null, 2),
        }),
      })
    } catch (error) {
      console.error('Inquiry email failed', error)
    }
  }

  return json({ ok: true }, 201)
}
