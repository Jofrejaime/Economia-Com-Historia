<?php

namespace App\Enums;

enum QuizStatus: string
{
    case DRAFT     = 'draft';
    case REVIEW    = 'review';
    case PUBLISHED = 'published';
    case ARCHIVED  = 'archived';
}
