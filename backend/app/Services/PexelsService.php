<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PexelsService
{
    protected readonly string $apiKey;

    public function __construct()
    {
        $this->apiKey = (string) env('PEXELS_API_KEY', '');
    }

    public function search(string $query, int $perPage = 6): array
    {
        if ($this->apiKey === '') {
            return [];
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => $this->apiKey,
                ])
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $query,
                    'per_page' => $perPage,
                    'orientation' => 'landscape',
                ]);

            if (! $response->successful()) {
                return [];
            }

            return collect($response->json('photos') ?? [])
                ->map(fn ($p) => [
                    'url' => $p['src']['large2x'] ?? $p['src']['large'] ?? $p['src']['medium'],
                    'caption' => $p['alt'] ?? null,
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }
}
