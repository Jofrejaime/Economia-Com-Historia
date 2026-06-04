<?php

namespace App\Support;

final class AngolaProvinces
{
    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            'Bengo',
            'Benguela',
            'Bié',
            'Cabinda',
            'Cuando Cubango',
            'Cuanza Norte',
            'Cuanza Sul',
            'Cunene',
            'Huambo',
            'Huíla',
            'Luanda',
            'Lunda Norte',
            'Lunda Sul',
            'Malanje',
            'Moxico',
            'Namibe',
            'Uíge',
            'Zaire',
        ];
    }

    public static function validationRule(): string
    {
        return 'in:'.implode(',', self::all());
    }
}
