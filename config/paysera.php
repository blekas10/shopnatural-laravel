<?php

return [
    'project_id' => env('PAYSERA_PROJECT_ID'),
    'sign_password' => env('PAYSERA_SIGN_PASSWORD'),
    'test_mode' => env('PAYSERA_TEST_MODE', true),
    'currency' => env('PAYSERA_CURRENCY', 'EUR'),
];
