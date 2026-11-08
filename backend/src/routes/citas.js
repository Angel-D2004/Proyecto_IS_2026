const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Consultar las citas 
router.get('/', async(req, res ) => {
    const {estado} = req.query;
    
    const query4 = `select p.punteo, u.email, p.puntaje, p.fecha, j.nombre
                    from Punteos p, Usuarios u, Juegos j
                    where p.usuario = u.usuario 
                    and p.juego = j.juego
                    order by p.punteo desc`;
    try{
        const [rows] = await pool.query(query4);
        return res.json(rows);
    }catch(error){
        console.error("Database error:", error);
        return res.status(500).json({ status: -1, message: "Internal server error" });
    }
});