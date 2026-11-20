import * as React from 'react'

export const otpEmailText = (otp: string) => `Seu código de acesso é:

${otp}

Digite este código na página de login em que você o solicitou.
Ele vale por 10 minutos e só pode ser usado uma vez.
Se você não solicitou este e-mail, ignore esta mensagem.`

export const OtpEmailTemplate: React.FC<Readonly<{ otp: string }>> = ({ otp }) => (
  <div>
    <p>Seu código de acesso é:</p>
    <p><strong style={{ fontSize: 32, letterSpacing: 4 }}>{otp}</strong></p>
    <p>Digite este código na página de login em que você o solicitou.</p>
    <p>Ele vale por 10 minutos e só pode ser usado uma vez.</p>
    <p>Se você não solicitou este e-mail, ignore esta mensagem.</p>
  </div>
)
