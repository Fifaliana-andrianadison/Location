<?php

// Login
$data = json_encode(['email' => 'proprio1@tanytoerana.mg', 'password' => 'password']);
$ch = curl_init('http://127.0.0.1:8000/api/login');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
    CURLOPT_RETURNTRANSFER => true,
]);
$res = curl_exec($ch);
curl_close($ch);
$login = json_decode($res, true);
echo "Login: " . json_encode($login) . "\n\n";

if (!isset($login['token'])) {
    exit("Login failed\n");
}

$token = $login['token'];

// Create property
$propData = json_encode([
    'type' => 'maison',
    'mode' => 'location',
    'titre' => 'Test Maison API',
    'description' => 'Maison créée via API test',
    'prix' => 750000,
    'type_loyer' => 'mensuel',
    'ville' => 'Antananarivo',
    'quartier' => 'Test',
    'nb_etages' => 1,
    'nb_chambres' => 3,
    'nb_salles_bain' => 2,
    'superficie' => 150,
    'meuble' => false,
    'latitude' => -18.88,
    'longitude' => 47.51,
]);

$ch = curl_init('http://127.0.0.1:8000/api/proprietes');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $propData,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ],
    CURLOPT_RETURNTRANSFER => true,
]);
$res = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Create propriete (HTTP $httpCode): " . $res . "\n\n";

$prop = json_decode($res, true);

// Check annonce created
if (isset($prop['data']['id'])) {
    $ch = curl_init('http://127.0.0.1:8000/api/annonces');
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_RETURNTRANSFER => true,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    $annonces = json_decode($res, true);
    echo "Annonces after create: " . json_encode($annonces, JSON_PRETTY_PRINT) . "\n";
}