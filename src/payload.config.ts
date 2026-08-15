import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { r2Storage } from '@payloadcms/storage-r2'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const cloudflareEnv = (globalThis as any).cloudflare?.env
const useD1 = Boolean(cloudflareEnv?.D1)

const publicRead = () => true

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Centrix CMS',
    },
  },
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'local-centrix-payload-secret-change-me',
  db: useD1
    ? sqliteD1Adapter({
        binding: cloudflareEnv.D1,
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL || 'file:./payload.local.sqlite',
        },
      }),
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    {
      slug: 'media',
      access: { read: publicRead },
      upload: {
        staticDir: 'public/uploads',
        mimeTypes: ['image/*', 'video/*', 'application/pdf'],
      },
      fields: [
        { name: 'alt', type: 'text', required: true },
        { name: 'caption', type: 'textarea' },
      ],
    },
    {
      slug: 'pages',
      access: { read: publicRead },
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        {
          name: 'blocks',
          type: 'blocks',
          blocks: [
            {
              slug: 'hero',
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text', required: true },
                { name: 'primaryCTA', type: 'text' },
                { name: 'secondaryCTA', type: 'text' },
              ],
            },
            {
              slug: 'textImage',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'body', type: 'textarea' },
                { name: 'image', type: 'relationship', relationTo: 'media' },
              ],
            },
            {
              slug: 'cards',
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text' },
                    { name: 'body', type: 'textarea' },
                    { name: 'meta', type: 'text' },
                  ],
                },
              ],
            },
            {
              slug: 'faq',
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'question', type: 'text' },
                    { name: 'answer', type: 'textarea' },
                  ],
                },
              ],
            },
            {
              slug: 'ctaBand',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'ctaLabel', type: 'text' },
                { name: 'ctaHref', type: 'text' },
              ],
            },
          ],
        },
        {
          name: 'seo',
          type: 'group',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'ogImage', type: 'relationship', relationTo: 'media' },
            { name: 'canonicalUrl', type: 'text' },
            { name: 'indexed', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
    {
      slug: 'services',
      access: { read: publicRead },
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'relationship', relationTo: 'media' },
      ],
    },
    {
      slug: 'products',
      access: { read: publicRead },
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'sizeRange', type: 'text' },
        { name: 'unitCount', type: 'number' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      slug: 'testimonials',
      access: { read: publicRead },
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'quote', type: 'textarea', required: true },
      ],
    },
    {
      slug: 'faqs',
      access: { read: publicRead },
      admin: { useAsTitle: 'question' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      slug: 'redirects',
      fields: [
        { name: 'from', type: 'text', required: true },
        { name: 'to', type: 'text', required: true },
        { name: 'statusCode', type: 'select', options: ['301', '302'], defaultValue: '301' },
      ],
    },
    {
      slug: 'inquiries',
      admin: { useAsTitle: 'email' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'message', type: 'textarea' },
        { name: 'sourcePage', type: 'text' },
        { name: 'formType', type: 'text', defaultValue: 'centrix-interest' },
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
        { name: 'gclid', type: 'text' },
        { name: 'fbclid', type: 'text' },
        { name: 'msclkid', type: 'text' },
        { name: 'ttclid', type: 'text' },
        { name: 'clickId', type: 'text' },
      ],
    },
  ],
  globals: [
    {
      slug: 'site-settings',
      fields: [
        { name: 'siteName', type: 'text', defaultValue: 'Centrix The Station KLCC' },
        { name: 'phone', type: 'text', defaultValue: '+60 11-4066 6308' },
        { name: 'website', type: 'text', defaultValue: 'https://www.centrixklccstation.com.my/' },
        { name: 'logo', type: 'relationship', relationTo: 'media' },
        { name: 'favicon', type: 'relationship', relationTo: 'media' },
        {
          name: 'theme',
          type: 'group',
          fields: [
            { name: 'primary', type: 'text', defaultValue: '#111111' },
            { name: 'secondary', type: 'text', defaultValue: '#D2AE6D' },
            { name: 'accent', type: 'text', defaultValue: '#8F6B3D' },
            { name: 'background', type: 'text', defaultValue: '#F6F1E8' },
          ],
        },
      ],
    },
    {
      slug: 'header-footer',
      fields: [
        { name: 'navItems', type: 'array', fields: [{ name: 'label', type: 'text' }, { name: 'href', type: 'text' }] },
        { name: 'footerText', type: 'textarea' },
      ],
    },
  ],
  plugins: [
    r2Storage({
      enabled: useD1 && Boolean(cloudflareEnv?.R2),
      collections: { media: true },
      bucket: cloudflareEnv?.R2,
    }),
  ],
})
