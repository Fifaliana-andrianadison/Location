<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'telephone', 'photo', 'verification_status', 'document_verifie', 'document_path'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_PROPRIETAIRE = 'proprietaire';
    public const ROLE_LOCATAIRE = 'locataire';

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isProprietaire(): bool
    {
        return $this->role === self::ROLE_PROPRIETAIRE;
    }

    public function isLocataire(): bool
    {
        return $this->role === self::ROLE_LOCATAIRE;
    }

    public function isVerified(): bool
    {
        return $this->verification_status === 'verifiee';
    }

    public function proprietes(): HasMany
    {
        return $this->hasMany(Propriete::class, 'user_id');
    }

    public function candidatures(): HasMany
    {
        return $this->hasMany(Candidature::class, 'locataire_id');
    }

    public function contrats(): HasMany
    {
        return $this->hasMany(ContratBail::class, 'locataire_id');
    }

    public function contratsProprietaire(): HasMany
    {
        return $this->hasMany(ContratBail::class, 'proprietaire_id');
    }

    public function locationsAsLocataire(): HasMany
    {
        return $this->hasMany(Location::class, 'locataire_id');
    }

    public function locationsAsProprietaire(): HasMany
    {
        return $this->hasMany(Location::class, 'proprietaire_id');
    }

    public function messagesEnvoyes(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function messagesRecus(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    public function alertesRecherche(): HasMany
    {
        return $this->hasMany(AlerteRecherche::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DocumentLocataire::class);
    }

    public function avisRecus(): HasMany
    {
        return $this->hasMany(Avis::class, 'cible_user_id');
    }

    public function avisDonnes(): HasMany
    {
        return $this->hasMany(Avis::class, 'auteur_id');
    }

    public function litiges(): HasMany
    {
        return $this->hasMany(Litige::class, 'auteur_id');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'document_verifie' => 'boolean',
        ];
    }
}
