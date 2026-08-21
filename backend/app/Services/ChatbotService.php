<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Assistant conversationnel de la plateforme.
 *
 * Utilise une API compatible OpenAI (OpenAI, OpenRouter, Groq…) configurée
 * via les variables d'environnement :
 *   CHATBOT_API_KEY  — clé API (vide = assistant local à base de règles)
 *   CHATBOT_MODEL    — modèle (défaut : gpt-4o-mini)
 *   CHATBOT_BASE_URL — URL de base du fournisseur (défaut : OpenAI)
 */
class ChatbotService
{
    public function ask(string $message): ?string
    {
        $key = (string) env('CHATBOT_API_KEY', '');

        if ($key === '') {
            return null; // aucun fournisseur configuré → l'assistant local prend le relais
        }

        try {
            $base = rtrim((string) env('CHATBOT_BASE_URL', 'https://api.openai.com/v1'), '/');

            $response = Http::timeout(25)
                ->withToken($key)
                ->post($base.'/chat/completions', [
                    'model' => env('CHATBOT_MODEL', 'gpt-4o-mini'),
                    'messages' => [
                        ['role' => 'system', 'content' => $this->systemPrompt()],
                        ['role' => 'user', 'content' => $message],
                    ],
                    'temperature' => 0.6,
                    'max_tokens' => 400,
                ]);

            if (! $response->successful()) {
                return null;
            }

            $content = $response->json('choices.0.message.content');

            return is_string($content) && trim($content) !== '' ? trim($content) : null;
        } catch (Throwable) {
            return null;
        }
    }

    protected function systemPrompt(): string
    {
        return <<<PROMPT
Tu es l'assistant virtuel de « Tany & Toerana », la plateforme immobilière malgache de
recherche, location et vente (appartements, maisons/villas, terrains).

Réponds toujours en français, de façon chaleureuse, concise (4 à 6 phrases max) et utile.

Fonctionnalités que tu connais parfaitement :
- Recherche par budget min/max (Ar), par type de bien, mode (location/vente), ville et quartier.
- Inscription gratuite : rôles locataire ou propriétaire. L'accès à l'application nécessite une connexion.
- Candidature en ligne avec documents (CIN, justificatifs), suivi dans « Mes candidatures ».
- Contrat de bail PDF généré automatiquement, signature électronique des deux parties (« Mes contrats »).
- Paiement du loyer par Mobile Money : Mvola, Orange Money, Airtel Money, reçus automatiques (« Mes paiements »).
- Alertes automatiques selon le budget, favoris, messagerie interne avec les propriétaires.
- État des lieux d'entrée/sortie, gestion des litiges tracés, avis mutuels après location.
- Tableau de bord : occupation des biens, revenus, impayés (propriétaire) ; candidatures et paiements (locataire).

Si tu ne connais pas la réponse, propose poliment de contacter le support de la plateforme.
N'invente jamais d'annonces, de prix ou de disponibilités précises : redirige vers la recherche de l'application.
PROMPT;
    }
}
