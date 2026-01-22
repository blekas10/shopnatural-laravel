<?php

return [

    'backup' => [
        /*
         * The name of this application. You can use this name to monitor
         * the backups.
         */
        'name' => env('APP_NAME', 'Shop Natural'),

        'source' => [
            'files' => [
                /*
                 * The list of directories and files that will be included in the backup.
                 * We only backup essential data, not the full codebase (that's in git).
                 */
                'include' => [
                    storage_path('app/public'),      // Product images
                    storage_path('app/invoices'),    // Invoice PDFs
                    storage_path('app/venipak-labels'), // Shipping labels
                ],

                /*
                 * These directories and files will be excluded from the backup.
                 */
                'exclude' => [
                    storage_path('app/backup-temp'),
                ],

                /*
                 * Determines if symlinks should be followed.
                 */
                'follow_links' => false,

                /*
                 * Determines if it should avoid unreadable folders.
                 */
                'ignore_unreadable_directories' => true,

                /*
                 * Determines if it should avoid non-existing folders.
                 */
                'ignore_missing_directories' => true,

                /*
                 * This path is used to make directories in resulting zip-file relative
                 */
                'relative_path' => storage_path('app'),
            ],

            /*
             * The names of the connections to the databases that should be backed up
             */
            'databases' => [
                env('DB_CONNECTION', 'mysql'),
            ],
        ],

        /*
         * The database dump can be compressed to decrease disk space usage.
         */
        'database_dump_compressor' => \Spatie\DbDumper\Compressors\GzipCompressor::class,

        /*
         * If specified, the database dumped file name will contain a timestamp.
         */
        'database_dump_file_timestamp_format' => 'Y-m-d-H-i-s',

        /*
         * The base of the dump filename
         */
        'database_dump_filename_base' => 'database',

        /*
         * The file extension used for the database dump files.
         */
        'database_dump_file_extension' => '',

        'destination' => [
            /*
             * The compression algorithm to be used for creating the zip archive.
             */
            'compression_method' => ZipArchive::CM_DEFAULT,

            /*
             * The compression level (1-9, higher = better compression but slower)
             */
            'compression_level' => 9,

            /*
             * The filename prefix used for the backup zip file.
             */
            'filename_prefix' => '',

            /*
             * The disk names on which the backups will be stored.
             */
            'disks' => [
                'backups',
            ],
        ],

        /*
         * The directory where the temporary files will be stored.
         */
        'temporary_directory' => storage_path('app/backup-temp'),

        /*
         * The password to be used for archive encryption.
         * Set to `null` to disable encryption.
         */
        'password' => env('BACKUP_ARCHIVE_PASSWORD'),

        /*
         * The encryption algorithm to be used for archive encryption.
         */
        'encryption' => 'default',

        /*
         * The number of attempts, in case the backup command encounters an exception
         */
        'tries' => 1,

        /*
         * The number of seconds to wait before attempting a new backup if the previous try failed
         */
        'retry_delay' => 0,
    ],

    /*
     * Notifications configuration - get notified on failures
     */
    'notifications' => [
        'notifications' => [
            \Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification::class => ['mail'],
            // Only notify on failures, not on success (reduce noise)
            \Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification::class => [],
            \Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification::class => [],
            \Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification::class => [],
        ],

        /*
         * Here you can specify the notifiable to which the notifications should be sent.
         */
        'notifiable' => \Spatie\Backup\Notifications\Notifiable::class,

        'mail' => [
            'to' => env('BACKUP_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS', 'admin@shopnatural.lt')),

            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'noreply@shopnatural.lt'),
                'name' => env('MAIL_FROM_NAME', 'Shop Natural Backups'),
            ],
        ],

        'slack' => [
            'webhook_url' => '',
            'channel' => null,
            'username' => null,
            'icon' => null,
        ],

        'discord' => [
            'webhook_url' => '',
            'username' => '',
            'avatar_url' => '',
        ],
    ],

    /*
     * Monitor backups to ensure they're healthy
     */
    'monitor_backups' => [
        [
            'name' => env('APP_NAME', 'Shop Natural'),
            'disks' => ['backups'],
            'health_checks' => [
                // Alert if no backup in 2 days (gives buffer for daily backups)
                \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays::class => 2,
                // Alert if backups exceed 2GB
                \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes::class => 2000,
            ],
        ],
    ],

    'cleanup' => [
        /*
         * The strategy that will be used to cleanup old backups.
         */
        'strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,

        'default_strategy' => [
            /*
             * Keep all backups for 7 days
             */
            'keep_all_backups_for_days' => 7,

            /*
             * After 7 days, keep one backup per day for 14 more days
             */
            'keep_daily_backups_for_days' => 14,

            /*
             * After that, keep weekly backups for 4 weeks
             */
            'keep_weekly_backups_for_weeks' => 4,

            /*
             * Then monthly backups for 3 months
             */
            'keep_monthly_backups_for_months' => 3,

            /*
             * Then yearly backups for 1 year
             */
            'keep_yearly_backups_for_years' => 1,

            /*
             * Delete oldest backups when exceeding 2GB
             */
            'delete_oldest_backups_when_using_more_megabytes_than' => 2000,
        ],

        'tries' => 1,
        'retry_delay' => 0,
    ],

];
