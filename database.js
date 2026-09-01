/* =========================================================
   NANO QR - DATABASE.JS
   VERSION INTEGRADA CON SUPABASE
   ========================================================= */

/*
   ========================================================
   1. CONFIGURACIÓN SUPABASE
   ========================================================
*/

const NANO_SUPABASE_URL =
    "https://xmlifzybnovnmjdsaxl.supabase.co";

/*
   PEGA AQUÍ TU PUBLISHABLE KEY REAL.

   Debe comenzar con:

   sb_publishable_

   NO uses:
   - sb_secret_
   - service_role
*/
const NANO_SUPABASE_KEY =
    "sb_publishable_jgN5hee6h-Xsohkoe8pfug__oWSZRyK";


/*
   ========================================================
   2. CLIENTE SUPABASE
   ========================================================
*/

let NANO_DB_CLIENT = null;

let NANO_DB_LISTENER_INSTALADO = false;


function nanoInicializarSupabase() {

    if (NANO_DB_CLIENT) {
        return NANO_DB_CLIENT;
    }


    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "NANO QR: Supabase JS no está disponible."
        );

        return null;

    }


    if (
        !NANO_SUPABASE_KEY ||
        NANO_SUPABASE_KEY ===
        "PEGA_AQUI_TU_SB_PUBLISHABLE_KEY" ||
        !NANO_SUPABASE_KEY.startsWith(
            "sb_publishable_"
        )
    ) {

        console.error(
            "NANO QR: La Publishable Key no es válida."
        );

        return null;

    }


    NANO_DB_CLIENT =
        window.supabase.createClient(

            NANO_SUPABASE_URL,

            NANO_SUPABASE_KEY

        );


    console.log(
        "✅ NANO QR: Supabase conectado."
    );


    return NANO_DB_CLIENT;

}


/*
   ========================================================
   3. OBTENER PIEZAS DE LA APLICACIÓN
   ========================================================
*/

function nanoObtenerPiezasActuales() {

    /*
       Nuestro script.js ya tiene el puente
       NANO_GET_PIEZAS.
    */

    if (
        typeof window.NANO_GET_PIEZAS ===
        "function"
    ) {

        const piezas =
            window.NANO_GET_PIEZAS();


        if (Array.isArray(piezas)) {

            return piezas;

        }

    }


    /*
       Compatibilidad adicional.
    */

    if (
        Array.isArray(
            window.palletActual
        )
    ) {

        return window.palletActual;

    }


    return [];

}


/*
   ========================================================
   4. OBTENER IDENTIFICADOR PALLET
   ========================================================
*/

function nanoObtenerIdentificadorPallet() {

    const campo =
        document.getElementById(
            "palletNumero"
        );


    if (campo) {

        return campo.value.trim();

    }


    const consulta =
        document.getElementById(
            "consultaNumero"
        );


    if (consulta) {

        return consulta.textContent.trim();

    }


    return "";

}


/*
   ========================================================
   5. GUARDAR PALLET COMPLETO
   ========================================================
*/

async function nanoGuardarPalletCompleto(

    identificador,

    piezas

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "No se pudo conectar con Supabase."
        );

    }


    if (!identificador) {

        throw new Error(
            "El pallet no tiene identificador."
        );

    }


    if (
        !Array.isArray(piezas)
    ) {

        piezas = [];

    }


    if (
        piezas.length === 0
    ) {

        throw new Error(
            "El pallet no tiene piezas."
        );

    }


    if (
        piezas.length > 18
    ) {

        throw new Error(
            "El pallet no puede tener más de 18 piezas."
        );

    }


    /*
       =============================================
       BUSCAR PALLET
       =============================================
    */

    const {

        data: palletExistente,

        error: errorBusqueda

    } = await db

        .from("pallets")

        .select(
            "id, identificador"
        )

        .eq(
            "identificador",
            identificador
        )

        .maybeSingle();


    if (errorBusqueda) {

        throw errorBusqueda;

    }


    let pallet;


    /*
       =============================================
       CREAR PALLET NUEVO
       =============================================
    */

    if (!palletExistente) {

        const {

            data,

            error

        } = await db

            .from("pallets")

            .insert({

                identificador:
                    identificador,

                nota:
                    "",

                estado:
                    "ACTIVO"

            })

            .select(
                "id, identificador"
            )

            .single();


        if (error) {

            throw error;

        }


        pallet = data;

    }


    /*
       =============================================
       PALLET YA EXISTENTE
       =============================================
    */

    else {

        pallet =
            palletExistente;

    }


    /*
       =============================================
       GUARDAR CADA PIEZA
       =============================================
    */

    for (
        const pieza of piezas
    ) {

        if (
            !pieza ||
            !pieza.serie
        ) {

            continue;

        }


        /*
           Buscar pieza por número de serie.
        */

        const {

            data: piezaExistente,

            error: errorPieza

        } = await db

            .from("piezas")

            .select(
                "id, numero_serie"
            )

            .eq(
                "numero_serie",
                pieza.serie
            )

            .maybeSingle();


        if (errorPieza) {

            throw errorPieza;

        }


        /*
           ======================================
           PIEZA EXISTENTE
           ======================================
        */

        if (piezaExistente) {

            const {

                error

            } = await db

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
                    piezaExistente.id
                );


            if (error) {

                throw error;

            }

        }


        /*
           ======================================
           PIEZA NUEVA
           ======================================
        */

        else {

            const {

                error

            } = await db

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


    /*
       =============================================
       ACTUALIZAR ESTADO PALLET
       =============================================
    */

    const {

        error: errorEstado

    } = await db

        .from("pallets")

        .update({

            estado:
                "ACTIVO"

        })

        .eq(
            "id",
            pallet.id
        );


    if (errorEstado) {

        throw errorEstado;

    }


    console.log(
        "✅ Pallet guardado:",
        identificador
    );


    return pallet;

}


/*
   ========================================================
   6. CONSULTAR PALLET
   ========================================================
*/

async function nanoConsultarPallet(

    identificador

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "Supabase no está conectado."
        );

    }


    const {

        data: pallet,

        error: errorPallet

    } = await db

        .from("pallets")

        .select(
            "id, identificador, rack_id, nota, estado"
        )

        .eq(
            "identificador",
            identificador
        )

        .maybeSingle();


    if (errorPallet) {

        throw errorPallet;

    }


    if (!pallet) {

        return null;

    }


    const {

        data: piezas,

        error: errorPiezas

    } = await db

        .from("piezas")

        .select(
            "numero_serie, modelo, codigo_modelo, estado, nota, motivo_segregacion"
        )

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
                ascending:
                    true
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
                function(p) {

                    return {

                        serie:
                            p.numero_serie,

                        modelo:
                            p.modelo,

                        codigo:
                            p.codigo_modelo,

                        nota:
                            p.nota || "",

                        estado:
                            p.estado

                    };

                }
            )

    };

}


/*
   ========================================================
   7. CONSULTAR PIEZA
   ========================================================
*/

async function nanoConsultarPieza(

    numeroSerie

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "Supabase no está conectado."
        );

    }


    const {

        data,

        error

    } = await db

        .from("piezas")

        .select(
            "*"
        )

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


/*
   ========================================================
   8. MODIFICAR NOTA
   ========================================================
*/

async function nanoModificarNota(

    numeroSerie,

    nota

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "Supabase no está conectado."
        );

    }


    const {

        error

    } = await db

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


    console.log(
        "✅ Nota actualizada:",
        numeroSerie
    );

}


/*
   ========================================================
   9. SEGREGAR PIEZA
   ========================================================
*/

async function nanoSegregarPieza(

    numeroSerie,

    motivo

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "Supabase no está conectado."
        );

    }


    const {

        error

    } = await db

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


    console.log(
        "✅ Pieza segregada:",
        numeroSerie
    );

}


/*
   ========================================================
   10. OBTENER PALLETS VISIBLES DE UN RACK
   ========================================================
*/

function nanoObtenerPalletsDesdePantallaRack() {

    const contenedor =
        document.getElementById(
            "listaPalletsRack"
        );


    if (!contenedor) {

        return [];

    }


    const elementos =
        contenedor.querySelectorAll(
            ".palletRack"
        );


    const resultado = [];


    elementos.forEach(
        function(elemento) {

            const strong =
                elemento.querySelector(
                    "strong"
                );


            if (strong) {

                const identificador =
                    strong.textContent.trim();


                if (
                    identificador
                ) {

                    resultado.push(
                        identificador
                    );

                }

            }

        }
    );


    return resultado;

}


/*
   ========================================================
   11. GUARDAR RACK
   ========================================================
*/

async function nanoGuardarRack(

    identificador,

    identificadoresPallet

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "Supabase no está conectado."
        );

    }


    if (!identificador) {

        throw new Error(
            "El rack no tiene identificador."
        );

    }


    if (
        !Array.isArray(
            identificadoresPallet
        )
    ) {

        identificadoresPallet = [];

    }


    /*
       ==============================================
       BUSCAR / CREAR RACK
       ==============================================
    */

    const {

        data: rackExistente,

        error: errorRack

    } = await db

        .from("racks")

        .select(
            "id, identificador"
        )

        .eq(
            "identificador",
            identificador
        )

        .maybeSingle();


    if (errorRack) {

        throw errorRack;

    }


    let rack;


    if (rackExistente) {

        rack =
            rackExistente;

    }


    else {

        const {

            data,

            error

        } = await db

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


    /*
       ==============================================
       OBTENER PALLETS ACTUALES DEL RACK
       ==============================================
    */

    const {

        data: anteriores,

        error: errorAnteriores

    } = await db

        .from("pallets")

        .select(
            "id, identificador"
        )

        .eq(
            "rack_id",
            rack.id
        );


    if (errorAnteriores) {

        throw errorAnteriores;

    }


    /*
       ==============================================
       ASIGNAR PALLETS
       ==============================================
    */

    const idsAsignados = [];


    for (
        const identificadorPallet of
        identificadoresPallet
    ) {

        const {

            data: pallet,

            error

        } = await db

            .from("pallets")

            .select(
                "id, identificador"
            )

            .eq(
                "identificador",
                identificadorPallet
            )

            .maybeSingle();


        if (error) {

            throw error;

        }


        if (!pallet) {

            throw new Error(

                "No existe el pallet " +
                identificadorPallet +
                " en Supabase."

            );

        }


        idsAsignados.push(
            pallet.id
        );


        const {

            error: errorAsignar

        } = await db

            .from("pallets")

            .update({

                rack_id:
                    rack.id

            })

            .eq(
                "id",
                pallet.id
            );


        if (errorAsignar) {

            throw errorAsignar;

        }

    }


    /*
       ==============================================
       QUITAR PALLETS QUE YA NO APARECEN
       ==============================================
    */

    for (
        const palletAnterior of
        anteriores || []
    ) {

        if (
            !idsAsignados.includes(
                palletAnterior.id
            )
        ) {

            const {

                error

            } = await db

                .from("pallets")

                .update({

                    rack_id:
                        null

                })

                .eq(
                    "id",
                    palletAnterior.id
                );


            if (error) {

                throw error;

            }

        }

    }


    console.log(
        "✅ Rack sincronizado:",
        identificador
    );


    return rack;

}


/*
   ========================================================
   12. CONSULTAR RACK
   ========================================================
*/

async function nanoConsultarRack(

    identificador

) {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        throw new Error(
            "Supabase no está conectado."
        );

    }


    const {

        data: rack,

        error: errorRack

    } = await db

        .from("racks")

        .select(
            "id, identificador, nota"
        )

        .eq(
            "identificador",
            identificador
        )

        .maybeSingle();


    if (errorRack) {

        throw errorRack;

    }


    if (!rack) {

        return null;

    }


    const {

        data: pallets,

        error: errorPallets

    } = await db

        .from("pallets")

        .select(
            "id, identificador, estado"
        )

        .eq(
            "rack_id",
            rack.id
        )

        .order(
            "id",
            {
                ascending:
                    true
            }
        );


    if (errorPallets) {

        throw errorPallets;

    }


    const resultado =
        [];


    for (
        const pallet of
        pallets || []
    ) {

        const datos =
            await nanoConsultarPallet(
                pallet.identificador
            );


        if (datos) {

            resultado.push(
                datos
            );

        }

    }


    return {

        rack:
            rack.identificador,

        pallets:
            resultado

    };

}


/*
   ========================================================
   13. GENERAR QR DE PALLET
   ========================================================
*/

async function nanoGenerarQRPallet(

    identificador

) {

    const contenedor =
        document.getElementById(
            "codigoQR"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML =
        "";


    document
        .getElementById(
            "qrPalletNumero"
        )
        .textContent =
        identificador;


    const informacion =
        JSON.stringify({

            tipo:
                "PALLET",

            id:
                identificador

        });


    new QRCode(

        contenedor,

        {

            text:
                informacion,

            width:
                240,

            height:
                240,

            correctLevel:
                QRCode.CorrectLevel.M

        }

    );

}


/*
   ========================================================
   14. INTERCEPTAR FINALIZAR PALLET
   ========================================================
*/

function nanoConectarFinalizarPallet() {

    if (
        NANO_DB_LISTENER_INSTALADO
    ) {

        return;

    }


    const boton =
        document.getElementById(
            "finalizarPallet"
        );


    if (!boton) {

        console.error(
            "NANO QR: No se encontró finalizarPallet."
        );

        return;

    }


    boton.addEventListener(

        "click",

        async function(event) {

            /*
               Capturamos el evento antes
               del comportamiento original.
            */

            event.preventDefault();

            event.stopImmediatePropagation();


            try {

                const identificador =
                    nanoObtenerIdentificadorPallet();


                const piezas =
                    nanoObtenerPiezasActuales();


                if (!identificador) {

                    alert(
                        "Escribe el identificador del pallet."
                    );

                    return;

                }


                if (
                    !piezas ||
                    piezas.length === 0
                ) {

                    alert(
                        "Agrega al menos una pieza."
                    );

                    return;

                }


                /*
                   GUARDAR EN SUPABASE
                */

                await nanoGuardarPalletCompleto(

                    identificador,

                    piezas

                );


                /*
                   GENERAR QR
                */

                await nanoGenerarQRPallet(

                    identificador

                );


                /*
                   Mostrar pantalla QR
                */

                document
                    .querySelectorAll(
                        ".app > div"
                    )
                    .forEach(
                        function(div) {

                            div.classList.add(
                                "oculto"
                            );

                        }
                    );


                document
                    .getElementById(
                        "qrPallet"
                    )
                    .classList.remove(
                        "oculto"
                    );


                alert(

                    "✅ PALLET GUARDADO\n\n" +

                    identificador +

                    "\n" +

                    piezas.length +

                    " piezas"

                );

            }


            catch(error) {

                console.error(
                    "NANO QR:",
                    error
                );


                alert(

                    "❌ NO SE PUDO GUARDAR EL PALLET\n\n" +

                    (
                        error?.message ||
                        "Error desconocido."
                    )

                );

            }

        },

        true

    );


    console.log(
        "✅ Botón Finalizar Pallet conectado a Supabase."
    );


    NANO_DB_LISTENER_INSTALADO =
        true;

}


/*
   ========================================================
   15. GENERAR QR DE RACK DESDE PANTALLA
   ========================================================
*/

async function nanoFinalizarRack() {

    const campo =
        document.getElementById(
            "rackNumero"
        );


    if (!campo) {

        return;

    }


    const identificador =
        campo.value.trim();


    const pallets =
        nanoObtenerPalletsDesdePantallaRack();


    if (!identificador) {

        alert(
            "Escribe el identificador del rack."
        );

        return;

    }


    if (
        pallets.length === 0
    ) {

        alert(
            "Agrega al menos un pallet."
        );

        return;

    }


    await nanoGuardarRack(

        identificador,

        pallets

    );


    const contenedor =
        document.getElementById(
            "codigoQRRack"
        );


    contenedor.innerHTML =
        "";


    document
        .getElementById(
            "qrRackNumero"
        )
        .textContent =
        identificador;


    const informacion =
        JSON.stringify({

            tipo:
                "RACK",

            id:
                identificador

        });


    new QRCode(

        contenedor,

        {

            text:
                informacion,

            width:
                240,

            height:
                240,

            correctLevel:
                QRCode.CorrectLevel.L

        }

    );


    document
        .querySelectorAll(
            ".app > div"
        )
        .forEach(
            function(div) {

                div.classList.add(
                    "oculto"
                );

            }
        );


    document
        .getElementById(
            "qrRack"
        )
        .classList.remove(
            "oculto"
        );


    alert(
        "✅ RACK GUARDADO EN SUPABASE"
    );

}


/*
   ========================================================
   16. SOBRESCRIBIR FINALIZAR RACK
   ========================================================
*/

function nanoConectarFinalizarRack() {

    const boton =
        document.getElementById(
            "finalizarRack"
        );


    if (!boton) {

        return;

    }


    boton.addEventListener(

        "click",

        async function(event) {

            event.preventDefault();

            event.stopImmediatePropagation();


            try {

                await nanoFinalizarRack();

            }

            catch(error) {

                console.error(
                    error
                );


                alert(

                    "❌ NO SE PUDO GUARDAR EL RACK\n\n" +

                    (
                        error?.message ||
                        "Error desconocido."
                    )

                );

            }

        },

        true

    );

}


/*
   ========================================================
   17. PRUEBA DE CONEXIÓN
   ========================================================
*/

async function nanoProbarConexion() {

    const db =
        nanoInicializarSupabase();


    if (!db) {

        return false;

    }


    try {

        const {

            error

        } = await db

            .from("pallets")

            .select(
                "id"
            )

            .limit(
                1
            );


        if (error) {

            console.error(
                "NANO QR - Supabase:",
                error
            );

            return false;

        }


        console.log(
            "✅ NANO QR: conexión con base de datos confirmada."
        );


        return true;

    }

    catch(error) {

        console.error(
            "NANO QR:",
            error
        );


        return false;

    }

}


/*
   ========================================================
   18. INICIALIZAR
   ========================================================
*/

window.addEventListener(
    "load",
    function() {

        setTimeout(
            async function() {

                nanoInicializarSupabase();

                nanoConectarFinalizarPallet();

                nanoConectarFinalizarRack();

                await nanoProbarConexion();

            },
            300
        );

    }
);


/*
   ========================================================
   19. FUNCIONES PÚBLICAS
   ========================================================
*/

window.NANO_DB = {

    guardarPallet:
        nanoGuardarPalletCompleto,

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
        nanoConsultarRack,

    probarConexion:
        nanoProbarConexion

};


console.log(
    "🚀 NANO QR DATABASE.JS cargado."
);
