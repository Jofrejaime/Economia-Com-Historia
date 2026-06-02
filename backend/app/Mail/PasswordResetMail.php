<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class PasswordResetMail extends Mailable
{
    public function __construct(
        public readonly string $recipientName,
        public readonly string $resetUrl,
        public readonly int $expiresMinutes = 60,
    ) {
        $this->subject('Redefinição de palavra-passe');
    }

    public function build(): self
    {
        return $this->view('emails.password-reset')
            ->with([
                'recipientName' => $this->recipientName,
                'resetUrl' => $this->resetUrl,
                'expiresMinutes' => $this->expiresMinutes,
            ]);
    }
}
