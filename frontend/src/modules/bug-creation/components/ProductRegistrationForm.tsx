import { useState } from 'react'
import { api } from '../../../lib/api'
import type { ProductData } from '../../../types'
import { Spinner } from '../../../components/ui/Spinner'
import { ErrorBox } from '../../../components/ui/ErrorBox'
import styles from './BugStep.module.css'

const AMBIENTES = ['Web', 'Mobile (Android/iOS)']

// ─── Tipos internos do formulário ─────────────────────────────────────────────

interface ModuloItem { id: string; nome: string; descricao: string; ambiente: string }

interface FormState {
  nome: string
  ambiente: string[]
  usuarios: string
  modulos: ModuloItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

function productToForm(product: ProductData): FormState {
  return {
    nome: product.nome,
    ambiente: product.ambiente,
    usuarios: product.usuarios.join(', '),
    modulos: Object.entries(product.modulos).map(([nome, { descricao, ambiente }]) => ({ id: uid(), nome, descricao, ambiente })),
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductRegistrationFormProps {
  areaPath: string
  initialData?: ProductData
  onSaved: (product: ProductData) => void
  onCancel: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ProductRegistrationForm({ areaPath, initialData, onSaved, onCancel }: ProductRegistrationFormProps) {
  const isEditing = !!initialData

  const [form, setForm] = useState<FormState>(
    initialData ? productToForm(initialData) : {
      nome: '',
      ambiente: [],
      usuarios: '',
      modulos: [{ id: uid(), nome: '', descricao: '', ambiente: '' }],
    }
  )
  const [modulosOpen, setModulosOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Ambiente ──────────────────────────────────────────────────────────────

  const toggleAmbiente = (value: string) =>
    setForm(prev => ({
      ...prev,
      ambiente: prev.ambiente.includes(value)
        ? prev.ambiente.filter(a => a !== value)
        : [...prev.ambiente, value],
    }))

  // ── Módulos ───────────────────────────────────────────────────────────────

  const addModulo = () =>
    setForm(prev => ({ ...prev, modulos: [...prev.modulos, { id: uid(), nome: '', descricao: '', ambiente: '' }] }))

  const removeModulo = (id: string) =>
    setForm(prev => ({ ...prev, modulos: prev.modulos.filter(m => m.id !== id) }))

  const updateModulo = (id: string, field: 'nome' | 'descricao' | 'ambiente', value: string) =>
    setForm(prev => ({ ...prev, modulos: prev.modulos.map(m => m.id === id ? { ...m, [field]: value } : m) }))

  // ── Validação em tempo real ───────────────────────────────────────────────

  const canSave =
    form.nome.trim().length > 0 &&
    form.ambiente.length > 0 &&
    form.usuarios.split(',').map(s => s.trim()).filter(Boolean).length > 0 &&
    form.modulos.some(m => m.nome.trim().length > 0)

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setError(null)

    const usuarios = form.usuarios.split(',').map(s => s.trim()).filter(Boolean)
    const modulosValid = form.modulos.filter(m => m.nome.trim())

    if (!form.nome.trim()) return setError('Informe o nome do produto')
    if (form.ambiente.length === 0) return setError('Selecione ao menos um tipo de aplicação')
    if (usuarios.length === 0) return setError('Informe ao menos um tipo de usuário')
    if (modulosValid.length === 0) return setError('Adicione ao menos um módulo com nome preenchido')

    const modulos = Object.fromEntries(modulosValid.map(m => [m.nome.trim(), { descricao: m.descricao.trim(), ambiente: m.ambiente.trim() }]))

    const payload = {
      nome: form.nome.trim(),
      ambiente: form.ambiente,
      usuarios,
      areaPath,
      modulos,
    }

    setSaving(true)
    try {
      const response = isEditing
        ? await api.put(`/api/products/${encodeURIComponent(initialData.nome)}`, payload)
        : await api.post('/api/products', payload)

      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao salvar produto')

      onSaved(json.data as ProductData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.productFormBox}>

      {/* Header */}
      <div className={styles.productFormHeader}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div className={styles.productFormHeaderText}>
          <span className={styles.productFormTitle}>
            {isEditing ? 'Editar contexto do produto' : 'Contexto do produto necessário'}
          </span>
          {!isEditing && (
            <span className={styles.productFormSubtitle}>
              Identificamos que este produto ainda não possui contexto cadastrado. Para prosseguir, preencha as
              informações abaixo — reserve um tempinho, pois será uma única vez. Depois disso, todos os bugs
              deste produto serão gerados com muito mais precisão.
            </span>
          )}
        </div>
      </div>

      {/* Nome */}
      <div className={styles.productFormSection}>
        <span className={styles.generatedLabel}>Nome do Produto *</span>
        <input
          className={styles.inputFull}
          placeholder="Ex: Cora - Visitas"
          value={form.nome}
          onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
          disabled={saving}
        />
      </div>

      {/* Tipo de Aplicação + Usuários — linha dupla */}
      <div className={styles.productFormSection} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className={styles.generatedLabel}>Tipo de Aplicação *</span>
          <div className={styles.checkboxGroup}>
            {AMBIENTES.map(a => (
              <label key={a} className={`${styles.checkboxLabel} ${form.ambiente.includes(a) ? styles.checkboxLabelActive : ''}`}>
                <input
                  type="checkbox"
                  checked={form.ambiente.includes(a)}
                  onChange={() => toggleAmbiente(a)}
                  disabled={saving}
                />
                <span className={styles.checkboxBox}>
                  {form.ambiente.includes(a) && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </span>
                {a}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className={styles.generatedLabel}>
            Usuários * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--text-muted)' }}>(separe por vírgula)</span>
          </span>
          <input
            className={styles.inputFull}
            placeholder="Ex: Promotores, Vendedores"
            value={form.usuarios}
            onChange={e => setForm(prev => ({ ...prev, usuarios: e.target.value }))}
            disabled={saving}
          />
        </div>
      </div>

      {/* Módulos */}
      <div className={styles.productFormSection}>
        <div className={styles.expandableHeader} onClick={() => setModulosOpen(o => !o)}>
          <svg
            className={`${styles.expandableArrow} ${modulosOpen ? styles.expandableArrowOpen : ''}`}
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className={styles.expandableLabel}>
            Módulos<span className={styles.expandableRequired}> *</span>
          </span>
        </div>

        {modulosOpen && (
          <div className={styles.expandableContent}>
            {form.modulos.map(modulo => (
              <div key={modulo.id} className={styles.moduleRow}>
                <input
                  className={styles.moduleInput}
                  placeholder="Nome do módulo"
                  value={modulo.nome}
                  onChange={e => updateModulo(modulo.id, 'nome', e.target.value)}
                  disabled={saving}
                />
                <input
                  className={styles.moduleInput}
                  placeholder="Descrição breve"
                  value={modulo.descricao}
                  onChange={e => updateModulo(modulo.id, 'descricao', e.target.value)}
                  disabled={saving}
                />
                <select
                  className={styles.moduleSelect}
                  value={modulo.ambiente}
                  onChange={e => updateModulo(modulo.id, 'ambiente', e.target.value)}
                  disabled={saving}
                >
                  <option value="">Ambiente</option>
                  {AMBIENTES.map(a => <option key={a} value={a}>{a}</option>)}
                  <option value="Ambos">Ambos</option>
                </select>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeModulo(modulo.id)}
                  disabled={saving || form.modulos.length <= 1}
                  title="Remover módulo"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button className={styles.addItemBtn} onClick={addModulo} disabled={saving}>
              + Adicionar módulo
            </button>
          </div>
        )}
      </div>

      {/* Erros + Ações */}
      {error && (
        <div className={styles.productFormSection}>
          <ErrorBox message={error} />
        </div>
      )}

      <div className={styles.productFormActions}>
        <button className={styles.btnGhost} onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || !canSave}>
          {saving ? <><Spinner size={15} />Salvando...</> : isEditing ? 'Salvar alterações' : 'Salvar e continuar'}
        </button>
      </div>
    </div>
  )
}
