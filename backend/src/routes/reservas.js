
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// US-34: CONSULTAR RESERVAS
// ==========================================

router.get('/', async (req, res) => {

    const query1 = `
        SELECT
            r.reserva,
            r.oportunidad,
            r.propiedad,
            r.monto_reserva,
            r.estado,
            r.observacion,
            r.fecha_registro,
            r.fecha_actualizacion,
            CONCAT(c.nombres, ' ', c.apellidos)
                AS nombre_cliente,
            p.nombre AS nombre_propiedad

        FROM reservas r

        INNER JOIN oportunidades o
            ON r.oportunidad = o.oportunidad

        INNER JOIN intereses i
            ON o.interes = i.interes

        INNER JOIN clientes c
            ON i.cliente = c.cliente

        INNER JOIN propiedades p
            ON r.propiedad = p.propiedad

        ORDER BY r.reserva DESC
    `;

    try {

        const [rows] = await db.query(query1);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar reservas'
        });
    }
});

// ==========================================
// US-33: CREAR RESERVA
// ==========================================

router.post('/', async (req, res) => {

    const {
        oportunidad,
        monto_reserva,
        observacion
    } = req.body;

    const oportunidadId = Number(oportunidad);
    const monto = Number(monto_reserva);

    if (
        !Number.isInteger(oportunidadId) ||
        oportunidadId <= 0
    ) {
        return res.status(400).json({
            status: false,
            message: 'Seleccione una oportunidad válida'
        });
    }

    if (
        monto_reserva === null ||
        monto_reserva === undefined ||
        monto_reserva === '' ||
        !Number.isFinite(monto) ||
        monto <= 0 ||
        Math.abs(
            monto * 100 - Math.round(monto * 100)
        ) > 0.000001
    ) {
        return res.status(400).json({
            status: false,
            message: 'Ingrese un monto de reserva válido'
        });
    }

    const comentario =
        typeof observacion === 'string'
            ? observacion.trim() || null
            : null;

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // Consultar la oportunidad seleccionada
        const query2 = `
            SELECT
                o.oportunidad,
                o.estado_oportu,
                i.propiedad,
                p.precio

            FROM oportunidades o

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN propiedades p
                ON i.propiedad = p.propiedad

            WHERE o.oportunidad = ?
        `;

        const [oportunidades] = await connection.query(
            query2,
            [oportunidadId]
        );

        if (oportunidades.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                status: false,
                message: 'La oportunidad no existe'
            });
        }

        const datos = oportunidades[0];

        if (
            !['abierta', 'en_proceso']
                .includes(datos.estado_oportu)
        ) {
            await connection.rollback();

            return res.status(400).json({
                status: false,
                message: 'La oportunidad debe estar activa'
            });
        }

        if (monto > Number(datos.precio)) {
            await connection.rollback();

            return res.status(400).json({
                status: false,
                message: 'La reserva supera el precio de la vivienda'
            });
        }

        // Bloquear la propiedad durante la operación
        const query3 = `
            SELECT propiedad
            FROM propiedades
            WHERE propiedad = ?
            FOR UPDATE
        `;

        await connection.query(query3, [
            datos.propiedad
        ]);

        // Comprobar evaluación aprobada
        const query4 = `
            SELECT evaluacion
            FROM evaluaciones_crediticias
            WHERE oportunidad = ?
            AND estado = 'aprobada'
        `;

        const [evaluaciones] = await connection.query(
            query4,
            [oportunidadId]
        );

        if (evaluaciones.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                status: false,
                message: 'La oportunidad necesita una evaluación aprobada'
            });
        }

        // Comprobar plan de pago
        const query5 = `
            SELECT plan_pago
            FROM planes_pago
            WHERE oportunidad = ?
        `;

        const [planes] = await connection.query(
            query5,
            [oportunidadId]
        );

        if (planes.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                status: false,
                message: 'La oportunidad necesita un plan de pago'
            });
        }

        // Impedir dos reservas para una oportunidad
        const query6 = `
            SELECT reserva
            FROM reservas
            WHERE oportunidad = ?
        `;

        const [existentes] = await connection.query(
            query6,
            [oportunidadId]
        );

        if (existentes.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                status: false,
                message: 'Esta oportunidad ya tiene una reserva registrada'
            });
        }

        // Impedir reservas activas de la misma vivienda
        const query7 = `
            SELECT reserva
            FROM reservas
            WHERE propiedad = ?
            AND estado IN ('pendiente', 'confirmada')
        `;

        const [ocupadas] = await connection.query(
            query7,
            [datos.propiedad]
        );

        if (ocupadas.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                status: false,
                message: 'Esta propiedad ya tiene una reserva activa'
            });
        }

        // Registrar reserva
        const query8 = `
            INSERT INTO reservas
            (
                oportunidad,
                propiedad,
                monto_reserva,
                observacion
            )
            VALUES (?, ?, ?, ?)
        `;

        const [rows] = await connection.query(
            query8,
            [
                oportunidadId,
                datos.propiedad,
                monto,
                comentario
            ]
        );

        await connection.commit();

        return res.status(201).json({
            status: true,
            message: 'Reserva registrada correctamente',
            data: {
                reserva: rows.insertId
            }
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                message: 'Esta oportunidad ya tiene una reserva'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar reserva'
        });

    } finally {

        connection.release();

    }
});

// ==========================================
// US-35: ACTUALIZAR ESTADO DE RESERVA
// ==========================================

router.put('/:id/estado', async (req, res) => {

    const { id } = req.params;
    const { estado } = req.body;

    const reservaId = Number(id);

    if (!Number.isInteger(reservaId) || reservaId <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Reserva no válida'
        });
    }

    if (!['confirmada', 'cancelada'].includes(estado)) {
        return res.status(400).json({
            status: false,
            message: 'Estado no permitido'
        });
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // Consultar a qué propiedad pertenece
        const query9 = `
            SELECT propiedad
            FROM reservas
            WHERE reserva = ?
        `;

        const [datos] = await connection.query(
            query9,
            [reservaId]
        );

        if (datos.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                status: false,
                message: 'Reserva no encontrada'
            });
        }

        // Mantener el bloqueo por propiedad
        const query10 = `
            SELECT propiedad
            FROM propiedades
            WHERE propiedad = ?
            FOR UPDATE
        `;

        await connection.query(query10, [
            datos[0].propiedad
        ]);

        // Solo una reserva pendiente puede modificarse
        const query11 = `
            UPDATE reservas
            SET estado = ?
            WHERE reserva = ?
            AND estado = 'pendiente'
        `;

        const [rows] = await connection.query(
            query11,
            [estado, reservaId]
        );

        if (rows.affectedRows === 0) {
            await connection.rollback();

            return res.status(409).json({
                status: false,
                message: 'Solo se puede modificar una reserva pendiente'
            });
        }

        await connection.commit();

        return res.json({
            status: true,
            message: 'Estado de reserva actualizado correctamente'
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al actualizar reserva'
        });

    } finally {

        connection.release();

    }
});

module.exports = router;
