<?php

namespace App\Support;

final class PointTransactionReason
{
    public const QUIZ_COMPLETION = 'quiz_completion';

    public const QUIZ_BONUS_ACCURACY = 'quiz_bonus_accuracy';

    public const QUIZ_BONUS_SPEED = 'quiz_bonus_speed';

    public const DOCUMENT_UPLOAD = 'document_upload';

    public const TOPIC_CREATED = 'topic_created';

    public const REPLY_POSTED = 'reply_posted';

    public const DOCUMENT_LIKED = 'document_liked';

    public const ADMIN_ADJUSTMENT = 'admin_adjustment';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::QUIZ_COMPLETION,
            self::QUIZ_BONUS_ACCURACY,
            self::QUIZ_BONUS_SPEED,
            self::DOCUMENT_UPLOAD,
            self::TOPIC_CREATED,
            self::REPLY_POSTED,
            self::DOCUMENT_LIKED,
            self::ADMIN_ADJUSTMENT,
        ];
    }
}
