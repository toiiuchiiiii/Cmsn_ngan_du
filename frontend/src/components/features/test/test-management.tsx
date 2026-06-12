import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'

interface Question {
  id?: number
  questionText: string
  options: { label: string; value: number }[]
  orderIndex: number
}

interface TestTemplate {
  id: number
  title: string
  description: string
  createdBy: number
  questions: Question[]
  createdAt: string
}

export function TestManagement() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'patient'
  const [templates, setTemplates] = useState<TestTemplate[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TestTemplate | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: '', options: [{ label: 'Rất ít', value: 0 }, { label: 'Nhiều', value: 3 }], orderIndex: 0 },
  ])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const canManage = role === 'therapist' || role === 'admin'

  useEffect(() => {
    if (!canManage) return
    const fetch = async () => {
      try {
        const res = await api.get('test-templates').json<{ success: boolean; data: TestTemplate[] }>()
        setTemplates(res.data ?? [])
      } catch { /* ignore */ }
      setFetching(false)
    }
    fetch()
  }, [canManage])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setQuestions([{ questionText: '', options: [{ label: 'Rất ít', value: 0 }, { label: 'Nhiều', value: 3 }], orderIndex: 0 }])
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (t: TestTemplate) => {
    setTitle(t.title)
    setDescription(t.description)
    setQuestions(t.questions.map(q => ({
      questionText: q.questionText,
      options: q.options,
      orderIndex: q.orderIndex,
    })))
    setEditing(t)
    setShowForm(true)
  }

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: [{ label: 'Rất ít', value: 0 }, { label: 'Nhiều', value: 3 }], orderIndex: questions.length }])
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i })))
  }

  const updateQuestion = (idx: number, field: string, value: string) => {
    const qs = [...questions]
    ;(qs[idx] as any)[field] = value
    setQuestions(qs)
  }

  const addOption = (qIdx: number) => {
    const qs = [...questions]
    qs[qIdx].options = [...qs[qIdx].options, { label: '', value: qs[qIdx].options.length }]
    setQuestions(qs)
  }

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const qs = [...questions]
    qs[qIdx].options[oIdx] = { ...qs[qIdx].options[oIdx], label: value }
    setQuestions(qs)
  }

  const removeOption = (qIdx: number, oIdx: number) => {
    const qs = [...questions]
    qs[qIdx].options = qs[qIdx].options.filter((_, i) => i !== oIdx).map((opt, i) => ({ ...opt, value: i }))
    setQuestions(qs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || questions.some(q => !q.questionText.trim()) || questions.some(q => q.options.some(o => !o.label.trim()))) return
    setLoading(true)
    try {
      if (editing) {
        await api.put(`test-templates/${editing.id}`, { json: { title, description, options: { questions } } })
      } else {
        await api.post('test-templates', { json: { title, description, options: { questions } } })
      }
      const res = await api.get('test-templates').json<{ success: boolean; data: TestTemplate[] }>()
      setTemplates(res.data ?? [])
      resetForm()
    } catch { /* error */ }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa bài kiểm tra này?')) return
    try {
      await api.delete(`test-templates/${id}`)
      setTemplates(templates.filter(t => t.id !== id))
    } catch { /* error */ }
  }

  if (!canManage) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl text-fg-primary">Bạn không có quyền truy cập</h1>
      </main>
    )
  }

  if (fetching) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-fg-tertiary">Đang tải...</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-fg-primary">Quản lý bài kiểm tra</h1>
          <p className="text-sm text-fg-tertiary mt-1">Tạo và quản lý bài kiểm tra sức khỏe tâm thần</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="rounded-full bg-accent-sage text-white px-5 py-2 text-sm font-medium hover:bg-accent-sage/90 transition-colors"
        >
          + Tạo bài kiểm tra
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-border bg-surface p-6 space-y-5">
          <h2 className="font-serif text-lg text-fg-primary">{editing ? 'Sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}</h2>
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-1">Tiêu đề</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl bg-canvas border border-border px-4 py-2.5 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage"
              placeholder="VD: Bài kiểm tra lo âu" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-1">Mô tả</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl bg-canvas border border-border px-4 py-2.5 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage resize-none"
              rows={3} placeholder="Mô tả ngắn về bài kiểm tra..."
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-fg-secondary">Câu hỏi</label>
              <button type="button" onClick={addQuestion} className="text-xs text-accent-sage font-medium hover:underline">+ Thêm câu hỏi</button>
            </div>
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-border bg-canvas p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs text-fg-tertiary font-medium mt-3 flex-shrink-0">#{qi + 1}</span>
                    <input
                      type="text" value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage"
                      placeholder="Nội dung câu hỏi..." required
                    />
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} className="text-crisis text-xs p-1 mt-1 flex-shrink-0">✕</button>
                    )}
                  </div>
                  <div className="space-y-1.5 pl-4">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="text-xs text-fg-tertiary w-4">{oi + 1}.</span>
                        <input
                          type="text" value={opt.label} onChange={e => updateOption(qi, oi, e.target.value)}
                          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage"
                          placeholder={`Lựa chọn ${oi + 1}`} required
                        />
                        {q.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(qi, oi)} className="text-fg-tertiary text-xs p-1">✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(qi)} className="text-xs text-accent-sage hover:underline mt-1">+ Thêm lựa chọn</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="rounded-full bg-accent-sage text-white px-6 py-2 text-sm font-medium hover:bg-accent-sage/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo'}
            </button>
            <button type="button" onClick={resetForm}
              className="rounded-full border border-border px-6 py-2 text-sm text-fg-secondary hover:bg-surface-hover transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-fg-tertiary">Chưa có bài kiểm tra nào.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map(t => (
            <div key={t.id} className="rounded-2xl border border-border bg-surface p-5 flex items-start justify-between">
              <div>
                <h3 className="font-medium text-fg-primary">{t.title}</h3>
                {t.description && <p className="text-sm text-fg-tertiary mt-1">{t.description}</p>}
                <p className="text-xs text-fg-tertiary mt-2">{t.questions.length} câu hỏi</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => openEdit(t)}
                  className="text-xs text-accent-sage font-medium hover:underline">Sửa</button>
                <button type="button" onClick={() => handleDelete(t.id)}
                  className="text-xs text-crisis font-medium hover:underline">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
