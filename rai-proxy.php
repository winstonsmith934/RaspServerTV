<?php
header('Content-Type: application/json');

function respond($arr) {
  echo json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
  exit;
}

if (!isset($_GET['url'])) {
  respond(['error' => 'Missing URL']);
}

$url = $_GET['url'];

// Verifica URL valido RAI
if (!preg_match('/^https:\/\/mediapolis\.rai\.it\/relinker\/relinkerServlet\.htm\?cont=\d+/', $url)) {
  respond(['error' => 'Invalid RAI URL']);
}

// Imposta cURL
$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_SSL_VERIFYPEER => false,
  CURLOPT_HTTPHEADER => [
    'User-Agent: Mozilla/5.0',
    'Referer: https://www.raiplay.it'
  ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Mostra debug utile anche se non risolto
if (!$response) {
  respond([
    'error' => 'cURL failed',
    'curl_error' => $error,
    'http_code' => $httpCode
  ]);
}

// ✅ Cerca l'URL .m3u8 nella risposta
if (preg_match('/https?:\/\/[^\s"]+\.m3u8/', $response, $matches)) {
  respond([
    'stream' => $matches[0],
    'source' => $url
  ]);
} else {
  // Debug del contenuto ricevuto (limite per sicurezza)
  $snippet = substr(trim($response), 0, 500);
  respond([
    'error' => 'Could not resolve URL',
    'httpCode' => $httpCode,
    'snippet' => $snippet
  ]);
}

