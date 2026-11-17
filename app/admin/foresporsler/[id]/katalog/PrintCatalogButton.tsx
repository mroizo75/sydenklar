'use client'

export function PrintCatalogButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{
        background: '#E5623E',
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        padding: '8px 14px',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      Skriv ut / lagre som PDF
    </button>
  )
}
