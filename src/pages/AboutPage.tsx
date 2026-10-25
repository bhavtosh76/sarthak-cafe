import { useState, type FormEvent } from 'react'
import {
  CAFE_ADDRESS,
  CAFE_EMAIL,
  CAFE_HOURS,
  CAFE_NAME,
  CAFE_PHONE,
  CAFE_PHONE_TEL,
} from '../constants'
import { isFirebaseConfigured } from '../config/firebase'
import { useToast } from '../context/ToastContext'
import { sendContactMessage } from '../services/message.service'
import { Button } from '../components/common/Button'
import styles from './AboutPage.module.css'

const VALUES = [
  { emoji: '🌾', title: 'Fresh, daily', text: 'Vegetables, breads and dairy sourced every morning.' },
  { emoji: '🧑‍🍳', title: 'Cooked to order', text: 'Nothing is pre-cooked — your plate starts when you order.' },
  { emoji: '🧼', title: 'Hygiene first', text: 'Sanitised kitchen, masked staff, sealed packaging.' },
  { emoji: '💵', title: 'Fair prices', text: 'Generous portions at honest, transparent rates.' },
]

const initialForm = { name: '', email: '', phone: '', message: '' }

export default function AboutPage() {
  const { showToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialForm, string>>>({})

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const found: Partial<Record<keyof typeof initialForm, string>> = {}
    if (form.name.trim().length < 2) found.name = 'Please enter your name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = 'Enter a valid email'
    if (form.message.trim().length < 10) found.message = 'Tell us a bit more (min. 10 characters)'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      })
      showToast("Message sent — we'll get back to you soon!", 'success')
      setForm(initialForm)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send message', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Since 2019</span>
          <h1>We cook like it&apos;s for family</h1>
          <p>
            {CAFE_NAME} started as a 12-seat corner café. Today we serve 500+ plates a week — with
            the same home-style recipes, the same fresh ingredients and the same smiling faces.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div>
              <h2>What we stand for</h2>
              <p>Four promises behind every order</p>
            </div>
          </div>
          <div className={styles.values}>
            {VALUES.map((value) => (
              <article key={value.title} className={styles.value}>
                <span aria-hidden="true">{value.emoji}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contactSection} id="contact">
        <div className={`container ${styles.contactGrid}`}>
          <div>
            <h2>Say hello</h2>
            <p className={styles.contactLead}>
              Questions, bulk orders or feedback — we&apos;d love to hear from you.
            </p>

            <ul className={styles.details}>
              <li>
                <span aria-hidden="true">📍</span>
                <div>
                  <strong>Visit us</strong>
                  {CAFE_ADDRESS}
                </div>
              </li>
              <li>
                <span aria-hidden="true">📞</span>
                <div>
                  <strong>Call</strong>
                  <a href={`tel:${CAFE_PHONE_TEL}`}>{CAFE_PHONE}</a>
                </div>
              </li>
              <li>
                <span aria-hidden="true">✉️</span>
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${CAFE_EMAIL}`}>{CAFE_EMAIL}</a>
                </div>
              </li>
              <li>
                <span aria-hidden="true">🕐</span>
                <div>
                  <strong>Hours</strong>
                  {CAFE_HOURS}
                </div>
              </li>
            </ul>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <h3>Send us a message</h3>

            <div className="field">
              <label htmlFor="c-name">Name</label>
              <input
                id="c-name"
                type="text"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="Your name"
              />
              {errors.name && <span className="fieldError">{errors.name}</span>}
            </div>

            <div className={styles.row}>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="fieldError">{errors.email}</span>}
              </div>

              <div className="field">
                <label htmlFor="c-phone">Phone (optional)</label>
                <input
                  id="c-phone"
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="c-message">Message</label>
              <textarea
                id="c-message"
                rows={4}
                value={form.message}
                onChange={(event) => update('message', event.target.value)}
                placeholder="How can we help?"
              />
              {errors.message && <span className="fieldError">{errors.message}</span>}
            </div>

            {!isFirebaseConfigured && (
              <p className={styles.setupNote}>
                Firebase keys missing — the message cannot be saved yet (demo mode).
              </p>
            )}

            <Button type="submit" loading={sending} disabled={!isFirebaseConfigured}>
              Send message
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
