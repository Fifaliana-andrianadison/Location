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
            return $this->fallback($query, $perPage);
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
            return $this->fallback($query, $perPage);
        }
    }

    /**
     * Photos Unsplash de secours : garantit des images même sans clé Pexels.
     */
    protected function fallback(string $query, int $perPage = 4): array
    {
        $q = strtolower($query);
        if (str_contains($q, 'villa') || str_contains($q, 'house') || str_contains($q, 'maison')) {
            $ids = [
                'photo-1568605114967-8130f3a36994',
                'photo-1600596542815-ffad4c1539a9',
                'photo-1600585154340-be6161a56a0c',
                'photo-1570129477492-45c003edd2be',
            ];
        } elseif (str_contains($q, 'land') || str_contains($q, 'terrain') || str_contains($q, 'field') || str_contains($q, 'agricultural')) {
            $ids = [
                'photo-1500382017468-9049fed747ef',
                'photo-1625246333195-78d9c38ad449',
                'photo-1500076656116-558758c991c1',
                'photo-1464082354059-27db6ce50048',
            ];
        } else {
            $ids = [
                'photo-1522708323590-d24dbb6b0267',
                'photo-1502672260266-1c1ef2d93688',
                'photo-1554995207-c18c203602cb',
                'photo-1493809842364-78817add7ffb',
                'photo-1560448204-e02f11c3d0e2',
            ];
        }

        return collect(array_slice($ids, 0, max(1, $perPage)))
            ->map(fn ($id, $i) => [
                'url' => "https://images.unsplash.com/{$id}?w=800&q=80&auto=format&fit=crop",
                'caption' => $query.' #'.($i + 1),
            ])
            ->values()
            ->all();
    }
}
