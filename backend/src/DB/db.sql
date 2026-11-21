create schema ProyectoIS;

use ProyectoIS;

create table Usuarios
(
	usuario int auto_increment,
    nombre varchar(300) not null,
    email  varchar(300) not null,
    rol enum('vendedor', 'supervisor', 'administrador') not null,
    activo BOOLEAN DEFAULT TRUE,
    primary key(usuario)
);

ALTER TABLE usuarios
ADD COLUMN contrasena_hash VARCHAR(255) NULL;

DESCRIBE usuarios;

SELECT usuario, nombre, email, rol, activo
FROM usuarios;


create table clientes 
(
	cliente int auto_increment,
    nombres  varchar(400) not null,
    apellidos varchar(400) not null,
    email     varchar(300) not null,
    telefono  varchar(300) not null, 
    origen    varchar(300) not null,                        -- de como se intereso por la empresa
    estado    varchar(300),						-- si continua como prospecto
    fecha_registro varchar(400),
    primary key(cliente)
);

create table propiedades 
(
	propiedad   int auto_increment,
    codigo      varchar(250) not null unique,
    nombre		varchar(300) not null,
    ubicacion   varchar(300) not null,
    descripcion  varchar(500),
    precio       decimal(12, 2) not null,
    estado       enum('disponible', 'reservada', 'vendida') not null default 'disponible',
    fecha_registro_prop timestamp default current_timestamp,
    primary key(propiedad)
);

create table citas 
(
	cita  int auto_increment,
    cliente   int not null,
    fecha   datetime not null, 
    lugar   varchar(300) not null, 
    motivo  varchar(200) not null,
    estado_cita    enum('pendiente', 'realizada', 'cancelada') not null,
    resultado   varchar(200) not null,
    fecha_registro_cita timestamp default current_timestamp,
    primary key(cita),
    foreign key (cliente) references clientes(cliente)
);

create table intereses(
	interes  int auto_increment,
    cliente	 int not null,
    propiedad int not null,
    observacion text,
    fecha_registro_in  timestamp default current_timestamp,
    primary key(interes),
    foreign key(cliente) references clientes(cliente),
    foreign key(propiedad) references propiedades(propiedad),
    unique (cliente, propiedad)
);

create table seguimientos 
(
	seguimiento  int auto_increment,
    cliente 	int not null,
    tipo_seg        enum('llamada','whatsapp','correo', 'presencial', 'otro') not null,
    observacion   text not null, 
    proximo_contacto   datetime,
    fecha_registro_seg  timestamp default current_timestamp,
    primary key(seguimiento),
    foreign key(cliente)  references clientes(cliente)
);

create table oportunidades
(
	oportunidad    int auto_increment,
    interes	       int not null unique,
    estado_oportu	enum('abierta','en_proceso','ganada','perdida') not null default 'abierta',
	observacion_opor	text,
    fecha_registro_opor	timestamp default current_timestamp,
    primary key(oportunidad),
    foreign key(interes) references intereses(interes)
);

create table seguimiento_oportunidades
(
	seguimiento   int auto_increment,
    oportunidad	  int not null,
    observacion_segopor  text,
    proxima_accion   datetime,
    fecha_registro   timestamp  default current_timestamp,
    primary key(seguimiento),
    foreign key(oportunidad) references oportunidades(oportunidad)
);

create table opciones_pago
(
	opcion_pago   int auto_increment,
    codigo 	      varchar(100) not null unique,
    nombre        varchar(300) not null,
    descripcion   varchar(300),
    activo     tinyint(1) not null default 1,
    primary key(opcion_pago)
);
INSERT IGNORE INTO opciones_pago
(codigo, nombre, descripcion)
VALUES
(
    'contado',
    'Pago al contado',
    'El cliente paga el valor de la vivienda sin financiamiento'
),
(
    'financiamiento',
    'Financiamiento',
    'El cliente realiza un enganche y financia el saldo restante'
);

create table planes_pago
(
	plan_pago  int auto_increment,
    oportunidad  int not null unique,
    opcion_pago  int not null,
    enganche     decimal(12,2) not null default 0,
    plazo_meses   int null,
    tasa_anual    decimal(6,3) null,
    entidad_financiera  varchar(250) null,
    condiciones  text null,
    fecha_registro_plan  timestamp default current_timestamp,
    primary key(plan_pago),
    foreign key(oportunidad) references oportunidades(oportunidad),
    foreign key(opcion_pago) references opciones_pago(opcion_pago)
);

create table informacion_financiera
(
	informacion  int auto_increment,
    cliente      int not null unique,
    ingresos_mensuales  decimal(12,2) not null,
    gastos_mensuales    decimal(12,2) not null,
    deudas_mensuales    decimal(12,2) not null default 0,
    fecha_registro_info  timestamp default current_timestamp,
    fecha_actualizacion  timestamp default current_timestamp on update current_timestamp,
    primary key(informacion),
    constraint fk_financiera_cliente
    foreign key(cliente) references clientes(cliente)
);

create table evaluaciones_crediticias
(
	evaluacion   int auto_increment,
    oportunidad  int not null unique,
    estado enum('pendiente', 'en_revision', 'aprobada', 'rechazada') not null default 'pendiente',
    resultado text null,
    fecha_registro_eval  timestamp default current_timestamp,
    fecha_actualizacion_eval timestamp default current_timestamp on update current_timestamp,
    primary key(evaluacion),
    constraint fk_evaluacion_oportunidad 
    foreign key(oportunidad) references oportunidades(oportunidad)
);

create table observaciones_crediticias
(
	observacion_id   int auto_increment,
    evaluacion   int not null,
    observacion text not null,
    fecha_registro_ob timestamp default current_timestamp,
    primary key(observacion_id),
    constraint fk_observacion_evaluacion
    foreign key(evaluacion) references evaluaciones_crediticias(evaluacion)
);


CREATE TABLE reservas (
    reserva INT AUTO_INCREMENT PRIMARY KEY,
    oportunidad INT NOT NULL UNIQUE,
    propiedad INT NOT NULL,
    monto_reserva DECIMAL(12,2) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    observacion TEXT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reserva_oportunidad
        FOREIGN KEY (oportunidad)
        REFERENCES oportunidades(oportunidad),

    CONSTRAINT fk_reserva_propiedad
        FOREIGN KEY (propiedad)
        REFERENCES propiedades(propiedad)
);


-- =========================================
-- SPRINT 5: SOLICITUDES DE CRÉDITO
-- =========================================

CREATE TABLE solicitudes_credito (

    solicitud INT AUTO_INCREMENT PRIMARY KEY,

    reserva INT NOT NULL UNIQUE,

    entidad_financiera VARCHAR(150) NOT NULL,

    monto_solicitado DECIMAL(12,2) NOT NULL,

    plazo_meses INT NOT NULL,

    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',

    observacion TEXT NULL,

    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_solicitud_reserva
        FOREIGN KEY (reserva)
        REFERENCES reservas(reserva),

    CONSTRAINT chk_solicitud_monto
        CHECK (monto_solicitado > 0),

    CONSTRAINT chk_solicitud_plazo
        CHECK (plazo_meses > 0)
);

-- =========================================
-- HISTORIAL DE SEGUIMIENTO
-- =========================================

CREATE TABLE seguimiento_credito (

    seguimiento INT AUTO_INCREMENT PRIMARY KEY,

    solicitud INT NOT NULL,

    observacion TEXT NOT NULL,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_seguimiento_credito
        FOREIGN KEY (solicitud)
        REFERENCES solicitudes_credito(solicitud)
);


-- ============================================
-- SPRINT 5 - BLOQUE 2
-- GESTIÓN DE DOCUMENTACIÓN
-- ============================================

CREATE TABLE documentos_credito (

    documento INT AUTO_INCREMENT PRIMARY KEY,

    solicitud INT NOT NULL,

    tipo_documento ENUM('dpi', 'carta_laboral', 'estados_cuenta', 'otros') NOT NULL,

    estado ENUM('pendiente', 'recibido', 'verificado', 'rechazado') NOT NULL DEFAULT 'pendiente',

    observacion VARCHAR(500) NULL,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_documento_solicitud
        FOREIGN KEY (solicitud)
        REFERENCES solicitudes_credito(solicitud),

    CONSTRAINT uq_solicitud_tipo_documento
        UNIQUE (solicitud, tipo_documento)
);


-- ==========================================
-- SPRINT 5 - BLOQUE 3
-- FIRMA DE ESCRITURAS
-- ==========================================

CREATE TABLE firmas_escrituras (

    firma INT AUTO_INCREMENT PRIMARY KEY,

    solicitud INT NOT NULL UNIQUE,

    fecha_firma DATE NOT NULL,

    notario VARCHAR(150) NOT NULL,

    referencia_escritura VARCHAR(100) NOT NULL,

    observacion TEXT NULL,

    fecha_registro TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_firma_solicitud
        FOREIGN KEY (solicitud)
        REFERENCES solicitudes_credito(solicitud)

);

-- ==========================================
-- ENTREGA DE VIVIENDAS
-- ==========================================

CREATE TABLE entregas_viviendas (

    entrega INT AUTO_INCREMENT PRIMARY KEY,

    firma INT NOT NULL UNIQUE,

    fecha_entrega DATE NOT NULL,

    responsable VARCHAR(150) NOT NULL,

    observacion TEXT NULL,

    fecha_registro TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_entrega_firma
        FOREIGN KEY (firma)
        REFERENCES firmas_escrituras(firma)

);


-- ========================================
-- SPRINT 6 - ESTADO COMERCIAL
-- ========================================

-- Nueva columna independiente para no modificar
-- los estados que uses actualmente en Propiedades.
ALTER TABLE propiedades
ADD COLUMN estado_venta ENUM('disponible', 'vendida') NOT NULL DEFAULT 'disponible';

-- ========================================
-- VENTAS COMPLETADAS
-- ========================================

CREATE TABLE ventas_cerradas (
    venta INT AUTO_INCREMENT PRIMARY KEY,

    entrega INT NOT NULL UNIQUE,
    oportunidad INT NOT NULL UNIQUE,
    propiedad INT NOT NULL UNIQUE,

    precio_cierre DECIMAL(12,2) NOT NULL,

    fecha_cierre TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venta_entrega
        FOREIGN KEY (entrega)
        REFERENCES entregas_viviendas(entrega),

    CONSTRAINT fk_venta_oportunidad
        FOREIGN KEY (oportunidad)
        REFERENCES oportunidades(oportunidad),

    CONSTRAINT fk_venta_propiedad
        FOREIGN KEY (propiedad)
        REFERENCES propiedades(propiedad)
);
