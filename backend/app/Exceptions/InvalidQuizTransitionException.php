<?php

namespace App\Exceptions;

use App\Enums\QuizStatus;

class InvalidQuizTransitionException extends \RuntimeException
{
    public function __construct(
        public readonly QuizStatus $currentStatus,
        public readonly QuizStatus $targetStatus,
    ) {
        parent::__construct(
            "Cannot transition from {$currentStatus->value} to {$targetStatus->value}."
        );
    }
}
