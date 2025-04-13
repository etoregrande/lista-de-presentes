import * as React from 'react';

interface EmailTemplateProps {
    firstName: string;
    url: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    firstName,
    url
}) => (
    <div>
        <h1>Olá,</h1>
        <p>Você pediu para redefinir sua senha.</p>
        <p>
            Clique no link abaixo para continuar:
        </p>
        <a href={url} style={{ color: '#0070f3' }}>{url}</a>
        <p>Se você não pediu isso, pode ignorar este e-mail.</p>
    </div>
);