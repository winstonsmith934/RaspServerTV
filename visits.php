<?php
header('Content-Type: application/json');

// Percorso file
$file = "views.json";

// DEBUG: messaggi per capire cosa succede
$response = [
  "status" => "ok",
  "file_exists" => file_exists($file),
  "visits" => null,
  "error" => null
];

try {
  // Legge o inizializza
  if (file_exists($file)) {
      $data = json_decode(file_get_contents($file), true);
      if (!isset($data["visits"])) {
          $data["visits"] = 0;
      }
  } else {
      $data = ["visits" => 0];
  }

  // Incrementa e salva
  $data["visits"]++;
  file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
  $response["visits"] = $data["visits"];

} catch (Exception $e) {
  $response["status"] = "error";
  $response["error"] = $e->getMessage();
}

// Output JSON
echo json_encode($response);
?>

