<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme o seu email</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h1>Olá {{ $recipientName }},</h1>
    <p>Obrigado por se registar em {{ config('app.name') }}.</p>
    <p>Confirme o seu endereço de email. Este link expira em {{ $expiresDays }} dias.</p>

    <p>
        <a href="{{ $verificationUrl }}" style="display: inline-block; padding: 10px 18px; background: #6b0119; color: #fff; text-decoration: none; border-radius: 6px;">Verificar email</a>
    </p>

    <p>Se não criou esta conta, pode ignorar este email.</p>

    <p>Obrigado,<br>{{ config('app.name') }}</p>
</body>
</html>
