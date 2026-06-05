import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import sheetsApi from '../../services/sheetsApi.js'
import { useToast } from '../../hooks/useToast.jsx'

/**
 * ChangePasswordModal — cambio de contraseña del usuario logueado.
 * No toca la tabla `usuarios`: Supabase actualiza el hash con la sesión activa.
 *
 * Props:
 *   onClose() → cerrar el modal (también se llama al confirmar con éxito)
 */
export default function ChangePasswordModal({ onClose }) {
  const { toast } = useToast()
  const [form, setForm]       = useState({ password: '', confirm: '' })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && !loading) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, loading])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validaciones de cliente
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await sheetsApi.auth.actualizarPassword(form.password)
      toast.success('Contraseña actualizada correctamente')
      onClose()
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña')
      toast.error(err.message || 'No se pudo actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  // Estilo de inputs (mismo lenguaje visual que el login)
  const inputStyle = {
    width: '100%',
    padding: '.8rem 1rem',
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '.9rem',
    outline: 'none',
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    color: '#fff',
    caretColor: '#ebc32b',
    transition: 'all .15s',
  }
  const onFocus = e => {
    e.target.style.borderColor = 'rgba(235,195,43,.55)'
    e.target.style.background  = 'rgba(235,195,43,.06)'
    e.target.style.boxShadow   = '0 0 0 3px rgba(235,195,43,.1)'
  }
  const onBlur = e => {
    e.target.style.borderColor = 'rgba(255,255,255,.12)'
    e.target.style.background  = 'rgba(255,255,255,.06)'
    e.target.style.boxShadow   = 'none'
  }
  const labelStyle = {
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: '.7rem',
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: 'rgba(235,195,43,.8)',
    marginBottom: '.5rem',
  }

  return createPortal(
    <div
      onClick={() => { if (!loading) onClose() }}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100dvh',
        background: 'rgba(2,15,39,0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'cpm-fade .2s ease both',
      }}
    >
      <style>{`
        @keyframes cpm-fade  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cpm-scale { from { opacity: 0; transform: translateY(12px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes cpm-spin  { to { transform: rotate(360deg) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: 'linear-gradient(145deg, rgba(15,43,79,0.98) 0%, rgba(12,24,43,0.98) 100%)',
          border: '1px solid rgba(235,195,43,0.18)',
          borderRadius: 16,
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          padding: '1.6rem',
          fontFamily: "'DM Sans', sans-serif",
          animation: 'cpm-scale .25s ease both',
        }}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(235,195,43,.15)', color: '#ebc32b',
            border: '1px solid rgba(235,195,43,.4)', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              margin: 0, fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.5rem', letterSpacing: '.02em', color: '#fff', lineHeight: 1.1,
            }}>
              Cambiar contraseña
            </h3>
            <p style={{ margin: '.1rem 0 0', fontSize: '.78rem', color: '#8499c2' }}>
              Elegí una nueva contraseña para tu cuenta.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nueva contraseña */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="cpm-password" style={labelStyle}>Nueva contraseña</label>
            <input
              id="cpm-password"
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              autoFocus
              autoComplete="new-password"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {/* Confirmar nueva contraseña */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="cpm-confirm" style={labelStyle}>Confirmar nueva contraseña</label>
            <input
              id="cpm-confirm"
              type="password"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••"
              autoComplete="new-password"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', margin: '.45rem 0 0' }}>
              Mínimo 6 caracteres.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '.55rem',
              padding: '.7rem .85rem', borderRadius: 10, marginBottom: '1rem',
              background: 'rgba(255,77,109,.1)', border: '1px solid rgba(255,77,109,.35)',
              color: '#ff8097', fontSize: '.82rem',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'stretch' }}>
            <button
              type="button"
              onClick={() => { if (!loading) onClose() }}
              disabled={loading}
              style={{
                flex: 1, padding: '.75rem', borderRadius: 9,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
                background: 'transparent', border: '1px solid rgba(132,153,194,0.25)',
                color: '#8499c2', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all .15s', opacity: loading ? .5 : 1,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.borderColor = 'rgba(132,153,194,0.25)'; e.currentTarget.style.color = '#8499c2' } }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1.4, padding: '.75rem', borderRadius: 9,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
                background: 'linear-gradient(135deg, #ebc32b 0%, #c99f16 100%)',
                color: '#05090f', border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 6px 24px rgba(235,195,43,.3)', transition: 'all .15s',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                opacity: loading ? .8 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = '' }}
            >
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'cpm-spin .8s linear infinite' }} />
                  Guardando...
                </>
              ) : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
