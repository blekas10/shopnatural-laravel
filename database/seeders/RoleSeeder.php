<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $simpleRole = Role::firstOrCreate(['name' => 'simple']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Assign admin role to the admin user (admin@example.com or admin@aqsd)
        $adminUser = User::whereIn('email', ['admin@example.com', 'admin@aqsd'])->first();
        if ($adminUser) {
            $adminUser->assignRole('admin');
        }

        // Assign simple role to all other users who don't have a role
        $usersWithoutRole = User::doesntHave('roles')->get();
        foreach ($usersWithoutRole as $user) {
            $user->assignRole('simple');
        }
    }
}
