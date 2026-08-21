<?php

namespace Database\Seeders;

use App\Models\AlerteRecherche;
use App\Models\Annonce;
use App\Models\Appartement;
use App\Models\Avis;
use App\Models\Candidature;
use App\Models\Colocataire;
use App\Models\ContratBail;
use App\Models\DocumentLocataire;
use App\Models\EtatDesLieux;
use App\Models\FactureElectricite;
use App\Models\Favori;
use App\Models\HistoriquePrix;
use App\Models\Litige;
use App\Models\Localisation;
use App\Models\Location;
use App\Models\Maison;
use App\Models\Message;
use App\Models\Notification;
use App\Models\PaiementLoyer;
use App\Models\Propriete;
use App\Models\Terrain;
use App\Models\User;
use App\Services\PexelsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(PexelsService $pexels): void
    {
        $this->command?->info('Ajout des données de démonstration…');

        User::firstOrCreate(
            ['email' => 'admin@tanytoerana.mg'],
            ['name' => 'Administrateur', 'password' => Hash::make('admin123'), 'role' => User::ROLE_ADMIN]
        );

        $proprietaires = collect([
            ['name' => 'Rakotoarisoa Mamy', 'email' => 'proprio1@tanytoerana.mg', 'telephone' => '034 11 222 33'],
            ['name' => 'Rasoa Voahangy', 'email' => 'proprio2@tanytoerana.mg', 'telephone' => '033 44 555 66'],
            ['name' => 'Andrianarivo Hery', 'email' => 'proprio3@tanytoerana.mg', 'telephone' => '032 77 888 99'],
        ])->map(fn ($data) => User::firstOrCreate(
            ['email' => $data['email']],
            $data + [
                'password' => Hash::make('password'),
                'role' => User::ROLE_PROPRIETAIRE,
                'verification_status' => 'verifiee',
                'document_verifie' => true,
            ]
        ));

        $locataires = collect([
            ['name' => 'Raharimanana Naina', 'email' => 'loc1@tanytoerana.mg', 'telephone' => '034 12 345 67'],
            ['name' => 'Randriamanana Tovo', 'email' => 'loc2@tanytoerana.mg', 'telephone' => '033 98 765 43'],
            ['name' => 'Ratsimbazafy Lalao', 'email' => 'loc3@tanytoerana.mg', 'telephone' => '032 56 789 01'],
        ])->map(fn ($data) => User::firstOrCreate(
            ['email' => $data['email']],
            $data + ['password' => Hash::make('password'), 'role' => User::ROLE_LOCATAIRE]
        ));

        $biensData = [
            [
                'user' => 0,
                'type' => Propriete::TYPE_APPARTEMENT,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Appartement T3 moderne — Ivandry',
                'ville' => 'Antananarivo',
                'quartier' => 'Ivandry',
                'prix' => 850000,
                'type_loyer' => 'mensuel',
                'nb_pieces' => 3,
                'nb_chambres' => 3,
                'nb_salles_bain' => 2,
                'superficie' => 92,
                'meuble' => true,
                'latitude' => -18.8791902,
                'longitude' => 47.5079055,
                'description' => 'Appartement lumineux de 3 chambres au 2e étage, salon spacieux, cuisine équipée, parking sécurisé et gardiennage 24h/24.',
                'query' => 'modern apartment living room',
            ],
            [
                'user' => 0,
                'type' => Propriete::TYPE_MAISON,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Maison familiale — Analamahitsy',
                'ville' => 'Antananarivo',
                'quartier' => 'Analamahitsy',
                'prix' => 1200000,
                'type_loyer' => 'mensuel',
                'nb_etages' => 1,
                'nb_chambres' => 4,
                'nb_salles_bain' => 3,
                'superficie' => 180,
                'meuble' => false,
                'latitude' => -18.9125,
                'longitude' => 47.5325,
                'description' => 'Grande maison familiale avec jardin, garage double, dépendances, idéale pour famille. Eau et électricité raccordées.',
                'query' => 'family house garden exterior',
            ],
            [
                'user' => 1,
                'type' => Propriete::TYPE_MAISON,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Villa de standing — Mahamasina',
                'ville' => 'Toamasina',
                'quartier' => 'Mahamasina',
                'prix' => 2000000,
                'type_loyer' => 'mensuel',
                'nb_etages' => 2,
                'nb_chambres' => 5,
                'nb_salles_bain' => 4,
                'superficie' => 320,
                'meuble' => true,
                'latitude' => -18.15,
                'longitude' => 49.4,
                'description' => 'Villa haut standing avec piscine, plage à 5 minutes, 5 chambres tout confort, cuisine américaine et vaste séjour.',
                'query' => 'luxury villa swimming pool',
            ],
            [
                'user' => 1,
                'type' => Propriete::TYPE_APPARTEMENT,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Studio meublé — Centre-ville',
                'ville' => 'Antsirabe',
                'quartier' => 'Centre-ville',
                'prix' => 250000,
                'type_loyer' => 'mensuel',
                'nb_pieces' => 1,
                'nb_chambres' => 1,
                'nb_salles_bain' => 1,
                'superficie' => 28,
                'meuble' => true,
                'latitude' => -19.8656,
                'longitude' => 47.0335,
                'description' => 'Studio confortable tout meublé, idéal étudiant ou jeune actif, proche des commerces et transports.',
                'query' => 'studio apartment interior',
            ],
            [
                'user' => 2,
                'type' => Propriete::TYPE_MAISON,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Maison de ville — Andravoahangy',
                'ville' => 'Antananarivo',
                'quartier' => 'Andravoahangy',
                'prix' => 650000,
                'type_loyer' => 'mensuel',
                'nb_etages' => 1,
                'nb_chambres' => 3,
                'nb_salles_bain' => 2,
                'superficie' => 140,
                'meuble' => false,
                'latitude' => -18.8937,
                'longitude' => 47.4976,
                'description' => 'Maison de ville bien située, 3 chambres, séjour lumineux, cour intérieure et petite véranda.',
                'query' => 'townhouse exterior facade',
            ],
            [
                'user' => 2,
                'type' => Propriete::TYPE_TERRAIN,
                'mode' => Propriete::MODE_VENTE,
                'titre' => 'Terrain à vendre — Ambohimangakely',
                'ville' => 'Antananarivo',
                'quartier' => 'Ambohimangakely',
                'prix' => 45000000,
                'type_loyer' => null,
                'superficie' => 1000,
                'titre_foncier' => 'TF-2023-004512',
                'latitude' => -18.9267,
                'longitude' => 47.5611,
                'description' => 'Terrain constructible de 1000 m² sur route goudronnée, titre foncier disponible, idéal construction ou investissement.',
                'query' => 'land plot terrain construction',
            ],
            [
                'user' => 2,
                'type' => Propriete::TYPE_TERRAIN,
                'mode' => Propriete::MODE_VENTE,
                'titre' => 'Terrain agricole — Mahajanga',
                'ville' => 'Mahajanga',
                'quartier' => 'Ampitambe',
                'prix' => 18000000,
                'type_loyer' => null,
                'superficie' => 5000,
                'titre_foncier' => null,
                'latitude' => -15.7167,
                'longitude' => 46.3167,
                'description' => "Terrain agricole fertile de 5000 m² près de la rivière, parfait pour l'agriculture ou élevage.",
                'query' => 'agricultural field green landscape',
            ],
            [
                'user' => 0,
                'type' => Propriete::TYPE_APPARTEMENT,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Appartement T2 — Isoraka',
                'ville' => 'Antananarivo',
                'quartier' => 'Isoraka',
                'prix' => 550000,
                'type_loyer' => 'mensuel',
                'nb_pieces' => 2,
                'nb_chambres' => 2,
                'nb_salles_bain' => 1,
                'superficie' => 58,
                'meuble' => true,
                'latitude' => -18.9033,
                'longitude' => 47.5177,
                'description' => "Bel appartement 2 chambres proche des restaurants et de la vie nocturne d'Isoraka, meublé et équipé.",
                'query' => 'cozy apartment bedroom',
            ],
            [
                'user' => 1,
                'type' => Propriete::TYPE_MAISON,
                'mode' => Propriete::MODE_LOCATION,
                'titre' => 'Maison économique — Ambohidratrimo',
                'ville' => 'Antananarivo',
                'quartier' => 'Ambohidratrimo',
                'prix' => 300000,
                'type_loyer' => 'mensuel',
                'nb_etages' => 1,
                'nb_chambres' => 2,
                'nb_salles_bain' => 1,
                'superficie' => 90,
                'meuble' => false,
                'latitude' => -18.81,
                'longitude' => 47.42,
                'description' => 'Petite maison économique de 2 chambres, parfaite pour petit budget, proche route nationale.',
                'query' => 'small affordable house',
            ],
            [
                'user' => 0,
                'type' => Propriete::TYPE_TERRAIN,
                'mode' => Propriete::MODE_VENTE,
                'titre' => 'Terrain viabilisé — Antsirabe',
                'ville' => 'Antsirabe',
                'quartier' => 'Zone industrielle',
                'prix' => 32000000,
                'type_loyer' => null,
                'superficie' => 2000,
                'titre_foncier' => 'TF-2022-001188',
                'latitude' => -19.8739,
                'longitude' => 47.0333,
                'description' => 'Terrain viabilisé de 2000 m² en zone industrielle, borné, eau et électricité disponibles.',
                'query' => 'industrial land warehouse',
            ],
        ];

        foreach ($biensData as $data) {
            $query = $data['query'];
            unset($data['query']);

            $propriete = Propriete::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'user_id' => $proprietaires[$data['user']]->id,
                    'type' => $data['type'],
                    'mode' => $data['mode'],
                    'statut' => Propriete::STATUT_DISPONIBLE,
                    'verification' => Propriete::VERIF_VERIFIEE,
                    'prix' => $data['prix'],
                    'type_loyer' => $data['type_loyer'] ?? null,
                    'description' => $data['description'] ?? null,
                ]
            );

            if ($propriete->wasRecentlyCreated || $propriete->images()->count() === 0) {
                if (! $propriete->localisation) {
                    Localisation::create([
                        'propriete_id' => $propriete->id,
                        'adresse' => $data['quartier'],
                        'quartier' => $data['quartier'],
                        'ville' => $data['ville'],
                        'latitude' => $data['latitude'],
                        'longitude' => $data['longitude'],
                    ]);
                }

                if (! $propriete->maison && $data['type'] === Propriete::TYPE_MAISON) {
                    Maison::create([
                        'propriete_id' => $propriete->id,
                        'nb_etages' => $data['nb_etages'] ?? 0,
                        'nb_chambres' => $data['nb_chambres'] ?? 1,
                        'nb_salles_bain' => $data['nb_salles_bain'] ?? 1,
                        'superficie' => $data['superficie'] ?? null,
                        'meuble' => $data['meuble'] ?? false,
                    ]);
                }

                if (! $propriete->appartements()->exists() && $data['type'] === Propriete::TYPE_APPARTEMENT) {
                    Appartement::create([
                        'propriete_id' => $propriete->id,
                        'nb_pieces' => $data['nb_pieces'] ?? 1,
                        'nb_chambres' => $data['nb_chambres'] ?? 1,
                        'nb_salles_bain' => $data['nb_salles_bain'] ?? 1,
                        'superficie' => $data['superficie'] ?? null,
                        'meuble' => $data['meuble'] ?? false,
                        'prix' => $data['prix'],
                        'statut' => Appartement::STATUT_DISPONIBLE,
                    ]);
                }

                if (! $propriete->terrain && $data['type'] === Propriete::TYPE_TERRAIN) {
                    Terrain::create([
                        'propriete_id' => $propriete->id,
                        'superficie' => $data['superficie'],
                        'titre_foncier' => $data['titre_foncier'] ?? null,
                        'statut' => Terrain::STATUT_DISPONIBLE,
                    ]);
                }

                $this->attachPexels($pexels, $propriete, $query);
            }

            // Force la synchronisation de l'annonce (observer).
            $propriete->touch();
        }

        $this->command?->info('Données de démonstration insérées avec succès.');
        $this->seedActivite($proprietaires, $locataires);
    }

    /**
     * Alimente toutes les autres tables : candidatures, contrats, locations,
     * paiements, messagerie, notifications, avis, favoris, alertes, litiges…
     */
    protected function seedActivite($proprietaires, $locataires): void
    {
        $this->command?->info("Ajout des données d'activité (contrats, paiements, messages…)…");

        $annonces = Annonce::with('propriete')->get();
        $annonceLocation = $annonces->where('mode', Annonce::MODE_LOCATION)->values();

        // --- Candidatures -------------------------------------------------
        $candData = [
            // [locataireIdx, annonceIdxParcourue, statut, budget]
            [0, 0, Candidature::STATUT_ACCEPTEE, 850000],
            [1, 0, Candidature::STATUT_REFUSEE, 750000],
            [2, 1, Candidature::STATUT_ACCEPTEE, 1200000],
            [0, 2, Candidature::STATUT_EN_ATTENTE, 650000],
            [1, 3, Candidature::STATUT_EN_ATTENTE, 2000000],
        ];

        $candidatures = collect();
        foreach ($candData as [$li, $ai, $statut, $budget]) {
            $annonce = $annonceLocation[$ai] ?? null;
            if (! $annonce) {
                continue;
            }
            $cand = Candidature::firstOrCreate(
                ['annonce_id' => $annonce->id, 'locataire_id' => $locataires[$li]->id],
                [
                    'message' => 'Bonjour, je suis très intéressé(e) par ce bien. Peut-on visiter ?',
                    'budget' => $budget,
                    'statut' => $statut,
                ]
            );
            $candidatures->push($cand);
        }

        // --- Documents des candidats --------------------------------------
        $docsParCand = [
            [0, 'cin', 'documents/demo/cin-naina.pdf'],
            [0, 'revenu', 'documents/demo/revenus-naina.pdf'],
            [2, 'cin', 'documents/demo/cin-tovo.pdf'],
        ];
        foreach ($docsParCand as [$candIndex, $type, $path]) {
            $cand = $candidatures->get($candIndex);
            if ($cand) {
                DocumentLocataire::firstOrCreate(
                    ['candidature_id' => $cand->id, 'type' => $type],
                    ['user_id' => $cand->locataire_id, 'path' => $path]
                );
            }
        }

        // --- Contrats de bail + locations + états des lieux ---------------
        $contrats = collect();
        $locationIds = [];
        foreach ($candidatures->where('statut', Candidature::STATUT_ACCEPTEE) as $cand) {
            $annonce = $cand->annonce;
            $debut = Carbon::now()->subMonths(4)->startOfMonth();
            $fin = $debut->copy()->addYears(1)->subDay();

            $contrat = ContratBail::firstOrCreate(
                ['annonce_id' => $annonce->id, 'locataire_id' => $cand->locataire_id],
                [
                    'proprietaire_id' => $annonce->propriete->user_id,
                    'date_debut' => $debut,
                    'date_fin' => $fin,
                    'loyer_mensuel' => $annonce->prix,
                    'caution' => $annonce->prix * 2,
                    'pdf_path' => "contrats/demo/contrat-{$annonce->id}-{$cand->locataire_id}.pdf",
                    'signature_proprietaire' => 'Signature électronique',
                    'signature_locataire' => 'Signature électronique',
                    'statut' => ContratBail::STATUT_ACTIF,
                ]
            );
            $contrats->push($contrat);

            $location = Location::firstOrCreate(
                ['contrat_bail_id' => $contrat->id],
                [
                    'appartement_id' => $annonce->appartement_id,
                    'locataire_id' => $cand->locataire_id,
                    'proprietaire_id' => $contrat->proprietaire_id,
                    'date_debut' => $debut,
                    'date_fin' => $fin,
                    'montant_loyer' => $annonce->prix,
                    'statut' => Location::STATUT_ACTIF,
                ]
            );
            $locationIds[] = $location->id;

            EtatDesLieux::firstOrCreate(
                ['location_id' => $location->id, 'type' => EtatDesLieux::TYPE_ENTREE],
                [
                    'date' => $debut->copy()->addDay(),
                    'notes' => "Bien en bon état général à l'entrée : peintures neuves, équipements fonctionnels, compteurs relevés.",
                    'photos' => [],
                    'signature_locataire' => 'Signature électronique',
                    'signature_proprietaire' => 'Signature électronique',
                ]
            );
        }

        $locations = Location::with('contratBail')->get();

        // --- Paiements de loyer (plusieurs mois par location) -------------
        $methodes = [
            PaiementLoyer::METHODE_MVOLA,
            PaiementLoyer::METHODE_ORANGE_MONEY,
            PaiementLoyer::METHODE_AIRTEL_MONEY,
            PaiementLoyer::METHODE_ESPECES,
        ];
        $i = 1;
        foreach ($locations as $location) {
            $mois = $location->date_debut->copy()->startOfMonth();
            $limite = Carbon::now()->startOfMonth();
            $nb = 0;
            while ($mois->lte($limite) && $nb < 8) {
                $dernierMois = $mois->copy()->isSameMonth($limite);
                PaiementLoyer::firstOrCreate(
                    ['location_id' => $location->id, 'mois' => $mois->copy()],
                    [
                        'montant' => $location->montant_loyer,
                        'methode' => $methodes[$nb % count($methodes)],
                        'reference' => 'MV-DEMO-' . str_pad((string) ($i++), 5, '0', STR_PAD_LEFT),
                        'statut' => $dernierMois ? PaiementLoyer::STATUT_EN_ATTENTE : PaiementLoyer::STATUT_CONFIRME,
                        'paye_le' => $mois->copy()->addDays(2)->setTime(9, 30),
                    ]
                );

                // Facture JIRAMA du même mois (une sur deux payée)
                if ($nb % 2 === 0) {
                    FactureElectricite::firstOrCreate(
                        ['location_id' => $location->id, 'mois' => $mois->copy()],
                        [
                            'montant' => rand(45000, 85000),
                            'payee' => ! $dernierMois,
                            'reference' => 'JR-DEMO-' . str_pad((string) $i, 6, '0', STR_PAD_LEFT),
                        ]
                    );
                }

                $mois->addMonth();
                $nb++;
            }

            // Deuxième locataire en colocation sur la première location
            if ($location->is($locations->first()) && $locataires->count() > 1) {
                Colocataire::firstOrCreate(
                    ['location_id' => $location->id, 'user_id' => $locataires[1]->id],
                    [
                        'part_loyer' => $location->montant_loyer * 0.35,
                        'part_facture' => 15000,
                    ]
                );
            }
        }

        // --- Messagerie ----------------------------------------------------
        $echanges = [
            [$locataires[0], $proprietaires[0], "Bonjour, je confirme ma candidature pour l'appartement."],
            [$proprietaires[0], $locataires[0], "Bonjour, je vous remercie. Une visite est possible samedi matin."],
            [$locataires[0], $proprietaires[0], 'Parfait, samedi à 10h me convient.'],
            [$proprietaires[0], $locataires[0], 'À samedi alors !'],
            [$locataires[2], $proprietaires[1], 'Bonjour, le bien est-il toujours disponible ?'],
            [$proprietaires[2], $locataires[1], 'Bonjour, oui la maison est toujours disponible pour une visite.'],
        ];
        foreach ($echanges as [$sender, $receiver, $contenu]) {
            Message::firstOrCreate(
                ['sender_id' => $sender->id, 'receiver_id' => $receiver->id, 'contenu' => $contenu],
                ['lu' => true, 'lu_at' => Carbon::now()->subHours(rand(1, 48))]
            );
        }

        // --- Notifications ---------------------------------------------------
        $notifData = [
            [$locataires[0], Notification::TYPE_PAIEMENT, 'Paiement confirmé', 'Votre loyer de ce mois a été confirmé par Orange Money.', '/mes-paiements', true],
            [$locataires[0], Notification::TYPE_CONTRAT, 'Contrat signé', 'Votre contrat de bail a été signé par les deux parties.', '/mes-contrats', false],
            [$locataires[1], Notification::TYPE_CANDIDATURE, 'Candidature envoyée', 'Votre candidature a bien été transmise au propriétaire.', '/mes-candidatures', true],
            [$locataires[2], Notification::TYPE_SYSTEME, 'Bienvenue 👋', "Créez vos alertes pour être prévenu dès qu'un bien correspond à votre budget.", '/mes-alertes', false],
            [$proprietaires[0], Notification::TYPE_CANDIDATURE, 'Nouvelle candidature', 'Un locataire a candidaté sur votre appartement.', '/mes-proprietes', false],
            [$proprietaires[0], Notification::TYPE_RAPPEL, 'Rappel de loyer', "Le loyer de Ivandry n'a pas encore été réglé ce mois-ci.", '/mes-paiements', true],
            [$proprietaires[2], Notification::TYPE_MESSAGE, 'Nouveau message', 'Vous avez reçu un message à propos de votre maison.', '/messagerie', false],
        ];
        foreach ($notifData as [$user, $type, $titre, $contenu, $lien, $lue]) {
            Notification::firstOrCreate(
                ['user_id' => $user->id, 'type' => $type, 'titre' => $titre],
                ['contenu' => $contenu, 'lien' => $lien, 'lue' => $lue, 'lue_at' => $lue ? Carbon::now()->subDay() : null]
            );
        }

        // --- Avis mutuels après location -----------------------------------
        $avisData = [
            [$locataires[0], $proprietaires[0], 5, "Propriétaire très réactif, bien conforme à l'annonce."],
            [$proprietaires[0], $locataires[0], 4, 'Locataire sérieux, loyers payés à temps.'],
            [$locataires[2], $proprietaires[1], 5, 'Excellente communication, je recommande.'],
        ];
        foreach ($avisData as [$auteur, $cible, $note, $commentaire]) {
            Avis::firstOrCreate(
                ['auteur_id' => $auteur->id, 'cible_user_id' => $cible->id],
                ['location_id' => $locations->first()->id ?? null, 'note' => $note, 'commentaire' => $commentaire]
            );
        }

        // --- Favoris ---------------------------------------------------------
        $favoris = [
            [$locataires[0]->id, $annonces[5]->id],
            [$locataires[0]->id, $annonces[6]->id],
            [$locataires[1]->id, $annonces[4]->id],
            [$locataires[2]->id, $annonces[2]->id],
        ];
        foreach ($favoris as [$uid, $aid]) {
            Favori::firstOrCreate(['user_id' => $uid, 'annonce_id' => $aid]);
        }

        // --- Alertes de recherche --------------------------------------------
        $alertes = [
            [$locataires[0], 600000, 1000000, Annonce::TYPE_APPARTEMENT, Annonce::MODE_LOCATION, 'Antananarivo', true],
            [$locataires[1], 200000, 450000, Annonce::TYPE_MAISON, Annonce::MODE_LOCATION, 'Antananarivo', true],
            [$locataires[2], 500000, 1500000, null, Annonce::MODE_LOCATION, 'Toamasina', false],
        ];
        foreach ($alertes as [$user, $min, $max, $type, $mode, $ville, $actif]) {
            AlerteRecherche::firstOrCreate(
                ['user_id' => $user->id, 'ville' => $ville, 'type' => $type],
                [
                    'budget_min' => $min,
                    'budget_max' => $max,
                    'mode' => $mode,
                    'quartier' => null,
                    'actif' => $actif,
                ]
            );
        }

        // --- Litiges ---------------------------------------------------------
        Litige::firstOrCreate(
            ['location_id' => $locations->first()->id ?? 1, 'motif' => 'Retard de paiement du loyer'],
            [
                'auteur_id' => $proprietaires[0]->id,
                'description' => "Le loyer du mois en cours n'a pas été réglé à la date convenue malgré une relance.",
                'statut' => Litige::STATUT_EN_COURS,
                'resolution' => null,
            ]
        );
        Litige::firstOrCreate(
            ['location_id' => $locations->get(1)->id ?? 1, 'motif' => 'Dégradation mineure constatée'],
            [
                'auteur_id' => $proprietaires[1]->id,
                'description' => 'Tache sur la moquette du salon, constatée à la sortie.',
                'statut' => Litige::STATUT_RESOLU,
                'resolution' => 'Montant de 75 000 Ar prélevé sur la caution, accord signé des deux parties.',
            ]
        );

        // --- Historique des prix ---------------------------------------------
        $histo = [
            [$annonces[0], 900000], // Ivandry : 900 000 → 850 000
            [$annonces[2], 2200000], // Toamasina : 2 200 000 → 2 000 000
            [$annonces[4], 700000], // Andravoahangy : 700 000 → 650 000
        ];
        foreach ($histo as [$annonce, $ancienPrix]) {
            HistoriquePrix::firstOrCreate(
                ['propriete_id' => $annonce->propriete_id, 'ancien_prix' => $ancienPrix, 'nouveau_prix' => $annonce->prix],
                ['appartement_id' => $annonce->appartement_id, 'date_changement' => Carbon::now()->subMonths(2)]
            );
        }

        $this->command?->info(
            sprintf(
                'Activité de démonstration : %d candidatures, %d contrats, %d locations, %d messages, %d notifications.',
                $candidatures->count(),
                $contrats->count(),
                $locations->count(),
                count($echanges),
                count($notifData)
            )
        );
    }

    protected function attachPexels(PexelsService $pexels, Propriete $propriete, string $query): void
    {
        $photos = $pexels->search($query, 4);

        if (count($photos) === 0) {
            return;
        }

        $first = true;
        foreach ($photos as $photo) {
            $propriete->images()->create([
                'path' => $photo['url'],
                'is_principale' => $first,
                'ordre' => $propriete->images()->count(),
            ]);
            $first = false;
        }
    }
}
