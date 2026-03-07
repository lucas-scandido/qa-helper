import { useState } from 'react'
import { api } from '../../../lib/api'
import type { WorkItemResult, ProductContext } from '../../../types'
import { Spinner } from '../../../components/ui/Spinner'
import { ErrorBox } from '../../../components/ui/ErrorBox'
import styles from './BugStep.module.css'

// ─── Product Form Sub-component ──────────────────────────────────────────────

interface ProductFormProps {
  onSave: (product: ProductContext) => void
  onCancel: () => void
  areaPath: string
}

function ProductContextForm({ onSave, onCancel, areaPath }: ProductFormProps) {
  const [nome, setNome] = useState('')
  const [plataformas, setPlataformas] = useState<Record<string, boolean>>({ Web: false, 'Mobile (Android/iOS)': false })
  const [usuarios, setUsuarios] = useState('')
  const [modulosOpen, setModulosOpen] = useState(true)
  const [fluxosOpen, setFluxosOpen] = useState(false)
  const [modulos, setModulos] = useState([{ nome: '', descricao: '' }])
  const [fluxos, setFluxos] = useState([{ nome: '', modulos: [''] }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plataformasSelecionadas = Object.entries(plataformas).filter(([, v]) => v).length
  const isValid = nome.trim() && plataformasSelecionadas > 0 && usuarios.trim() && modulos.some(m => m.nome.trim())

  const handleSave = async () => {
    if (!isValid) return

    setSaving(true)
    setError(null)

    const platList = Object.entries(plataformas).filter(([, v]) => v).map(([k]) => k)
    const modulosRecord: Record<string, string> = {}
    modulos.filter(m => m.nome.trim()).forEach(m => { modulosRecord[m.nome.trim()] = m.descricao.trim() })

    const fluxosRecord: Record<string, string[]> = {}
    fluxos.filter(f => f.nome.trim()).forEach(f => {
      fluxosRecord[f.nome.trim()] = f.modulos.filter(m => m.trim())
    })

    const payload: ProductContext = {
      nome: nome.trim(),
      tipo: platList.join(', '),
      plataformas: platList,
      usuarios: usuarios.split(',').map(u => u.trim()).filter(Boolean),
      modulos: modulosRecord,
      fluxos: fluxosRecord,
      areaPaths: [areaPath.split('/').pop()?.toLowerCase() ?? areaPath.toLowerCase()],
    }

    try {
      const response = await api.post('/api/bugs/products', payload)
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao salvar produto')
      onSave(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  // Módulo helpers
  const addModulo = () => setModulos([...modulos, { nome: '', descricao: '' }])
  const removeModulo = (i: number) => setModulos(modulos.filter((_, idx) => idx !== i))
  const updateModulo = (i: number, field: 'nome' | 'descricao', v: string) => {
    const m = [...modulos]; m[i][field] = v; setModulos(m)
  }

  // Fluxo helpers
  const addFluxo = () => setFluxos([...fluxos, { nome: '', modulos: [''] }])
  const removeFluxo = (i: number) => setFluxos(fluxos.filter((_, idx) => idx !== i))
  const updateFluxoNome = (i: number, v: string) => { const f = [...fluxos]; f[i].nome = v; setFluxos(f) }
  const addFluxoModulo = (i: number) => { const f = [...fluxos]; f[i].modulos.push(''); setFluxos(f) }
  const updateFluxoModulo = (fi: number, mi: number, v: string) => {
    const f = [...fluxos]; f[fi].modulos[mi] = v; setFluxos(f)
  }
  const removeFluxoModulo = (fi: number, mi: number) => {
    const f = [...fluxos]; f[fi].modulos = f[fi].modulos.filter((_, idx) => idx !== mi); setFluxos(f)
  }

  return (
    <div className={styles.productWarning}>
      <div className={styles.productWarningIcon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className={styles.productWarningContent}>
        <div className={styles.productWarningTitle}>Contexto do produto necessário</div>
        <div className={styles.productWarningText}>
          Identificamos que este produto <strong>ainda não possui contexto cadastrado</strong>.
          Para prosseguir, preencha as informações abaixo — reserve um tempinho, pois será <strong>uma única vez</strong>.
          Depois disso, todos os bugs deste produto serão gerados com muito mais precisão.
        </div>

        <div className={styles.productForm}>
          {/* Nome do Produto */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nome do Produto *</label>
            <input className={styles.input} style={{ width: '100%' }} placeholder="Ex: ASMOB, Cora - Visitas" value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          {/* Tipo de Aplicação + Usuários */}
          <div className={styles.productFormGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Tipo de Aplicação *</label>
              <div className={styles.checkboxRow}>
                {Object.keys(plataformas).map(plat => (
                  <label key={plat} className={`${styles.checkboxLabel} ${plataformas[plat] ? styles.checkboxLabelActive : ''}`}>
                    <div className={`${styles.checkboxBox} ${plataformas[plat] ? styles.checkboxBoxActive : ''}`}>
                      {plataformas[plat] && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={plataformas[plat]} onChange={() => setPlataformas({ ...plataformas, [plat]: !plataformas[plat] })} style={{ display: 'none' }} />
                    {plat}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Usuários *</label>
              <input className={styles.input} style={{ width: '100%' }} placeholder="Ex: Promotores, Lideranças" value={usuarios} onChange={e => setUsuarios(e.target.value)} />
            </div>
          </div>

          {/* Módulos */}
          <div className={styles.productSectionHeader} onClick={() => setModulosOpen(!modulosOpen)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s ease', transform: modulosOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Módulos *
            <span className={styles.productSectionHint}>— descreva os módulos do produto</span>
          </div>
          {modulosOpen && (
            <div className={styles.productDynamicSection}>
              {modulos.map((m, i) => (
                <div key={i} className={styles.productDynamicRow}>
                  <input className={styles.input} style={{ width: '35%' }} placeholder="Nome do módulo" value={m.nome} onChange={e => updateModulo(i, 'nome', e.target.value)} />
                  <input className={styles.input} style={{ flex: 1 }} placeholder="Breve descrição" value={m.descricao} onChange={e => updateModulo(i, 'descricao', e.target.value)} />
                  {modulos.length > 1 && (
                    <button className={styles.productRemoveBtn} onClick={() => removeModulo(i)} title="Remover módulo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button className={styles.productAddBtn} onClick={addModulo}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar módulo
              </button>
            </div>
          )}

          {/* Fluxos */}
          <div className={styles.productSectionHeader} onClick={() => setFluxosOpen(!fluxosOpen)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s ease', transform: fluxosOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Fluxos
            <span className={styles.productSectionHint}>— opcional, agrupe módulos por fluxo</span>
          </div>
          {fluxosOpen && (
            <div className={styles.productDynamicSection}>
              {fluxos.map((f, fi) => (
                <div key={fi} className={styles.productFluxoCard}>
                  <div className={styles.productDynamicRow}>
                    <input className={styles.input} style={{ flex: 1 }} placeholder="Nome do fluxo (ex: On Trade)" value={f.nome} onChange={e => updateFluxoNome(fi, e.target.value)} />
                    {fluxos.length > 1 && (
                      <button className={styles.productRemoveBtn} onClick={() => removeFluxo(fi)} title="Remover fluxo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div style={{ paddingLeft: 16, marginTop: 8 }}>
                    <span className={styles.label} style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>Módulos do fluxo</span>
                    {f.modulos.map((m, mi) => (
                      <div key={mi} className={styles.productDynamicRow} style={{ marginBottom: 6 }}>
                        <input className={styles.input} style={{ flex: 1 }} placeholder="Nome do módulo" value={m} onChange={e => updateFluxoModulo(fi, mi, e.target.value)} />
                        {f.modulos.length > 1 && (
                          <button className={styles.productRemoveBtn} onClick={() => removeFluxoModulo(fi, mi)} title="Remover">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button className={styles.productAddBtn} onClick={() => addFluxoModulo(fi)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Adicionar módulo ao fluxo
                    </button>
                  </div>
                </div>
              ))}
              <button className={styles.productAddBtn} onClick={addFluxo}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar fluxo
              </button>
            </div>
          )}

          {error && <ErrorBox message={error} />}

          {/* Actions */}
          <div className={styles.productFormActions}>
            <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleSave} disabled={!isValid || saving}>
              {saving ? (<><Spinner size={15} /> Salvando...</>) : 'Salvar Produto e Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Product Identified Badge ────────────────────────────────────────────────

interface ProductBadgeProps {
  product: ProductContext
  onEdit: () => void
}

function ProductIdentifiedBadge({ product, onEdit }: ProductBadgeProps) {
  const modCount = Object.keys(product.modulos).length
  const fluxoCount = Object.keys(product.fluxos).length

  const parts: string[] = []
  if (product.plataformas.length) parts.push(product.plataformas.join(', '))
  if (fluxoCount) parts.push(`${fluxoCount} fluxo${fluxoCount !== 1 ? 's' : ''}`)
  if (modCount) parts.push(`${modCount} módulo${modCount !== 1 ? 's' : ''}`)

  return (
    <div className={styles.productBadge}>
      <div className={styles.productBadgeLeft}>
        <div className={styles.productBadgeDot}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <div className={styles.productBadgeTitle}>Produto identificado</div>
          <div className={styles.productBadgeInfo}>{product.nome} · {parts.join(' · ')}</div>
        </div>
      </div>
      <button className={styles.productEditBtn} onClick={onEdit}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Editar
      </button>
    </div>
  )
}

// ─── BugStep1 ────────────────────────────────────────────────────────────────

interface BugStep1Props {
  active: boolean
  completed: boolean
  itemId: string
  onSubmit: (itemId: string, workItem: WorkItemResult) => void
}

export function BugStep1({ active, completed, itemId: initialId, onSubmit }: BugStep1Props) {
  const [value, setValue] = useState(initialId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<WorkItemResult | null>(null)

  // Product context state
  const [productStatus, setProductStatus] = useState<'idle' | 'checking' | 'not_found' | 'found' | 'editing'>('idle')
  const [product, setProduct] = useState<ProductContext | null>(null)

  const handleSearch = async () => {
    const id = value.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    setResult(null)
    setProductStatus('idle')
    setProduct(null)

    try {
      const response = await api.get(`/api/bugs/search/${id}`)
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao buscar item')

      const item: WorkItemResult = json.data
      setResult(item)

      // Verificar se existe produto cadastrado para este Area Path
      setProductStatus('checking')
      try {
        const prodResponse = await api.get(`/api/bugs/products/check/${encodeURIComponent(item.areaPath)}`)
        const prodJson = await prodResponse.json()

        if (prodJson.success && prodJson.exists) {
          setProduct(prodJson.data)
          setProductStatus('found')
        } else {
          setProductStatus('not_found')
        }
      } catch {
        setProductStatus('not_found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar item')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (result && productStatus === 'found') onSubmit(String(result.id), result)
  }

  const handleCancel = () => {
    setResult(null)
    setValue('')
    setError(null)
    setProductStatus('idle')
    setProduct(null)
  }

  const handleProductSave = (savedProduct: ProductContext) => {
    setProduct(savedProduct)
    setProductStatus('found')
  }

  const canProceed = result && productStatus === 'found'

  return (
    <div className={`${styles.stepBlock} ${active ? styles.stepActive : ''}`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepNumber} ${active ? styles.stepNumberActive : ''} ${completed ? styles.stepNumberDone : ''}`}>
          {completed ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : '1'}
        </div>
        <h2 className={styles.stepTitle}>Buscar Item</h2>
      </div>

      <div className={`${styles.stepContent} ${!active ? styles.stepContentLocked : ''}`}>
        {active ? (
          <>
            <p className={styles.stepHint}>Busque pelo ID do item que deseja vincular o bug.</p>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>ID do Item</label>
              <div className={styles.inputRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Ex: 12345"
                  value={value}
                  onChange={e => setValue(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
                <button className={styles.btnPrimary} onClick={handleSearch} disabled={!value.trim() || loading}>
                  {loading ? <Spinner strokeWidth={2.5} /> : 'Buscar'}
                </button>
              </div>
            </div>

            {error && <ErrorBox message={error} />}

            {result && (
              <>
                <div className={styles.resultCard}>
                  <div className={styles.resultFoundHeader}>
                    <div className={styles.resultFoundIcon}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className={styles.resultFoundLabel}>Item Encontrado</span>
                  </div>

                  <div className={styles.resultTable}>
                    {[
                      { key: 'ID:', value: String(result.id) },
                      { key: 'Tipo:', value: result.type },
                      { key: 'Título:', value: result.title },
                      { key: 'Status:', value: result.state },
                      { key: 'Responsável:', value: result.assignedTo },
                    ].map(row => (
                      <div key={row.key} className={styles.resultRow}>
                        <span className={styles.resultKey}>{row.key}</span>
                        <span className={styles.resultValue}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product context — checking */}
                {productStatus === 'checking' && (
                  <div className={styles.productChecking}>
                    <Spinner size={14} /> Verificando contexto do produto...
                  </div>
                )}

                {/* Product context — not found */}
                {productStatus === 'not_found' && result && (
                  <ProductContextForm
                    areaPath={result.areaPath}
                    onSave={handleProductSave}
                    onCancel={handleCancel}
                  />
                )}

                {/* Product context — editing */}
                {productStatus === 'editing' && result && (
                  <ProductContextForm
                    areaPath={result.areaPath}
                    onSave={handleProductSave}
                    onCancel={() => setProductStatus('found')}
                  />
                )}

                {/* Product context — found */}
                {productStatus === 'found' && product && (
                  <ProductIdentifiedBadge
                    product={product}
                    onEdit={() => setProductStatus('editing')}
                  />
                )}

                <div className={styles.actionRow}>
                  <button className={styles.btnGhost} onClick={handleCancel}>Cancelar</button>
                  <button className={styles.btnPrimary} onClick={handleNext} disabled={!canProceed}>
                    Próximo
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <p className={styles.lockedText}>
            {completed ? `Item #${initialId} vinculado.` : 'Informe o ID do item para liberar esta etapa.'}
          </p>
        )}
      </div>
    </div>
  )
}