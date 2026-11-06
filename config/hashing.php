<?php

return [

    /*
    | O schema exige: passwords = argon2id. senhas nunca em texto puro.
    |
    */

    'default' => env('HASH_DRIVER', 'argon2id'),

    'bcrypt' => [
        'rounds' => env('BCRYPT_ROUNDS', 12),
        'verify' => env('HASH_VERIFY', true),
        'timeout' => 60,
    ],

    'argon' => [
        'memory' => 65536,
        'threads' => 1,
        'time' => 4,
    ],

];