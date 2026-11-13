<?php

namespace Tests\Feature;

use App\Models\Annonce;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function u(string $role, ?string $n = null): User
    {
        $n ??= $role;

        return User::create(['name' => $n, 'email' => "$n@t.io", 'password' => 'password1', 'role' => $role]);
    }

    private function bien(User $owner): Annonce
    {
        $r = $this->actingAs($owner, 'sanctum')->postJson('/api/proprietes', [
            'type' => 'maison', 'mode' => 'location', 'titre' => 'Maison', 'prix' => 500000, 'ville' => 'Tana',
        ])->assertCreated();

        return Annonce::where('propriete_id', $r->json('id'))->firstOrFail();
    }

    public function test_bien_de_proprietaire_attend_validation_admin(): void
    {
        $a = $this->bien($this->u('proprietaire'));
        $this->assertSame('en_attente', $a->verification);
        $this->getJson('/api/annonces')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_per_page_invalide_ne_plante_pas(): void
    {
        $this->getJson('/api/annonces?per_page=-5')->assertStatus(422);
        $this->getJson('/api/annonces?per_page=5')->assertOk();
    }

    public function test_autre_proprietaire_ne_modifie_pas_un_bien(): void
    {
        $p = $this->u('proprietaire');
        $p2 = $this->u('proprietaire', 'p2');
        $a = $this->bien($p);

        $this->actingAs($p2, 'sanctum')->putJson('/api/maisons/1', ['nb_chambres' => 9])->assertForbidden();
        $this->actingAs($p2, 'sanctum')->postJson('/api/maisons', ['propriete_id' => $a->propriete_id])->assertForbidden();
        $this->actingAs($p2, 'sanctum')->postJson('/api/appartements', ['propriete_id' => $a->propriete_id, 'prix' => 1])->assertForbidden();
        $this->actingAs($p, 'sanctum')->deleteJson('/api/maisons/1')->assertOk();
    }

    public function test_locataire_ne_peut_pas_accepter_sa_candidature(): void
    {
        $p = $this->u('proprietaire');
        $l = $this->u('locataire');
        $a = $this->bien($p);
        $a->update(['verification' => 'verifiee']);

        $this->actingAs($p, 'sanctum')->postJson('/api/candidatures', ['annonce_id' => $a->id])->assertForbidden();
        $id = $this->actingAs($l, 'sanctum')->postJson('/api/candidatures', ['annonce_id' => $a->id])->assertCreated()->json('id');

        $this->actingAs($l, 'sanctum')->putJson("/api/candidatures/$id", ['statut' => 'acceptee'])->assertStatus(422);
        $this->actingAs($p, 'sanctum')->putJson("/api/candidatures/$id", ['statut' => 'acceptee'])->assertOk();
        $this->actingAs($l, 'sanctum')->deleteJson("/api/candidatures/$id")->assertOk();
    }

    public function test_signature_ne_cree_qu_une_location(): void
    {
        $p = $this->u('proprietaire');
        $l = $this->u('locataire');
        $a = $this->bien($p);

        $k = $this->actingAs($p, 'sanctum')->postJson('/api/contrats', [
            'annonce_id' => $a->id, 'locataire_id' => $l->id,
            'date_debut' => '2026-01-01', 'date_fin' => '2027-01-01', 'loyer_mensuel' => 500000,
        ])->assertCreated()->json('id');

        $this->actingAs($p, 'sanctum')->postJson("/api/contrats", [
            'annonce_id' => $a->id, 'locataire_id' => $p->id,
            'date_debut' => '2026-01-01', 'date_fin' => '2027-01-01', 'loyer_mensuel' => 1,
        ])->assertStatus(422);

        $this->actingAs($l, 'sanctum')->postJson("/api/contrats/$k/signer", ['signature' => 's'])->assertOk();
        $this->actingAs($l, 'sanctum')->postJson("/api/contrats/$k/signer", ['signature' => 's'])->assertStatus(422);
        $this->actingAs($p, 'sanctum')->postJson("/api/contrats/$k/signer", ['signature' => 's'])->assertOk();
        $this->actingAs($p, 'sanctum')->postJson("/api/contrats/$k/signer", ['signature' => 's'])->assertStatus(422);

        $this->assertSame(1, Location::count());
        $this->actingAs($p, 'sanctum')->putJson("/api/contrats/$k", ['statut' => 'brouillon'])->assertStatus(405);
    }

    public function test_messages_et_avis_restreints(): void
    {
        $l = $this->u('locataire');
        $l2 = $this->u('locataire', 'l2');
        $p = $this->u('proprietaire');

        $this->actingAs($l, 'sanctum')->postJson('/api/messages', ['receiver_id' => $l->id, 'contenu' => 'x'])->assertStatus(422);
        $this->actingAs($l, 'sanctum')->postJson('/api/messages', ['receiver_id' => $l2->id, 'contenu' => 'x'])->assertStatus(422);
        $this->actingAs($l, 'sanctum')->postJson('/api/messages', ['receiver_id' => $p->id, 'contenu' => 'x'])->assertCreated();
        $this->actingAs($l, 'sanctum')->getJson('/api/messages')->assertStatus(422);

        $this->actingAs($l, 'sanctum')->postJson('/api/avis', ['cible_user_id' => $l->id, 'note' => 5])->assertStatus(422);
        $this->actingAs($l2, 'sanctum')->postJson('/api/avis', ['cible_user_id' => $p->id, 'note' => 1])->assertStatus(422);
    }

    public function test_paiement_regles(): void
    {
        $p = $this->u('proprietaire');
        $l = $this->u('locataire');
        $a = $this->bien($p);
        $k = $this->actingAs($p, 'sanctum')->postJson('/api/contrats', [
            'annonce_id' => $a->id, 'locataire_id' => $l->id,
            'date_debut' => '2026-01-01', 'date_fin' => '2027-01-01', 'loyer_mensuel' => 500000,
        ])->json('id');
        $this->actingAs($l, 'sanctum')->postJson("/api/contrats/$k/signer", ['signature' => 's']);
        $this->actingAs($p, 'sanctum')->postJson("/api/contrats/$k/signer", ['signature' => 's']);
        $loc = Location::firstOrFail();
        $url = "/api/locations/{$loc->id}/paiements";

        $this->actingAs($p, 'sanctum')->postJson($url, ['mois' => '2026-02', 'montant' => 500000, 'methode' => 'especes'])->assertForbidden();
        $this->actingAs($l, 'sanctum')->postJson($url, ['mois' => '2026-02', 'montant' => 1, 'methode' => 'especes'])->assertStatus(422);
        $id = $this->actingAs($l, 'sanctum')->postJson($url, ['mois' => '2026-02', 'montant' => 500000, 'methode' => 'virement'])
            ->assertCreated()->assertJsonPath('reference', fn ($r) => str_starts_with($r, 'VIR-'))->json('id');
        $this->actingAs($l, 'sanctum')->postJson($url, ['mois' => '2026-02', 'montant' => 500000, 'methode' => 'especes'])->assertStatus(422);

        $this->actingAs($p, 'sanctum')->postJson("/api/paiements/$id/confirmer")->assertOk();
        $this->actingAs($p, 'sanctum')->postJson("/api/paiements/$id/confirmer")->assertStatus(422);

        $stats = $this->actingAs($p, 'sanctum')->getJson('/api/stats/proprietaire')->assertOk();
        $this->assertSame(1, $stats->json('locations.actives'));
    }

    public function test_alertes_et_login(): void
    {
        $l = $this->u('locataire');
        $this->actingAs($l, 'sanctum')->postJson('/api/alertes-recherche', ['ville' => 'Tana'])->assertCreated();
        $this->postJson('/api/login', ['email' => 'inconnu@x.io', 'password' => 'x'])
            ->assertStatus(422)->assertJsonPath('message', 'Email ou mot de passe incorrect.');
    }
}
