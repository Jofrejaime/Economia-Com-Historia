<?php

namespace App\Exceptions;

class QuizNotFoundException extends \RuntimeException
{
    public function __construct(string $quizId = '')
    {
        parent::__construct($quizId
            ? "Quiz '{$quizId}' not found."
            : 'Quiz not found.'
        );
    }
}
