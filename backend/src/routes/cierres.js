
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

function idValido(id) {
    const n = Number(id);
    return Number.isInteger(n) && n > 0;
}

function fechaValida(fecha) {

    if (
        typeof fecha !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return false;
    }

    const [anio, mes, dia] =
        fecha.split('-').map(Number);

    const comprobacion = new Date(
        Date.UTC(anio, mes - 1, dia)
    );

    return (
        comprobacion.getUTCFullYear() === anio &&
        comprobacion.getUTCMonth() === mes - 1 &&
        comprobacion.getUTCDate() === dia
    );
}

function textoValido(texto, maximo) {
    return (
        typeof texto === 'string' &&
        texto.trim().length > 0 &&
        texto.trim().length <= maximo
    );
}

// ==========================================
// CONSULTAR FIRMAS
// GET /api/cierres/firmas
// ==========================================

router.get('/firmas', async (req, res) => {

    try {

        const [rows] = await db.query(`
            SELECT
                f.firma,
                f.solicitud,
                f.fecha_firma,
                f.notario,
                f.referencia_escritura,
                f.observacion,
                f.fecha_registro,

                sc.reserva,
                sc.entidad_financiera,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                p.nombre AS nombre_propiedad

            FROM firmas_escrituras f

            INNER JOIN solicitudes_credito sc
                ON f.solicitud = sc.solicitud

            INNER JOIN reservas r
                ON sc.reserva = r.reserva

            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            ORDER BY f.firma DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar firmas'
        });
    }
});

// ==========================================
// CONSULTAR SOLICITUDES APTAS PARA FIRMA
// GET /api/cierres/solicitudes-disponibles
// ==========================================

router.get('/solicitudes-disponibles', async (req, res) => {

    try {

        const [rows] = await db.query(`
            SELECT
                sc.solicitud,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                p.nombre AS nombre_propiedad

            FROM solicitudes_credito sc

            INNER JOIN reservas r
                ON sc.reserva = r.reserva

            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            LEFT JOIN firmas_escrituras f
                ON f.solicitud = sc.solicitud

            WHERE sc.estado = 'aprobada'
              AND r.estado = 'confirmada'
              AND f.firma IS NULL

              AND (
                  SELECT COUNT(DISTINCT d.tipo_documento)
                  FROM documentos_credito d
                  WHERE d.solicitud = sc.solicitud
                    AND d.estado = 'verificado'
                    AND d.tipo_documento IN (
                        'dpi',
                        'carta_laboral',
                        'estados_cuenta'
                    )
              ) = 3

            ORDER BY sc.solicitud DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar solicitudes disponibles'
        });
    }
});

// ==========================================
// REGISTRAR FIRMA DE ESCRITURAS
// POST /api/cierres/firmas
// ==========================================

router.post('/firmas', async (req, res) => {

    const {
        solicitud,
        fecha_firma,
        notario,
        referencia_escritura,
        observacion
    } = req.body;

    if (
        !idValido(solicitud) ||
        !fechaValida(fecha_firma) ||
        !textoValido(notario, 150) ||
        !textoValido(referencia_escritura, 100)
    ) {
        return res.status(400).json({
            status: false,
            message: 'Complete correctamente los datos de la firma'
        });
    }

    if (
        observacion != null &&
        typeof observacion !== 'string'
    ) {
        return res.status(400).json({
            status: false,
            message: 'Observación no válida'
        });
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // Bloquear la solicitud para registrar
        // una sola firma de forma consistente.
        const [solicitudes] = await connection.query(`
            SELECT
                sc.solicitud,
                sc.estado,
                r.estado AS estado_reserva

            FROM solicitudes_credito sc

            INNER JOIN reservas r
                ON sc.reserva = r.reserva

            WHERE sc.solicitud = ?

            FOR UPDATE
        `, [Number(solicitud)]);

        if (solicitudes.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                status: false,
                message: 'Solicitud no encontrada'
            });
        }

        const actual = solicitudes[0];

        if (
            actual.estado !== 'aprobada' ||
            actual.estado_reserva !== 'confirmada'
        ) {

            await connection.rollback();

            return res.status(409).json({
                status: false,
                message:
                    'La solicitud debe estar aprobada y la reserva confirmada'
            });
        }

        // Verificar documentos obligatorios.
        const [documentos] = await connection.query(`
            SELECT COUNT(DISTINCT tipo_documento)
                AS cantidad

            FROM documentos_credito

            WHERE solicitud = ?
              AND estado = 'verificado'
              AND tipo_documento IN (
                  'dpi',
                  'carta_laboral',
                  'estados_cuenta'
              )
        `, [Number(solicitud)]);

        if (Number(documentos[0].cantidad) !== 3) {

            await connection.rollback();

            return res.status(409).json({
                status: false,
                message:
                    'Faltan documentos obligatorios verificados'
            });
        }

        // Verificar que no exista otra firma.
        const [firmas] = await connection.query(`
            SELECT firma
            FROM firmas_escrituras
            WHERE solicitud = ?
        `, [Number(solicitud)]);

        if (firmas.length > 0) {

            await connection.rollback();

            return res.status(409).json({
                status: false,
                message:
                    'La solicitud ya tiene una firma registrada'
            });
        }

        const [resultado] = await connection.query(`
            INSERT INTO firmas_escrituras (
                solicitud,
                fecha_firma,
                notario,
                referencia_escritura,
                observacion
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            Number(solicitud),
            fecha_firma,
            notario.trim(),
            referencia_escritura.trim(),
            typeof observacion === 'string'
                ? observacion.trim() || null
                : null
        ]);

        await connection.commit();

        return res.status(201).json({
            status: true,
            message: 'Firma registrada correctamente',
            data: {
                firma: resultado.insertId
            }
        });

    } catch (error) {

        await connection.rollback();
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {

            return res.status(409).json({
                status: false,
                message:
                    'Esta solicitud ya tiene una firma'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar firma'
        });

    } finally {

        connection.release();
    }
});

// ==========================================
// CONSULTAR ENTREGAS
// GET /api/cierres/entregas
// ==========================================

router.get('/entregas', async (req, res) => {

    try {

        const [rows] = await db.query(`
            SELECT
                ev.entrega,
                ev.firma,
                ev.fecha_entrega,
                ev.responsable,
                ev.observacion,
                ev.fecha_registro,

                f.solicitud,
                f.fecha_firma,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                p.nombre AS nombre_propiedad

            FROM entregas_viviendas ev

            INNER JOIN firmas_escrituras f
                ON ev.firma = f.firma

            INNER JOIN solicitudes_credito sc
                ON f.solicitud = sc.solicitud

            INNER JOIN reservas r
                ON sc.reserva = r.reserva

            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            ORDER BY ev.entrega DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar entregas'
        });
    }
});

// ==========================================
// CONSULTAR FIRMAS PENDIENTES DE ENTREGA
// GET /api/cierres/firmas-disponibles
// ==========================================

router.get('/firmas-disponibles', async (req, res) => {

    try {

        const [rows] = await db.query(`
            SELECT
                f.firma,
                f.solicitud,
                f.fecha_firma,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                p.nombre AS nombre_propiedad

            FROM firmas_escrituras f

            INNER JOIN solicitudes_credito sc
                ON f.solicitud = sc.solicitud

            INNER JOIN reservas r
                ON sc.reserva = r.reserva

            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            LEFT JOIN entregas_viviendas ev
                ON ev.firma = f.firma

            WHERE ev.entrega IS NULL

            ORDER BY f.firma DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message:
                'Error al consultar firmas pendientes de entrega'
        });
    }
});

// ==========================================
// REGISTRAR ENTREGA DE VIVIENDA
// POST /api/cierres/entregas
// ==========================================

router.post('/entregas', async (req, res) => {

    const {
        firma,
        fecha_entrega,
        responsable,
        observacion
    } = req.body;

    if (
        !idValido(firma) ||
        !fechaValida(fecha_entrega) ||
        !textoValido(responsable, 150)
    ) {

        return res.status(400).json({
            status: false,
            message:
                'Complete correctamente los datos de entrega'
        });
    }

    if (
        observacion != null &&
        typeof observacion !== 'string'
    ) {

        return res.status(400).json({
            status: false,
            message: 'Observación no válida'
        });
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // Bloquear el registro de firma.
        const [firmas] = await connection.query(`
            SELECT
                firma,
                fecha_firma
            FROM firmas_escrituras
            WHERE firma = ?
            FOR UPDATE
        `, [Number(firma)]);

        if (firmas.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                status: false,
                message:
                    'No existe una firma registrada para esta entrega'
            });
        }

        // Comprobar orden cronológico.
        // MySQL puede devolver DATE como Date o string.
        const fechaFirma = firmas[0].fecha_firma;

        const fechaFirmaTexto =
            fechaFirma instanceof Date
                ? [
                    fechaFirma.getUTCFullYear(),
                    String(
                        fechaFirma.getUTCMonth() + 1
                    ).padStart(2, '0'),
                    String(
                        fechaFirma.getUTCDate()
                    ).padStart(2, '0')
                ].join('-')
                : String(fechaFirma).slice(0, 10);

        if (fecha_entrega < fechaFirmaTexto) {

            await connection.rollback();

            return res.status(400).json({
                status: false,
                message:
                    'La entrega no puede ser anterior a la firma'
            });
        }

        const [entregas] = await connection.query(`
            SELECT entrega
            FROM entregas_viviendas
            WHERE firma = ?
        `, [Number(firma)]);

        if (entregas.length > 0) {

            await connection.rollback();

            return res.status(409).json({
                status: false,
                message:
                    'Esta vivienda ya tiene una entrega registrada para esa firma'
            });
        }

        const [resultado] = await connection.query(`
            INSERT INTO entregas_viviendas (
                firma,
                fecha_entrega,
                responsable,
                observacion
            )
            VALUES (?, ?, ?, ?)
        `, [
            Number(firma),
            fecha_entrega,
            responsable.trim(),
            typeof observacion === 'string'
                ? observacion.trim() || null
                : null
        ]);

        await connection.commit();

        return res.status(201).json({
            status: true,
            message: 'Entrega registrada correctamente',
            data: {
                entrega: resultado.insertId
            }
        });

    } catch (error) {

        await connection.rollback();
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {

            return res.status(409).json({
                status: false,
                message:
                    'La entrega ya fue registrada'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar entrega'
        });

    } finally {

        connection.release();
    }
});

module.exports = router;
