<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectText ?? 'Convite' }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h1>Olá {{ $recipientName }},</h1>
    <p>{{ $messageText }}</p>

    @if ($actionUrl)
        <p>
            <a href="{{ $actionUrl }}" style="display: inline-block; padding: 10px 18px; background: #2d3748; color: #fff; text-decoration: none; border-radius: 6px;">Ver convite</a>
        </p>
    @endif

    <p>Obrigado,<br>{{ config('app.name') }}</p>
</body>
</html>
