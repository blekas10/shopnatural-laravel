<?php

return [
    'project_id' => env('PAYSERA_PROJECT_ID'),
    'sign_password' => env('PAYSERA_SIGN_PASSWORD'),
    'test_mode' => filter_var(env('PAYSERA_TEST_MODE', true), FILTER_VALIDATE_BOOLEAN),
    'currency' => env('PAYSERA_CURRENCY', 'EUR'),
];
