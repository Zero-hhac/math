import { useMemo, useState, useEffect, useRef } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock, AdminModal } from './AdminShared'

const EMPTY_FORM = { title: '', description: '', is_published: true, visibility: 'members', publish_at: '' }

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '未知'
  const units = ['B', 'KB', 'MB', 'GB']
  let unit = 0
  let size = bytes
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

function fileTypeLabel(ext) {
  if (!ext) return '文件'
  const type = ext.replace('.', '').toLowerCase()
  const map = { pdf: 'PDF', doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', ppt: 'PPT', pptx: 'PPT', zip: '压缩包', rar: '压缩包', txt: '文本', md: 'Markdown', csv: 'CSV' }
  return map[type] || type.toUpperCase()
}

export default function AdminDocuments() {
  const [data, setData] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const result = await api.admin.documents.list({ page_size: 50 })
      setData(Array.isArray(result?.list) ? result.list : [])
    } catch (error) {
      setNotice({ type: 'error', title: '文档列表加载失败', message: error.message || '请稍后重试。' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [item.title, item.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword))
    )
  }, [data, query])

  const openNew = () => {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setFile(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ title: item.title || '', description: item.description || '', is_published: item.is_published !== false, visibility: item.visibility || 'members', publish_at: item.publish_at ? item.publish_at.slice(0, 16) : '' })
    setFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
    setFile(null)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!editItem && !file) {
      setNotice({ type: 'error', title: '请选择文件', message: '上传文档需要选择一个文件。' })
      return
    }
    setSaving(true)
    setNotice(null)

    try {
      let filePath = editItem?.file_path || ''
      let fileSize = editItem?.file_size || 0
      let fileType = editItem?.file_type || ''

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadResult = await api.admin.upload.file(formData)
        filePath = uploadResult.data.url
        fileSize = uploadResult.data.size
        fileType = uploadResult.data.filename
      }

      const payload = {
        title: form.title,
        description: form.description,
        file_path: filePath,
        file_size: fileSize,
        file_type: fileType,
        is_published: form.is_published,
        visibility: form.visibility,
        publish_at: form.publish_at || null,
      }

      if (editItem) {
        await api.admin.documents.update(editItem.id, payload)
        setNotice({ type: 'success', title: '文档已更新', message: `已保存「${form.title}」。` })
      } else {
        await api.admin.documents.create(payload)
        setNotice({ type: 'success', title: '文档已上传', message: `已创建「${form.title}」。` })
      }
      closeModal()
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '保存失败', message: error.message || '请检查输入后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`确定删除「${title}」吗？`)) return
    try {
      await api.admin.documents.delete(id)
      setNotice({ type: 'success', title: '文档已删除', message: `「${title}」已移除。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  const handleTogglePublish = async (item) => {
    try {
      await api.admin.documents.update(item.id, { ...item, is_published: !item.is_published })
      setNotice({ type: 'success', title: item.is_published ? '已下架' : '已发布', message: `「${item.title}」${item.is_published ? '已设为不公开' : '已公开发布'}。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '操作失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) return <AdminLoadingBlock label="正在载入文档列表..." />

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Documents"
        title="资料管理"
        description="上传协会文档资料，设置公开后会员可查看和下载。"
        meta={[
          { label: '全部文档', value: data.length },
          { label: '已发布', value: data.filter((d) => d.is_published).length },
          { label: '筛选结果', value: filtered.length },
        ]}
        actions={
          <>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索文档标题、描述" />
            <button className="button button--primary" onClick={openNew}>上传文档</button>
          </>
        }
      />

      <AdminNotice notice={notice} />

      <section className="admin-panel">
        {filtered.length > 0 ? (
          <div className="admin-collection">
            {filtered.map((item) => (
              <article key={item.id} className="admin-record-card">
                <div className="admin-record-card__head">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : '日期待补充'}</p>
                  </div>
                  <div className="admin-record-card__meta">
                    <span className="admin-badge">{fileTypeLabel(item.file_type)}</span>
                    <span className="admin-badge">{item.visibility === 'members' ? '仅会员' : item.visibility === 'both' ? '首页+会员' : '公开'}</span>
                    <span className={`admin-badge ${item.is_published ? '' : 'admin-badge--dim'}`}>{item.is_published ? '已发布' : '草稿'}</span>
                  </div>
                </div>
                <p className="admin-record-card__desc">{item.description || '暂无描述。'}</p>
                <div className="admin-record-card__stats">
                  <span>文件大小: {formatFileSize(item.file_size)}</span>
                  <span>下载次数: {item.download_count || 0}</span>
                  {item.file_path && (
                    <a href={item.file_path} target="_blank" download rel="noreferrer" className="admin-record-card__link">预览 / 下载</a>
                  )}
                </div>
                <div className="admin-record-card__actions">
                  <button className="button button--ghost" onClick={() => openEdit(item)}>编辑</button>
                  <button className="button button--ghost" onClick={() => handleTogglePublish(item)}>
                    {item.is_published ? '下架' : '发布'}
                  </button>
                  <button className="button button--danger" onClick={() => handleDelete(item.id, item.title)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title={data.length ? '没有匹配结果' : '暂无文档资料'}
            description={data.length ? '换个关键词试试。' : '上传第一份文档。'}
          />
        )}
      </section>

      {showModal && (
        <AdminModal
          eyebrow={editItem ? 'Edit document' : 'Upload document'}
          title={editItem ? '编辑文档信息' : '上传新文档'}
          subtitle={editItem ? '修改文档的标题、描述和发布状态。' : '上传文件并填写文档信息，发布后会员可查看下载。'}
          onClose={closeModal}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__section">
              <h4>文档信息</h4>
              <label>标题<input name="title" value={form.title} onChange={handleChange} required /></label>
              <label>描述<textarea name="description" value={form.description} onChange={handleChange} placeholder="简述文档内容与用途" /></label>
            </div>
            <div className="admin-form__section">
              <h4>文件上传</h4>
              {editItem && editItem.file_path && (
                <div className="admin-form__hint">当前文件: {editItem.file_type || editItem.file_path}</div>
              )}
              <label className="admin-form__file">
                <span>{file ? file.name : (editItem ? '选择新文件（可选，不选则保留原文件）' : '选择文件')}</span>
                <input
                  type="file"
                  ref={fileRef}
                  onChange={(event) => setFile(event.target.files[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.md,.csv"
                />
              </label>
            </div>
            <div className="admin-form__section">
              <h4>展示与发布</h4>
              <label>
                展示范围
                <select name="visibility" value={form.visibility} onChange={handleChange}>
                  <option value="members">仅会员中心</option>
                  <option value="public">公开（首页+会员中心）</option>
                  <option value="both">首页+会员中心</option>
                </select>
              </label>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
                上传后立即公开
              </label>
              <label>
                定时发布时间（可选，留空则按开关决定）
                <input type="datetime-local" name="publish_at" value={form.publish_at} onChange={handleChange} />
              </label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModal}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '保存中...' : (editItem ? '保存修改' : '上传文档')}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
