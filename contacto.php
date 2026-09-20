<?php
/**
 * Recibe el formulario de contacto de index.html y envía el mail por PHP
 * mail() (disponible por defecto en el hosting de DonWeb). No depende de
 * ningún servicio externo (Formspree, etc.).
 *
 * TODO antes de publicar:
 * - Confirmar que "tecnica@hidrareco.com.ar" es una casilla real ya creada
 *   en el panel de DonWeb (Email > Cuentas de correo). Si todavía no existe,
 *   crearla ahí, o reemplazar la constante DESTINATARIO por la que corresponda.
 * - Reemplazar "hidrareco.com.ar" en REMITENTE por el dominio real una vez
 *   que esté apuntando a DonWeb (tiene que coincidir con el dominio del
 *   hosting para que los servidores de correo no marquen el mail como spam).
 */

const DESTINATARIO = 'tecnica@hidrareco.com.ar';
const REMITENTE = 'no-reply@hidrareco.com.ar';

header('Content-Type: application/json; charset=utf-8');

function responder($ok, $mensaje = '') {
  http_response_code($ok ? 200 : 400);
  echo json_encode(['ok' => $ok, 'mensaje' => $mensaje]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  responder(false, 'Método no permitido.');
}

// Honeypot anti-spam: si el campo oculto viene completo, es un bot.
// Respondemos "ok" igual para no darle pistas al bot de que fue detectado.
if (!empty($_POST['sitio_web'])) {
  responder(true);
}

function limpiar($valor) {
  // Saca saltos de línea para que nadie pueda inyectar headers de mail extra.
  $valor = trim($valor ?? '');
  return str_replace(["\r", "\n"], '', $valor);
}

$nombre   = limpiar($_POST['nombre'] ?? '');
$empresa  = limpiar($_POST['empresa'] ?? '');
$email    = limpiar($_POST['email'] ?? '');
$telefono = limpiar($_POST['telefono'] ?? '');
$caudal   = limpiar($_POST['caudal'] ?? '');
$tipo_efluente = limpiar($_POST['tipo_efluente'] ?? '');
$objetivo = limpiar($_POST['objetivo'] ?? '');
$mensaje  = trim($_POST['mensaje'] ?? ''); // este sí puede tener saltos de línea, va en el cuerpo

// El email es opcional (muchos contactos solo dejan el teléfono) -- lo único
// obligatorio es tener alguna forma de contactarlos: nombre, empresa, teléfono y mensaje.
if ($nombre === '' || $empresa === '' || $telefono === '' || $mensaje === '') {
  responder(false, 'Faltan campos obligatorios.');
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  responder(false, 'El email no es válido.');
}

$asunto = 'Nueva consulta técnica - HidraReco';

$cuerpo = "Nueva consulta desde el formulario de hidrareco.com.ar\n\n"
  . "Nombre y Apellido: {$nombre}\n"
  . "Empresa: {$empresa}\n"
  . "Email: " . ($email !== '' ? $email : '-') . "\n"
  . "Teléfono / WhatsApp: {$telefono}\n"
  . "Caudal estimado: " . ($caudal !== '' ? $caudal : '-') . "\n"
  . "Tipo de efluente: " . ($tipo_efluente !== '' ? $tipo_efluente : '-') . "\n"
  . "Objetivo del servicio: " . ($objetivo !== '' ? $objetivo : '-') . "\n\n"
  . "Mensaje:\n{$mensaje}\n";

$headers = "From: HidraReco Web <" . REMITENTE . ">\r\n";
if ($email !== '') {
  $headers .= "Reply-To: {$nombre} <{$email}>\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8";

$enviado = mail(DESTINATARIO, $asunto, $cuerpo, $headers);

if ($enviado) {
  responder(true);
} else {
  responder(false, 'No se pudo enviar el mail. Probá de nuevo o escribinos por WhatsApp.');
}
