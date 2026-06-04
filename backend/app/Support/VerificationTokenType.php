<?php

namespace App\Support;

final class VerificationTokenType
{
    public const EMAIL_VERIFICATION = 'email_verification';

    public const PASSWORD_RESET = 'password_reset';

    public const INVITE = 'invite';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::EMAIL_VERIFICATION,
            self::PASSWORD_RESET,
            self::INVITE,
        ];
    }
}
