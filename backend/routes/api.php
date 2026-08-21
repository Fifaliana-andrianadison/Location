<?php

use App\Http\Controllers\Api\Admin\StatistiqueController;
use App\Http\Controllers\Api\Admin\ValidationController;
use App\Http\Controllers\Api\AlerteRechercheController;
use App\Http\Controllers\Api\AnnonceController;
use App\Http\Controllers\Api\AppartementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\CandidatureController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\ContratController;
use App\Http\Controllers\Api\EtatDesLieuxController;
use App\Http\Controllers\Api\FavoriController;
use App\Http\Controllers\Api\LitigeController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MaisonController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\ProprieteController;
use App\Http\Controllers\Api\TerrainController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques (recherche par budget sans authentification)
|--------------------------------------------------------------------------
*/
Route::get('annonces', [AnnonceController::class, 'index']);
Route::get('annonces/{annonce}', [AnnonceController::class, 'show']);

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

/*
| Assistant conversationnel (chatbot) — accès public
*/
Route::post('chatbot', [ChatbotController::class, 'ask']);

/*
|--------------------------------------------------------------------------
| Routes authentifiées
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('stats/proprietaire', [StatistiqueController::class, 'proprietaire']);

    /*
    | Biens immobiliers (CRUD) — publication par propriétaire vérifié
    */
    Route::middleware('role:proprietaire,admin')->group(function () {
        Route::apiResource('proprietes', ProprieteController::class)->except(['index']);
        Route::apiResource('maisons', MaisonController::class)->except(['show']);
        Route::apiResource('appartements', AppartementController::class)->except(['show']);
        Route::apiResource('terrains', TerrainController::class)->except(['show']);
    });

    Route::get('proprietes', [ProprieteController::class, 'index']);

    /*
    | Candidatures
    */
    Route::apiResource('candidatures', CandidatureController::class);

    /*
    | Contrats de bail + signature électronique + PDF
    */
    Route::apiResource('contrats', ContratController::class);
    Route::post('contrats/{contrat}/signer', [ContratController::class, 'signer']);
    Route::get('contrats/{contrat}/pdf', [ContratController::class, 'pdf']);

    /*
    | Locations actives
    */
    Route::get('locations', [LocationController::class, 'index']);
    Route::get('locations/{location}', [LocationController::class, 'show']);
    Route::put('locations/{location}', [LocationController::class, 'update']);

    /*
    | Paiements loyer (Mobile Money / espèces)
    */
    Route::post('locations/{location}/paiements', [PaiementController::class, 'store']);
    Route::get('paiements', [PaiementController::class, 'index']);
    Route::post('paiements/{paiement}/confirmer', [PaiementController::class, 'confirmer']);
    Route::delete('paiements/{paiement}', [PaiementController::class, 'destroy']);

    /*
    | États des lieux
    */
    Route::apiResource('etats-des-lieux', EtatDesLieuxController::class)->only(['index', 'store']);
    Route::post('etats-des-lieux/{etat}/signer', [EtatDesLieuxController::class, 'signer']);

    /*
    | Messagerie interne
    */
    Route::get('messages/conversations', [MessageController::class, 'conversations']);
    Route::get('messages', [MessageController::class, 'index']);
    Route::post('messages', [MessageController::class, 'store']);

    /*
    | Notifications
    */
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/non-lus', [NotificationController::class, 'nonLus']);
    Route::patch('notifications/lues', [NotificationController::class, 'toutMarquerLue']);
    Route::patch('notifications/{notification}/lue', [NotificationController::class, 'marquerLue']);

    /*
    | Avis / notation mutuelle
    */
    Route::apiResource('avis', AvisController::class)->only(['index', 'store']);

    /*
    | Favoris
    */
    Route::get('favoris', [FavoriController::class, 'index']);
    Route::post('favoris', [FavoriController::class, 'store']);
    Route::get('favoris/{annonce_id}/check', [FavoriController::class, 'isFavori']);
    Route::delete('favoris/{annonce_id}', [FavoriController::class, 'destroy']);

    /*
    | Alertes de recherche automatique
    */
    Route::apiResource('alertes-recherche', AlerteRechercheController::class);

    /*
    | Litiges
    */
    Route::apiResource('litiges', LitigeController::class)->only(['index', 'store', 'show']);
});

/*
|--------------------------------------------------------------------------
| Routes admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('validations', [ValidationController::class, 'index']);
    Route::post('validations/{propriete}/valider', [ValidationController::class, 'valider']);
    Route::post('validations/{propriete}/rejeter', [ValidationController::class, 'rejeter']);
    Route::post('proprietaires/{user}/verifier', [ValidationController::class, 'verifierProprietaire']);

    Route::get('statistiques', [StatistiqueController::class, 'index']);
});
