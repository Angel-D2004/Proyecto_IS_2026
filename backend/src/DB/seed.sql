-- =============================================================
-- Datos de ejemplo para desarrollo
-- Uso: mysql -u root -p inmobiliaria < backend/src/DB/seed.sql
-- =============================================================

INSERT INTO `clientes` (`nombre`, `email`, `telefono`, `tipo`, `direccion`, `notas`) VALUES
  ('Ana Torres', 'ana.torres@example.com', '700-11111', 'comprador', 'Av. Siempre Viva 123', 'Busca casa con jardín'),
  ('Luis Ramírez', 'luis.ramirez@example.com', '700-22222', 'vendedor', 'Calle Los Pinos 45', 'Vende departamento'),
  ('María Gómez', 'maria.gomez@example.com', '700-33333', 'inquilino', 'Zona Centro', 'Busca alquiler amoblado');

INSERT INTO `propiedades` (`titulo`, `direccion`, `tipo`, `operacion`, `precio`, `estado`, `descripcion`) VALUES
  ('Casa con jardín en zona norte', 'Av. Los Álamos 780', 'casa', 'venta', 185000.00, 'disponible', 'Tres dormitorios, dos baños, garaje.'),
  ('Departamento céntrico', 'Calle Bolívar 120, piso 4', 'departamento', 'alquiler', 650.00, 'disponible', 'Dos dormitorios, amoblado.'),
  ('Local comercial sobre avenida', 'Av. Principal 45', 'local', 'alquiler', 1200.00, 'reservada', 'Excelente visibilidad, 80 m².');

INSERT INTO `citas` (`cliente_id`, `propiedad_id`, `fecha`, `hora`, `estado`, `notas`) VALUES
  (1, 1, '2026-11-10', '10:30:00', 'confirmada', 'Visita con el agente'),
  (3, 2, '2026-11-12', '15:00:00', 'pendiente', 'Confirmar por teléfono');

INSERT INTO `ventas` (`cliente_id`, `propiedad_id`, `fecha`, `monto`, `comision`, `estado`, `notas`) VALUES
  (2, 1, '2026-11-01', 180000.00, 5400.00, 'en_proceso', 'Negociación en curso');
