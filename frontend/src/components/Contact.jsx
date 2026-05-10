import { useState } from 'react'
import { api } from '../api'

const INITIAL_FORM = { name: '', email: '', phone: '', message: '' }

const CONTACT_POINTS = [
  ['空间', '数学科学学院 · 数学楼 303'],
  ['邮箱', 'mathclub@university.edu.cn'],
  ['社群', 'QQ 群 / 微信公众号同步开放'],
  ['时间', '每周三至周五 19:00 - 21:00'],
]

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      await api.submitContact(form)
      setForm(INITIAL_FORM)
      setFeedback({ type: 'success', text: '提交成功，我们会尽快和你联系。' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || '提交失败，请稍后再试。' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-frame contact-layout">
      <div className="contact-copy">
        <div className="eyebrow">Join The Circle</div>
        <h2>如果你愿意认真对待数学，这里会认真欢迎你。</h2>
        <p>
          你可以来咨询竞赛、活动安排、社团加入方式，也可以只是告诉我们，
          你最近正在被哪个数学问题困住。好的社群往往从一次自然的发问开始。
        </p>

        <div className="contact-points">
          {CONTACT_POINTS.map(([label, value]) => (
            <div key={label} className="contact-point">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <form className="contact-form-panel" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            姓名
            <input name="name" value={form.name} onChange={handleChange} placeholder="你的名字" required />
          </label>
          <label>
            邮箱
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
          </label>
        </div>

        <label>
          电话
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="选填" />
        </label>

        <label>
          留言
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="想了解竞赛、活动或加入方式，都可以写在这里。"
            required
          />
        </label>

        <button className="button button--primary button--full" type="submit" disabled={submitting}>
          {submitting ? '提交中...' : '发送申请与留言'}
        </button>

        {feedback && <div className={`form-feedback ${feedback.type}`}>{feedback.text}</div>}
      </form>
    </div>
  )
}
