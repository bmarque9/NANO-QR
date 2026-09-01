/* =========================================================
   NANO QR - CONEXIÓN SUPABASE
   ========================================================= */

const NANO_SUPABASE_URL =
    "https://xmlifzybnovnmjdsaxl.supabase.co";

const NANO_SUPABASE_KEY =
    "sb_publishable_jgN5hee6h-Xsohkoe8pfug__oWSZRyK";


/* =========================================================
   CLIENTE SUPABASE
   ========================================================= */

if (
    !window.supabase ||
    !window.supabase.createClient
) {
    throw new Error(
        "No se pudo cargar la librería de Supabase."
    );
}


const nanoClient =
    window.supabase.createClient(
        NANO_SUPABASE_URL,
        NANO_SUPABASE_KEY
    );


/* =========================================================
   GUARDAR PALLET Y SUS PIEZAS
   ========================================================= */

async function nanoGuardarPallet(
    identificador,
    piezas
) {

    /* Buscar si ya existe */

    const { data: existente, error: errorBusqueda } =
        await nanoClient
            .from("pallets")
            .select("id, identificador")
            .eq(
                "identificador",
                identificador
            )
            .maybeSingle();


    if (errorBusqueda) {
        throw errorBusqueda;
    }


    let pallet;


    /* =====================================
       SI YA EXISTE
       ===================================== */

    if (existente) {

        pallet = existente;

    }


    /* =====================================
       SI NO EXISTE
       ===================================== */

    else {

        const { data, error } =
            await nanoClient
                .from("pallets")
                .insert({

                    identificador:
                        identificador,

                    estado:
                        "ACTIVO",

                    nota:
                        ""

                })
                .select()
                .single();


        if (error) {
            throw error;
        }


        pallet = data;

    }


    /* =====================================
       OBTENER PIEZAS ACTUALES
       ===================================== */

    const { data: actuales, error: errorActuales } =
        await nanoClient
            .from("piezas")
            .select("id, numero_serie")
            .eq(
                "pallet_id",
                pallet.id
            );


    if (errorActuales) {
        throw errorActuales;
    }


    const seriesNuevas =
        piezas
            .map(
                function (pieza) {
                    return pieza.serie;
                }
            )
            .filter(Boolean);


    /* =====================================
       QUITAR PIEZAS QUE YA NO ESTÁN
       ===================================== */

    for (
        const piezaActual of actuales || []
    ) {

        if (
            !seriesNuevas.includes(
                piezaActual.numero_serie
            )
        ) {

            const { error } =
                await nanoClient
                    .from("piezas")
                    .update({

                        pallet_id:
                            null,

                        estado:
                            "LIBERADA"

                    })
                    .eq(
                        "id",
                        piezaActual.id
                    );


            if (error) {
                throw error;
            }

        }

    }


    /* =====================================
       GUARDAR / ACTUALIZAR PIEZAS
       ===================================== */

    for (
        const pieza of piezas
    ) {

        if (!pieza.serie) {
            continue;
        }


        const { data: existentePieza, error: errorPieza } =
            await nanoClient
                .from("piezas")
                .select("id")
                .eq(
                    "numero_serie",
                    pieza.serie
                )
                .maybeSingle();


        if (errorPieza) {
            throw errorPieza;
        }


        /* ACTUALIZAR */

        if (existentePieza) {

            const { error } =
                await nanoClient
                    .from("piezas")
                    .update({

                        modelo:
                            pieza.modelo || "",

                        codigo_modelo:
                            pieza.codigo || "",

                        pallet_id:
                            pallet.id,

                        estado:
                            "EN PALLET",

                        nota:
                            pieza.nota || ""

                    })
                    .eq(
                        "id",
                        existentePieza.id
                    );


            if (error) {
                throw error;
            }

        }


        /* INSERTAR */

        else {

            const { error } =
                await nanoClient
                    .from("piezas")
                    .insert({

                        numero_serie:
                            pieza.serie,

                        modelo:
                            pieza.modelo || "",

                        codigo_modelo:
                            pieza.codigo || "",

                        pallet_id:
                            pallet.id,

                        estado:
                            "EN PALLET",

                        nota:
                            pieza.nota || "",

                        motivo_segregacion:
                            ""

                    });


            if (error) {
                throw error;
            }

        }

    }


    /* =====================================
       ESTADO DEL PALLET
       ===================================== */

    const { error: errorEstado } =
        await nanoClient
            .from("pallets")
            .update({

                estado:
                    piezas.length > 0
                        ? "ACTIVO"
                        : "VACIO"

            })
            .eq(
                "id",
                pallet.id
            );


    if (errorEstado) {
        throw errorEstado;
    }


    return pallet;

}


/* =========================================================
   CONSULTAR PALLET
   ========================================================= */

async function nanoConsultarPallet(
    identificador
) {

    const { data: pallet, error: errorPallet } =
        await nanoClient
            .from("pallets")
            .select("*")
            .eq(
                "identificador",
                identificador
            )
            .maybeSingle();


    if (errorPallet) {
        throw errorPallet;
    }


    if (!pallet) {

        throw new Error(
            "No existe el pallet " +
            identificador
        );

    }


    const { data: piezas, error: errorPiezas } =
        await nanoClient
            .from("piezas")
            .select("*")
            .eq(
                "pallet_id",
                pallet.id
            )
            .neq(
                "estado",
                "SEGREGADA"
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (errorPiezas) {
        throw errorPiezas;
    }


    return {

        pallet:
            pallet.identificador,

        piezas:
            (piezas || []).map(
                function (pieza) {

                    return {

                        serie:
                            pieza.numero_serie,

                        modelo:
                            pieza.modelo,

                        codigo:
                            pieza.codigo_modelo,

                        nota:
                            pieza.nota || "",

                        estado:
                            pieza.estado

                    };

                }
            )

    };

}


/* =========================================================
   BUSCAR PIEZA
   ========================================================= */

async function nanoConsultarPieza(
    numeroSerie
) {

    const { data, error } =
        await nanoClient
            .from("piezas")
            .select("*")
            .eq(
                "numero_serie",
                numeroSerie
            )
            .maybeSingle();


    if (error) {
        throw error;
    }


    return data;

}


/* =========================================================
   MODIFICAR NOTA
   ========================================================= */

async function nanoModificarNota(
    numeroSerie,
    nota
) {

    const { error } =
        await nanoClient
            .from("piezas")
            .update({

                nota:
                    nota || ""

            })
            .eq(
                "numero_serie",
                numeroSerie
            );


    if (error) {
        throw error;
    }

}


/* =========================================================
   SEGREGAR PIEZA
   ========================================================= */

async function nanoSegregarPieza(
    numeroSerie,
    motivo
) {

    const { error } =
        await nanoClient
            .from("piezas")
            .update({

                estado:
                    "SEGREGADA",

                motivo_segregacion:
                    motivo || "",

                pallet_id:
                    null

            })
            .eq(
                "numero_serie",
                numeroSerie
            );


    if (error) {
        throw error;
    }

}


/* =========================================================
   GUARDAR RACK
   ========================================================= */

async function nanoGuardarRack(
    identificador,
    pallets
) {

    const { data: existente, error: errorBusqueda } =
        await nanoClient
            .from("racks")
            .select("id, identificador")
            .eq(
                "identificador",
                identificador
            )
            .maybeSingle();


    if (errorBusqueda) {
        throw errorBusqueda;
    }


    let rack;


    if (existente) {

        rack = existente;

    }


    else {

        const { data, error } =
            await nanoClient
                .from("racks")
                .insert({

                    identificador:
                        identificador,

                    nota:
                        ""

                })
                .select()
                .single();


        if (error) {
            throw error;
        }


        rack = data;

    }


    for (
        const pallet of pallets
    ) {

        const { data: dbPallet, error } =
            await nanoClient
                .from("pallets")
                .select("id")
                .eq(
                    "identificador",
                    pallet.pallet
                )
                .maybeSingle();


        if (error) {
            throw error;
        }


        if (!dbPallet) {

            throw new Error(
                "No existe el pallet " +
                pallet.pallet
            );

        }


        const { error: errorUpdate } =
            await nanoClient
                .from("pallets")
                .update({

                    rack_id:
                        rack.id

                })
                .eq(
                    "id",
                    dbPallet.id
                );


        if (errorUpdate) {
            throw errorUpdate;
        }

    }


    return rack;

}


/* =========================================================
   CONSULTAR RACK
   ========================================================= */

async function nanoConsultarRack(
    identificador
) {

    const { data: rack, error: errorRack } =
        await nanoClient
            .from("racks")
            .select("*")
            .eq(
                "identificador",
                identificador
            )
            .maybeSingle();


    if (errorRack) {
        throw errorRack;
    }


    if (!rack) {

        throw new Error(
            "No existe el rack " +
            identificador
        );

    }


    const { data: pallets, error: errorPallets } =
        await nanoClient
            .from("pallets")
            .select(
                "id, identificador"
            )
            .eq(
                "rack_id",
                rack.id
            );


    if (errorPallets) {
        throw errorPallets;
    }


    const resultado = [];


    for (
        const pallet of pallets || []
    ) {

        const datos =
            await nanoConsultarPallet(
                pallet.identificador
            );


        resultado.push(
            datos
        );

    }


    return {

        rack:
            rack.identificador,

        pallets:
            resultado

    };

}


/* =========================================================
   HACER FUNCIONES ACCESIBLES
   ========================================================= */

window.NANO_DB = {

    guardarPallet:
        nanoGuardarPallet,

    consultarPallet:
        nanoConsultarPallet,

    consultarPieza:
        nanoConsultarPieza,

    modificarNota:
        nanoModificarNota,

    segregarPieza:
        nanoSegregarPieza,

    guardarRack:
        nanoGuardarRack,

    consultarRack:
        nanoConsultarRack

};


console.log(
    "✅ NANO QR: conexión con Supabase preparada."
);
