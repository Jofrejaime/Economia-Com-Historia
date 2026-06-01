<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Markdown;

class InviteMail extends Mailable
{
    public function __construct(
        public readonly string $subjectText,
        public readonly string $recipientName,
        public readonly string $messageText,
        public readonly ?string $actionUrl = null,
    ) {
        $this->subject($subjectText);
    }

    public function build(): self
    {
        return $this->view('emails.invite')
            ->with([
                'recipientName' => $this->recipientName,
                'messageText' => $this->messageText,
                'actionUrl' => $this->actionUrl,
            ]);
    }
}
