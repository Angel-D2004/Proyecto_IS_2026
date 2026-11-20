
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// CONSULTAR SOLICITUDES DE CRÉDITO
// GET /api/solicitudes
// ==========================================

router.get('/', async (req, res) => {

    try {

        const query = `
            SELECT
                s.solicitud,
                s.reserva,
                s.entidad_financiera,
                s.monto_solicitado,
                s.plazo_meses,
                s.estado,
                s.observacion,
                s.fecha_solicitud,
                s.fecha_actualizacion,

                r.oportunidad,
                r.propiedad,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                p.nombre AS nombre_propiedad

            FROM solicitudes_credito s

            INNER JOIN reservas r
                ON s.reserva = r.reserva

            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            ORDER BY s.solicitud DESC
        `;

        const [rows] = await db.query(query);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar solicitudes'
        });
    }
});

// ==========================================
// CONSULTAR RESERVAS ELEGIBLES
// GET /api/solicitudes/reservas-disponibles
// ==========================================

router.get('/reservas-disponibles', async (req, res) => {

    try {

        const query = `
            SELECT
                r.reserva,
                r.oportunidad,
                r.propiedad,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                p.nombre AS nombre_propiedad,
                p.precio

            FROM reservas r

            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            INNER JOIN evaluaciones_crediticias e
                ON e.oportunidad = o.oportunidad

            LEFT JOIN solicitudes_credito s
                ON s.reserva = r.reserva

            WHERE r.estado = 'confirmada'
              AND e.estado = 'aprobada'
              AND s.solicitud IS NULL

            ORDER BY r.reserva DESC
        `;

        const [rows] = await db.query(query);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar reservas disponibles'
        });
    }
});

// ==========================================
// REGISTRAR SOLICITUD DE CRÉDITO
// POST /api/solicitudes
// ==========================================

router.post('/', async (req, res) => {

    const {
        reserva,
        entidad_financiera,
        monto_solicitado,
        plazo_meses,
        observacion
    } = req.body;

    const reservaId = Number(reserva);
    const monto = Number(monto_solicitado);
    const plazo = Number(plazo_meses);

    if (!Number.isInteger(reservaId) || reservaId <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Seleccione una reserva válida'
        });
    }

    if (
        typeof entidad_financiera !== 'string' ||
        !entidad_financiera.trim() ||
        entidad_financiera.trim().length > 150
    ) {
        return res.status(400).json({
            status: false,
            message: 'Ingrese una entidad financiera válida'
        });
    }

    if (
        monto_solicitado === null ||
        monto_solicitado === undefined ||
        monto_solicitado === '' ||
        !Number.isFinite(monto) ||
        monto <= 0 ||
        Math.abs(monto * 100 - Math.round(monto * 100)) > 0.000001
    ) {
        return res.status(400).json({
            status: false,
            message: 'El monto solicitado debe ser mayor que cero'
        });
    }

    if (
        !Number.isInteger(plazo) ||
        plazo <= 0 ||
        plazo_meses === null ||
        plazo_meses === undefined ||
        plazo_meses === ''
    ) {
        return res.status(400).json({
            status: false,
            message: 'Ingrese un plazo válido en meses'
        });
    }

    try {

        // Verificar que la reserva esté confirmada
        // y la evaluación crediticia aprobada.
        const query1 = `
            SELECT
                r.reserva,
                p.precio

            FROM reservas r

            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            INNER JOIN evaluaciones_crediticias e
                ON e.oportunidad = r.oportunidad

            WHERE r.reserva = ?
              AND r.estado = 'confirmada'
              AND e.estado = 'aprobada'
        `;

        const [reservas] = await db.query(
            query1,
            [reservaId]
        );

        if (reservas.length === 0) {

            return res.status(400).json({
                status: false,
                message:
                    'La reserva debe estar confirmada y tener evaluación aprobada'
            });
        }

        if (monto > Number(reservas[0].precio)) {

            return res.status(400).json({
                status: false,
                message:
                    'El monto solicitado supera el precio de la vivienda'
            });
        }

        // UNIQUE en reserva protege contra duplicados.
        const query2 = `
            INSERT INTO solicitudes_credito
            (
                reserva,
                entidad_financiera,
                monto_solicitado,
                plazo_meses,
                observacion
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const [resultado] = await db.query(
            query2,
            [
                reservaId,
                entidad_financiera.trim(),
                monto,
                plazo,
                typeof observacion === 'string'
                    ? observacion.trim() || null
                    : null
            ]
        );

        return res.status(201).json({
            status: true,
            message: 'Solicitud de crédito registrada correctamente',
            data: {
                solicitud: resultado.insertId
            }
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {

            return res.status(409).json({
                status: false,
                message:
                    'Esta reserva ya tiene una solicitud de crédito'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar solicitud'
        });
    }
});

// ==========================================
// ACTUALIZAR ESTADO DE SOLICITUD
// PUT /api/solicitudes/:id/estado
// ==========================================

router.put('/:id/estado', async (req, res) => {

    const solicitudId = Number(req.params.id);
    const { estado } = req.body;

    const estadosPermitidos = [
        'en_revision',
        'aprobada',
        'rechazada'
    ];

    if (
        !Number.isInteger(solicitudId) ||
        solicitudId <= 0 ||
        !estadosPermitidos.includes(estado)
    ) {
        return res.status(400).json({
            status: false,
            message: 'Solicitud o estado no válido'
        });
    }

    try {

        const query = `
            UPDATE solicitudes_credito
            SET estado = ?
            WHERE solicitud = ?
              AND (
                (estado = 'pendiente' AND ? = 'en_revision')
                OR
                (
                    estado = 'en_revision'
                    AND ? IN ('aprobada', 'rechazada')
                )
              )
        `;

        const [resultado] = await db.query(
            query,
            [
                estado,
                solicitudId,
                estado,
                estado
            ]
        );

        if (resultado.affectedRows === 0) {

            return res.status(409).json({
                status: false,
                message:
                    'Solicitud no encontrada o cambio de estado no permitido'
            });
        }

        return res.json({
            status: true,
            message: 'Estado actualizado correctamente'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al actualizar estado'
        });
    }
});

// ==========================================
// CONSULTAR HISTORIAL DE SEGUIMIENTOS
// GET /api/solicitudes/:id/seguimientos
// ==========================================

router.get('/:id/seguimientos', async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT *
            FROM seguimiento_credito
            WHERE solicitud = ?
            ORDER BY seguimiento DESC
            `,
            [req.params.id]
        );

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar seguimientos'
        });
    }
});

// ==========================================
// REGISTRAR SEGUIMIENTO
// POST /api/solicitudes/:id/seguimientos
// ==========================================

router.post('/:id/seguimientos', async (req, res) => {

    const solicitudId = Number(req.params.id);
    const { observacion } = req.body;

    if (
        !Number.isInteger(solicitudId) ||
        solicitudId <= 0 ||
        typeof observacion !== 'string' ||
        !observacion.trim()
    ) {
        return res.status(400).json({
            status: false,
            message: 'Solicitud u observación no válida'
        });
    }

    try {

        const [resultado] = await db.query(
            `
            INSERT INTO seguimiento_credito
            (solicitud, observacion)
            VALUES (?, ?)
            `,
            [solicitudId, observacion.trim()]
        );

        return res.status(201).json({
            status: true,
            message: 'Seguimiento registrado correctamente',
            data: {
                seguimiento: resultado.insertId
            }
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {

            return res.status(404).json({
                status: false,
                message: 'La solicitud no existe'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar seguimiento'
        });
    }
});

module.exports = router;
