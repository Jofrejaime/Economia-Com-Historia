<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de palavra-passe</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h1>Olá {{ $recipientName }},</h1>
    <p>Recebemos um pedido para redefinir a sua palavra-passe.</p>
    <p>Este link expira em {{ $expiresMinutes }} minutos.</p>

    <p>
        <a href="{{ $resetUrl }}" style="display: inline-block; padding: 10px 18px; background: #6b0119; color: #fff; text-decoration: none; border-radius: 6px;">Redefinir palavra-passe</a>
    </p>

    <p>Se não pediu esta alteração, pode ignorar este email.</p>

    <p>Obrigado,<br>{{ config('app.name') }}</p>
</body>
</html>
