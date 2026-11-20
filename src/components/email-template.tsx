import * as React from 'react'

export const OtpEmailTemplate: React.FC<Readonly<{ otp: string }>> = ({ otp }) => (
  <div>
    <h1>Seu código de acesso ao Presenteio</h1>
    <p>Digite este código para entrar ou criar sua conta:</p>
    <p style={{ fontSize: 32, letterSpacing: 4, fontWeight: 'bold' }}>{otp}</p>
    <p>O código expira em 10 minutos. Se você não pediu o acesso, ignore este email.</p>
  </div>
)
