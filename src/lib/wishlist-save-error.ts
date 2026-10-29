/** Never expose raw exception messages, which can contain server or user data. */
export function getWishlistSaveError(error: unknown) {
  const details = error && typeof error === 'object' ? error : {}
  const name = 'name' in details ? details.name : undefined
  const digest = 'digest' in details ? details.digest : undefined

  if (name === 'NotReadableError') {
    return {
      code: 'IMAGE_NOT_READABLE',
      message:
        'Não foi possível ler o arquivo. Salve uma cópia no aparelho e selecione a imagem novamente. Código: IMAGE_NOT_READABLE',
    }
  }

  const code =
    typeof digest === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(digest)
      ? `SERVER_${digest}`
      : name === 'TypeError'
        ? 'CLIENT_TYPE_ERROR'
        : 'SAVE_FAILED'

  return {
    code,
    message: `Não foi possível salvar o item. Tente novamente. Se persistir, informe este código: ${code}`,
  }
}
