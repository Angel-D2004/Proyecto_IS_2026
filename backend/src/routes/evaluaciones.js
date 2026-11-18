
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// US-27: CONSULTAR INFORMACIÓN FINANCIERA
// ==========================================

router.get('/finanzas/:cliente', async (req, res) => {

    const { cliente } = req.params;

    try {

        const query1 = `
            SELECT *
            FROM informacion_financiera
            WHERE cliente = ?
        `;

        const [rows] = await db.query(query1, [cliente]);

        return res.json({
            status: true,
            data: rows[0] || null
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar información financiera'
        });
    }
});

// ==========================================
// US-27: REGISTRAR INFORMACIÓN FINANCIERA
// ==========================================

router.put('/finanzas/:cliente', async (req, res) => {

    const { cliente } = req.params;

    const {
        ingresos_mensuales,
        gastos_mensuales,
        deudas_mensuales
    } = req.body;

    const clienteId = Number(cliente);

    const ingresos = Number(ingresos_mensuales);
    const gastos = Number(gastos_mensuales);
    const deudas = Number(deudas_mensuales);

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Cliente no válido'
        });
    }

    const valores = [
        ingresos_mensuales,
        gastos_mensuales,
        deudas_mensuales
    ];

    if (
        valores.some(v => v === null || v === undefined || v === '') ||
        ![ingresos, gastos, deudas].every(
            n => Number.isFinite(n) && n >= 0 &&
                 Math.abs(n * 100 - Math.round(n * 100)) < 0.000001
        )
    ) {
        return res.status(400).json({
            status: false,
            message: 'Ingrese montos válidos y no negativos'
        });
    }

    try {

        const query2 = `
            INSERT INTO informacion_financiera
            (
                cliente,
                ingresos_mensuales,
                gastos_mensuales,
                deudas_mensuales
            )
            VALUES (?, ?, ?, ?)

            ON DUPLICATE KEY UPDATE
                ingresos_mensuales = VALUES(ingresos_mensuales),
                gastos_mensuales = VALUES(gastos_mensuales),
                deudas_mensuales = VALUES(deudas_mensuales)
        `;

        await db.query(query2, [
            clienteId,
            ingresos,
            gastos,
            deudas
        ]);

        return res.json({
            status: true,
            message: 'Información financiera guardada correctamente'
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({
                status: false,
                message: 'El cliente no existe'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al guardar información financiera'
        });
    }
});

// ==========================================
// US-28: CONSULTAR CAPACIDAD DE PAGO
// ==========================================

router.get('/capacidad/:cliente', async (req, res) => {

    const { cliente } = req.params;

    try {

        const query3 = `
            SELECT cliente,
                   ingresos_mensuales,
                   gastos_mensuales,
                   deudas_mensuales
            FROM informacion_financiera
            WHERE cliente = ?
        `;

        const [rows] = await db.query(query3, [cliente]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'El cliente no tiene información financiera'
            });
        }

        const datos = rows[0];

        const ingresos = Number(datos.ingresos_mensuales);
        const gastos = Number(datos.gastos_mensuales);
        const deudas = Number(datos.deudas_mensuales);

        // Referencia de dinero disponible al mes
        const disponible = Number(
            (ingresos - gastos - deudas).toFixed(2)
        );

        return res.json({
            status: true,
            data: {
                cliente: datos.cliente,
                ingresos_mensuales: ingresos,
                gastos_mensuales: gastos,
                deudas_mensuales: deudas,
                disponible_mensual: disponible,
                capacidad_referencial: Math.max(0, disponible)
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al calcular capacidad de pago'
        });
    }
});

// ==========================================
// US-30: CONSULTAR EVALUACIONES
// ==========================================

router.get('/', async (req, res) => {

    try {

        const query4 = `
            SELECT e.evaluacion,
                   e.oportunidad,
                   e.estado,
                   e.resultado,
                   e.fecha_registro_eval,
                   c.cliente,
                   CONCAT(c.nombres, ' ', c.apellidos)
                       AS nombre_cliente,
                   p.nombre AS nombre_propiedad

            FROM evaluaciones_crediticias e

            INNER JOIN oportunidades o
                ON e.oportunidad = o.oportunidad

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN clientes c
                ON i.cliente = c.cliente

            INNER JOIN propiedades p
                ON i.propiedad = p.propiedad

            ORDER BY e.evaluacion DESC
        `;

        const [rows] = await db.query(query4);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar evaluaciones'
        });
    }
});

// ==========================================
// US-29: CREAR EVALUACIÓN CREDITICIA
// ==========================================

router.post('/', async (req, res) => {

    const { oportunidad } = req.body;
    const id = Number(oportunidad);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Seleccione una oportunidad válida'
        });
    }

    try {

        // Verificar oportunidad e información financiera
        const query5 = `
            SELECT o.oportunidad
            FROM oportunidades o

            INNER JOIN intereses i
                ON o.interes = i.interes

            INNER JOIN informacion_financiera f
                ON i.cliente = f.cliente

            WHERE o.oportunidad = ?
            AND o.estado_oportu IN ('abierta', 'en_proceso')
        `;

        const [oportunidades] = await db.query(query5, [id]);

        if (oportunidades.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'La oportunidad no está activa o faltan datos financieros del cliente'
            });
        }

        const query6 = `
            INSERT INTO evaluaciones_crediticias
            (oportunidad)
            VALUES (?)
        `;

        const [rows] = await db.query(query6, [id]);

        return res.status(201).json({
            status: true,
            message: 'Evaluación creada correctamente',
            data: {
                evaluacion: rows.insertId
            }
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                message: 'Esta oportunidad ya tiene una evaluación'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al crear evaluación'
        });
    }
});

// ==========================================
// US-31: ACTUALIZAR ESTADO DE EVALUACIÓN
// ==========================================

router.put('/:id/estado', async (req, res) => {

    const { id } = req.params;
    const { estado, resultado } = req.body;

    const estadosPermitidos = [
        'pendiente',
        'en_revision',
        'aprobada',
        'rechazada'
    ];

    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
            status: false,
            message: 'Estado de evaluación no válido'
        });
    }

    if (
        resultado !== undefined &&
        resultado !== null &&
        typeof resultado !== 'string'
    ) {
        return res.status(400).json({
            status: false,
            message: 'El resultado debe ser texto'
        });
    }

    if (
        ['aprobada', 'rechazada'].includes(estado) &&
        (typeof resultado !== 'string' || !resultado.trim())
    ) {
        return res.status(400).json({
            status: false,
            message: 'Debe registrar el resultado de la evaluación'
        });
    }

    try {

        const query7 = `
            UPDATE evaluaciones_crediticias
            SET estado = ?,
                resultado = ?
            WHERE evaluacion = ?
        `;

        const [rows] = await db.query(query7, [
            estado,
            typeof resultado === 'string'
                ? resultado.trim() || null
                : null,
            id
        ]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'Evaluación no encontrada'
            });
        }

        return res.json({
            status: true,
            message: 'Evaluación actualizada correctamente'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al actualizar evaluación'
        });
    }
});

// ==========================================
// US-32: CONSULTAR OBSERVACIONES
// ==========================================

router.get('/:id/observaciones', async (req, res) => {

    const { id } = req.params;

    try {

        const query8 = `
            SELECT *
            FROM observaciones_crediticias
            WHERE evaluacion = ?
            ORDER BY observacion_id DESC
        `;

        const [rows] = await db.query(query8, [id]);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar observaciones'
        });
    }
});

// ==========================================
// US-32: REGISTRAR OBSERVACIONES
// ==========================================

router.post('/:id/observaciones', async (req, res) => {

    const { id } = req.params;
    const { observacion } = req.body;

    if (typeof observacion !== 'string' || !observacion.trim()) {
        return res.status(400).json({
            status: false,
            message: 'La observación es obligatoria'
        });
    }

    try {

        const query9 = `
            INSERT INTO observaciones_crediticias
            (evaluacion, observacion)
            VALUES (?, ?)
        `;

        const [rows] = await db.query(query9, [
            id,
            observacion.trim()
        ]);

        return res.status(201).json({
            status: true,
            message: 'Observación registrada correctamente',
            data: {
                observacion_id: rows.insertId
            }
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({
                status: false,
                message: 'La evaluación no existe'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar observación'
        });
    }
});

module.exports = router;
