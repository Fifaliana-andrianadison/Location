<?php

namespace App\Providers;

use App\Events\CandidatureRecue;
use App\Events\PaiementEffectue;
use App\Listeners\EnvoyerNotificationProprietaire;
use App\Listeners\GenererRecu;
use App\Models\Propriete;
use App\Models\User;
use App\Observers\ProprieteObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);

        Propriete::observe(ProprieteObserver::class);

        Event::listen(
            CandidatureRecue::class,
            EnvoyerNotificationProprietaire::class
        );
        Event::listen(
            PaiementEffectue::class,
            GenererRecu::class
        );

        Gate::define('manage-users', fn (User $user) => $user->isAdmin());
    }
}