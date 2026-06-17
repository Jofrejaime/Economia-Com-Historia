<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class EmailVerificationMail extends Mailable
{
    public function __construct(
        public readonly string $recipientName,
        public readonly string $verificationUrl,
        public readonly int $expiresDays = 3,
    ) {
        $this->subject('Confirme o seu email');
    }

    public function build(): self
    {
        return $this->view('emails.email-verification')
            ->with([
                'recipientName' => $this->recipientName,
                'verificationUrl' => $this->verificationUrl,
                'expiresDays' => $this->expiresDays,
            ]);
    }
}
