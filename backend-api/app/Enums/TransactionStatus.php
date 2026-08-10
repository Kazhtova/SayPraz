<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case RETURNED = 'returned';
    case OVERDUE = 'overdue';
}