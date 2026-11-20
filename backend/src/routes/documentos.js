const express = require('express');
const router = express.Router();
const db = require('../config/db');

// =======================================
// TIPOS DE DOCUMENTOS PERMITIDOS
// =======================================

const tiposPermitidos = ['dpi', 'carta_laboral', 'estados_cuenta', 'otros'];

const estadosPermitidos = ['pendiente', 'recibido', 'verificado', 'rechazado'];

// =======================================
// CONSULTAR TIPOS DE DOCUMENTOS
// GET /api/documentos/tipos
// =======================================

router.get('/tipos', (req, res) => {

    return res.json({
        status: true,
        data: [
            {
                tipo: 'dpi',
                nombre: 'DPI'
            },
            {
                tipo: 'carta_laboral',
                nombre: 'Carta laboral'
            },
            {
                tipo: 'estados_cuenta',
                nombre: 'Estados de cuenta'
            },
            {
                tipo: 'otros',
                nombre: 'Otros documentos'
            }
        ]
    });
});

// =======================================
// CONSULTAR DOCUMENTOS POR SOLICITUD
// GET /api/documentos/solicitud/:id
// =======================================

router.get('/solicitud/:id', async (req, res) => {

    const solicitudId = Number(req.params.id);

    if (
        !Number.isInteger(solicitudId) ||
        solicitudId <= 0
    ) {
        return res.status(400).json({
            status: false,
            message: 'Solicitud no válida'
        });
    }

    try {

        // Comprobar que la solicitud existe
        const [solicitudes] = await db.query(
            `
            SELECT solicitud
            FROM solicitudes_credito
            WHERE solicitud = ?
            `,
            [solicitudId]
        );

        if (solicitudes.length === 0) {

            return res.status(404).json({
                status: false,
                message: 'Solicitud no encontrada'
            });
        }

        const [documentos] = await db.query(
            `
            SELECT
                documento,
                solicitud,
                tipo_documento,
                estado,
                observacion,
                fecha_registro,
                fecha_actualizacion

            FROM documentos_credito

            WHERE solicitud = ?

            ORDER BY documento DESC
            `,
            [solicitudId]
        );

        return res.json({
            status: true,
            data: documentos
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar documentos'
        });
    }
});

// =======================================
// REGISTRAR DOCUMENTO
// POST /api/documentos
// =======================================

router.post('/', async (req, res) => {

    const {
        solicitud,
        tipo_documento,
        observacion
    } = req.body;

    const solicitudId = Number(solicitud);

    if (
        !Number.isInteger(solicitudId) ||
        solicitudId <= 0
    ) {
        return res.status(400).json({
            status: false,
            message: 'Seleccione una solicitud válida'
        });
    }

    if (!tiposPermitidos.includes(tipo_documento)) {

        return res.status(400).json({
            status: false,
            message: 'Tipo de documento no permitido'
        });
    }

    if (
        observacion !== undefined &&
        observacion !== null &&
        typeof observacion !== 'string'
    ) {
        return res.status(400).json({
            status: false,
            message: 'La observación debe ser texto'
        });
    }

    const texto = typeof observacion === 'string'
        ? observacion.trim()
        : '';

    if (texto.length > 500) {

        return res.status(400).json({
            status: false,
            message: 'La observación no puede superar 500 caracteres'
        });
    }

    try {

        // No registrar documentos en trámites rechazados
        const [solicitudes] = await db.query(
            `
            SELECT solicitud, estado
            FROM solicitudes_credito
            WHERE solicitud = ?
            `,
            [solicitudId]
        );

        if (solicitudes.length === 0) {

            return res.status(404).json({
                status: false,
                message: 'Solicitud no encontrada'
            });
        }

        if (solicitudes[0].estado === 'rechazada') {

            return res.status(409).json({
                status: false,
                message:
                    'No se pueden registrar documentos en una solicitud rechazada'
            });
        }

        const [resultado] = await db.query(
            `
            INSERT INTO documentos_credito
            (
                solicitud,
                tipo_documento,
                observacion
            )
            VALUES (?, ?, ?)
            `,
            [
                solicitudId,
                tipo_documento,
                texto || null
            ]
        );

        return res.status(201).json({
            status: true,
            message: 'Documento registrado correctamente',
            data: {
                documento: resultado.insertId
            }
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {

            return res.status(409).json({
                status: false,
                message:
                    'Este tipo de documento ya está registrado para la solicitud'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {

            return res.status(404).json({
                status: false,
                message: 'La solicitud no existe'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar documento'
        });
    }
});

// =======================================
// ACTUALIZAR ESTADO DE DOCUMENTO
// PUT /api/documentos/:id/estado
// =======================================

router.put('/:id/estado', async (req, res) => {

    const documentoId = Number(req.params.id);

    const { estado, observacion } = req.body;

    if (
        !Number.isInteger(documentoId) ||
        documentoId <= 0
    ) {
        return res.status(400).json({
            status: false,
            message: 'Documento no válido'
        });
    }

    if (!estadosPermitidos.includes(estado)) {

        return res.status(400).json({
            status: false,
            message: 'Estado de documento no válido'
        });
    }

    if (
        observacion !== undefined &&
        observacion !== null &&
        typeof observacion !== 'string'
    ) {
        return res.status(400).json({
            status: false,
            message: 'La observación debe ser texto'
        });
    }

    const texto = typeof observacion === 'string'
        ? observacion.trim()
        : null;

    if (texto !== null && texto.length > 500) {

        return res.status(400).json({
            status: false,
            message: 'La observación no puede superar 500 caracteres'
        });
    }

    try {

        // Consultar estado actual
        const [documentos] = await db.query(
            `
            SELECT
                d.documento,
                d.estado,
                s.estado AS estado_solicitud

            FROM documentos_credito d

            INNER JOIN solicitudes_credito s
                ON d.solicitud = s.solicitud

            WHERE d.documento = ?
            `,
            [documentoId]
        );

        if (documentos.length === 0) {

            return res.status(404).json({
                status: false,
                message: 'Documento no encontrado'
            });
        }

        const actual = documentos[0];

        if (actual.estado_solicitud === 'rechazada') {

            return res.status(409).json({
                status: false,
                message:
                    'La solicitud de crédito está rechazada'
            });
        }

        // Transiciones permitidas
        const transiciones = {
            pendiente: ['recibido'],
            recibido: ['verificado', 'rechazado'],
            rechazado: ['recibido'],
            verificado: []
        };

        if (!transiciones[actual.estado].includes(estado)) {

            return res.status(409).json({
                status: false,
                message:
                    'Cambio de estado no permitido'
            });
        }

        // Evitar que un cambio simultáneo
        // sobrescriba el estado anterior
        const [resultado] = await db.query(
            `
            UPDATE documentos_credito

            SET estado = ?,
                observacion = COALESCE(?, observacion)

            WHERE documento = ?
              AND estado = ?
            `,
            [
                estado,
                texto || null,
                documentoId,
                actual.estado
            ]
        );

        if (resultado.affectedRows === 0) {

            return res.status(409).json({
                status: false,
                message:
                    'El documento fue modificado; actualice la información'
            });
        }

        return res.json({
            status: true,
            message: 'Estado del documento actualizado correctamente'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al actualizar documento'
        });
    }
});

// =======================================
// RESUMEN DOCUMENTAL POR SOLICITUD
// GET /api/documentos/solicitud/:id/resumen
// =======================================

router.get('/solicitud/:id/resumen', async (req, res) => {

    const solicitudId = Number(req.params.id);

    if (
        !Number.isInteger(solicitudId) ||
        solicitudId <= 0
    ) {
        return res.status(400).json({
            status: false,
            message: 'Solicitud no válida'
        });
    }

    try {

        const [solicitudes] = await db.query(
            `
            SELECT solicitud
            FROM solicitudes_credito
            WHERE solicitud = ?
            `,
            [solicitudId]
        );

        if (solicitudes.length === 0) {

            return res.status(404).json({
                status: false,
                message: 'Solicitud no encontrada'
            });
        }

        const [rows] = await db.query(
            `
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(estado = 'pendiente'), 0)
                    AS pendientes,
                COALESCE(SUM(estado = 'recibido'), 0)
                    AS recibidos,
                COALESCE(SUM(estado = 'verificado'), 0)
                    AS verificados,
                COALESCE(SUM(estado = 'rechazado'), 0)
                    AS rechazados

            FROM documentos_credito

            WHERE solicitud = ?
            `,
            [solicitudId]
        );

        const resumen = rows[0];

        return res.json({
            status: true,
            data: {
                total: Number(resumen.total),
                pendientes: Number(resumen.pendientes),
                recibidos: Number(resumen.recibidos),
                verificados: Number(resumen.verificados),
                rechazados: Number(resumen.rechazados)
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar resumen documental'
        });
    }
});

module.exports = router;
