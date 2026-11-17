
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// US-23: Consultar opciones de pago
// ==========================================

router.get('/opciones', async (req, res) => {

    const query1 = `
        SELECT opcion_pago, codigo, nombre, descripcion
        FROM opciones_pago
        WHERE activo = 1
        ORDER BY opcion_pago ASC
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
            message: 'Error al consultar opciones de pago'
        });
    }
});

// ==========================================
// Consultar plan de pago de una oportunidad
// ==========================================

router.get('/oportunidad/:id', async (req, res) => {

    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Oportunidad no válida'
        });
    }

    const query2 = `
        SELECT pp.plan_pago,
               pp.oportunidad,
               pp.opcion_pago,
               op.nombre AS nombre_opcion,
               op.codigo,
               pp.enganche,
               pp.plazo_meses,
               pp.tasa_anual,
               pp.entidad_financiera,
               pp.condiciones,
               pp.fecha_registro_plan
        FROM planes_pago pp
        INNER JOIN opciones_pago op
            ON pp.opcion_pago = op.opcion_pago
        WHERE pp.oportunidad = ?
    `;

    try {

        const [rows] = await db.query(query2, [id]);

        return res.json({
            status: true,
            data: rows.length > 0 ? rows[0] : null
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar plan de pago'
        });
    }
});



router.put('/oportunidad/:id', async (req, res) => {

    const { id } = req.params;

    const {
        opcion_pago,
        enganche,
        plazo_meses,
        tasa_anual,
        entidad_financiera,
        condiciones
    } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Oportunidad no válida'
        });
    }

    const opcionId = Number(opcion_pago);
    const montoEnganche = Number(enganche);

    if (!Number.isInteger(opcionId) || opcionId <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Seleccione una opción de pago'
        });
    }

    if (
        enganche === null ||
        enganche === undefined ||
        enganche === '' ||
        !Number.isFinite(montoEnganche) ||
        montoEnganche < 0 ||
        !Number.isInteger(Math.round(montoEnganche * 100))
    ) {
        return res.status(400).json({
            status: false,
            message: 'El enganche debe ser un monto válido'
        });
    }

    try {

        // Consultar la oportunidad y el precio de la propiedad
        const query3 = `
            SELECT o.oportunidad,
                   o.estado_oportu,
                   p.precio
            FROM oportunidades o
            INNER JOIN intereses i
                ON o.interes = i.interes
            INNER JOIN propiedades p
                ON i.propiedad = p.propiedad
            WHERE o.oportunidad = ?
        `;

        const [oportunidades] = await db.query(query3, [id]);

        if (oportunidades.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'La oportunidad no existe'
            });
        }

        const oportunidad = oportunidades[0];
        const precio = Number(oportunidad.precio);

        if (!Number.isFinite(precio)) {
            return res.status(400).json({
                status: false,
                message: 'La propiedad no tiene un precio válido'
            });
        }

        if (['ganada', 'perdida'].includes(oportunidad.estado_oportu)) {
            return res.status(400).json({
                status: false,
                message: 'No se puede modificar una oportunidad cerrada'
            });
        }

        if (montoEnganche > precio) {
            return res.status(400).json({
                status: false,
                message: 'El enganche no puede superar el precio de la vivienda'
            });
        }

        // Verificar la opción seleccionada
        const query4 = `
            SELECT opcion_pago, codigo
            FROM opciones_pago
            WHERE opcion_pago = ?
            AND activo = 1
        `;

        const [opciones] = await db.query(query4, [opcionId]);

        if (opciones.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'La opción de pago no está disponible'
            });
        }

        const codigo = opciones[0].codigo;
        let plazo = null;
        let tasa = null;
        let entidad = null;

        if (codigo === 'financiamiento') {

            plazo = Number(plazo_meses);

            if (!Number.isInteger(plazo) || plazo <= 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Ingrese un plazo de financiamiento válido'
                });
            }

            if (
                tasa_anual !== null &&
                tasa_anual !== undefined &&
                tasa_anual !== ''
            ) {
                tasa = Number(tasa_anual);

                if (!Number.isFinite(tasa) || tasa < 0 || tasa > 999.999) {
                    return res.status(400).json({
                        status: false,
                        message: 'Ingrese una tasa anual válida'
                    });
                }
            }

            entidad = typeof entidad_financiera === 'string'
                ? entidad_financiera.trim() || null
                : null;
        }

        const observaciones = typeof condiciones === 'string'
            ? condiciones.trim() || null
            : null;

        // Guardar o actualizar sin duplicar planes
        const query5 = `
            INSERT INTO planes_pago
            (
                oportunidad,
                opcion_pago,
                enganche,
                plazo_meses,
                tasa_anual,
                entidad_financiera,
                condiciones
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)

            ON DUPLICATE KEY UPDATE
                opcion_pago = VALUES(opcion_pago),
                enganche = VALUES(enganche),
                plazo_meses = VALUES(plazo_meses),
                tasa_anual = VALUES(tasa_anual),
                entidad_financiera = VALUES(entidad_financiera),
                condiciones = VALUES(condiciones)
        `;

        await db.query(query5, [
            id,
            opcionId,
            montoEnganche,
            plazo,
            tasa,
            entidad,
            observaciones
        ]);

        return res.json({
            status: true,
            message: 'Plan de pago guardado correctamente'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al guardar el plan de pago'
        });
    }
});

module.exports = router;
