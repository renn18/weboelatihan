'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Header from '@/components/Header'
import { sendContactEmail } from '@/app/contact/action'

interface FormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [status, setStatus] = useState<FormStatus>({ type: 'idle' })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi'
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subjek harus diisi'
    if (!formData.message.trim()) newErrors.message = 'Pesan harus diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setStatus({
        type: 'error',
        message: 'Silakan periksa kembali form Anda',
      })
      return
    }

    try {
      setStatus({ type: 'loading' })

      const result = await sendContactEmail(formData)

      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Pesan Anda telah terkirim! Kami akan segera merespons.',
        })
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })

        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus({ type: 'idle' })
        }, 5000)
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Gagal mengirim pesan. Silakan coba lagi.',
        })
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
      })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Hubungi Kami</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Punya pertanyaan atau masukan? Kami siap mendengarkan. Hubungi tim EduFlow kami dan kami akan merespons secepat mungkin.
          </p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              {/* Email */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 dark:bg-blue-500">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">support@eduflow.id</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Kami akan merespons dalam 24 jam
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 dark:bg-blue-500">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Telepon</h3>
                  <p className="text-gray-600 dark:text-gray-400">+62 812-3456-7890</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Senin - Jumat, 09:00 - 17:00 WIB
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 dark:bg-blue-500">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kantor</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Jl. Pendidikan No. 123
                    <br />
                    Makassar, Sulawesi Selatan 90123
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
                <div className="flex gap-4">
                  {[
                    { icon: '𝕏', label: 'Twitter' },
                    { icon: 'f', label: 'Facebook' },
                    { icon: '◆', label: 'LinkedIn' },
                    { icon: '📷', label: 'Instagram' },
                  ].map(social => (
                    <a
                      key={social.label}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-colors"
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-8">Kirim Pesan</h2>

                {/* Status Messages */}
                {status.type !== 'idle' && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                  >
                    {status.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={
                        status.type === 'success'
                          ? 'text-green-800 dark:text-green-300'
                          : 'text-red-800 dark:text-red-300'
                      }
                    >
                      {status.message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama Anda"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${errors.name
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@example.com"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${errors.email
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Nomor Telepon (Opsional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subjek *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Pertanyaan tentang kursus"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${errors.subject
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.subject && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Pesan *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${errors.message
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.message && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {status.type === 'loading' ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Kirim Pesan
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    * Bidang yang wajib diisi
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pertanyaan Umum</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Temukan jawaban untuk pertanyaan yang sering diajukan
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Berapa lama waktu respons support?',
                a: 'Tim support kami merespons dalam 24 jam kerja. Untuk pertanyaan mendesak, hubungi kami melalui telepon.',
              },
              {
                q: 'Bagaimana jika saya punya masalah teknis?',
                a: 'Kirim pesan dengan detail masalah Anda. Jika diperlukan, tim teknis kami akan menghubungi Anda untuk bantuan lebih lanjut.',
              },
              {
                q: 'Apakah ada layanan konsultasi?',
                a: 'Ya! Kami menyediakan sesi konsultasi gratis untuk membantu Anda memilih kursus yang tepat. Hubungi kami untuk mengatur jadwal.',
              },
              {
                q: 'Bagaimana dengan kebijakan pengembalian dana?',
                a: 'Kami menawarkan garansi uang kembali 30 hari jika Anda tidak puas dengan kursus. Lihat ketentuan lengkap di halaman kebijakan kami.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <summary className="cursor-pointer p-6 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <h3 className="font-semibold text-lg">{faq.q}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Masih butuh bantuan?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Jangan ragu untuk menghubungi kami. Kami berkomitmen untuk memberikan pengalaman terbaik.
          </p>
          <a
            href="mailto:support@eduflow.id"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Hubungi via Email
          </a>
        </div>
      </section>
    </>
  )
}
