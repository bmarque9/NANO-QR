/* =========================================================
   NANO QR - CONEXIÓN SUPABASE
   Guarda PALLETS y PIEZAS desde la aplicación
   ========================================================= */

const NANO_SUPABASE_URL =
    "https://xmlifzybnovnmjdsaxl.supabase.co";

/*
   PEGA AQUÍ TU PUBLISHABLE KEY DE SUPABASE.

   Debe comenzar por:
   sb_publishable_

   NO uses una secret key.
*/
const NANO_SUPABASE_KEY =
    "PEGA_AQUI_TU_SB_PUBLISHABLE_KEY";


/* =========================================================
   CREAR CLIENTE SUPABASE
   ========================================================= */

let nanoClient = null;


function iniciarSupabase() {

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {

        console.error(
            "La librería de Supabase no está disponible."
        );

        return false;
    }


  if (!NANO_SUPABASE_KEY ||
    NANO_SUPABASE_KEY ===
    "PEGA_AQUI_TU_SB_PUBLISHABLE_KEY") {

  console.error(
            "Falta la Publishable Key."
        );

        return false;
    }


    nanoClient =
        window.supabase.createClient(
            NANO_SUPABASE_URL,
            NANO_SUPABASE_KEY
        );


    console.log(
        "✅ NANO QR conectado con Supabase"
    );


    return true;
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarSupabase
    );

}
else {

    iniciarSupabase();

}


/* =========================================================
   GENERAR QR DE PALLET
   ========================================================= */

function nanoGenerarQRPallet(
    identificador
) {

    const contenedor =
        document.getElementById(
            "codigoQR"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    document
        .getElementById(
            "qrPalletNumero"
        )
        .textContent =
        identificador;


    const informacionQR = JSON.stringify({

        tipo:
            "PALLET",

        id:
            identificador

    });


    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.error(
            "No está disponible QRCode."
        );

        return;

    }


    new QRCode(

        contenedor,

        {

            text:
                informacionQR,

            width:
                240,

            height:
                240,

            correctLevel:
                QRCode.CorrectLevel.M

        }

    );


    const pantalla =
        document.getElementById(
            "qrPallet"
        );


    if (pantalla) {

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


        pantalla.classList.remove(
            "oculto"
        );

    }

}


/* =========================================================
   GUARDAR PALLET + PIEZAS
   ========================================================= */

async function nanoGuardarPalletCompleto(

    identificador,
    piezas

) {

    if (!nanoClient) {

        if (!iniciarSupabase()) {

            throw new Error(
                "No se pudo conectar con Supabase."
            );

        }

    }


    if (!identificador) {

        throw new Error(
            "El pallet no tiene identificador."
        );

    }


    if (
        !Array.isArray(piezas) ||
        piezas.length === 0
    ) {

        throw new Error(
            "El pallet no tiene piezas."
        );

    }


    if (piezas.length > 18) {

        throw new Error(
            "Un pallet no puede tener más de 18 piezas."
        );

    }


    /* =====================================================
       VERIFICAR PALLET EXISTENTE
       ===================================================== */

    const {

        data: palletExistente,

        error: errorBusqueda

    } = await nanoClient

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


    if (palletExistente) {

        throw new Error(
            "El pallet " +
            identificador +
            " ya existe en Supabase."
        );

    }


    /* =====================================================
       VERIFICAR PIEZAS DUPLICADAS EN SUPABASE
       ===================================================== */

    const series =
        piezas
            .map(
                function(pieza) {

                    return pieza.serie;

                }
            )
            .filter(Boolean);


    if (series.length !== piezas.length) {

        throw new Error(
            "Hay una pieza sin número de serie."
        );

    }


    const {

        data: piezasExistentes,

        error: errorSeries

    } = await nanoClient

        .from("piezas")

        .select(
            "numero_serie"
        )

        .in(
            "numero_serie",
            series
        );


    if (errorSeries) {

        throw errorSeries;

    }


    if (
        piezasExistentes &&
        piezasExistentes.length > 0
    ) {

        throw new Error(

            "Estas piezas ya están registradas:\n\n" +

            piezasExistentes
                .map(
                    function(p) {
                        return p.numero_serie;
                    }
                )
                .join("\n")

        );

    }


    /* =====================================================
       CREAR PALLET
       ===================================================== */

    const {

        data: nuevoPallet,

        error: errorPallet

    } = await nanoClient

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


    if (errorPallet) {

        throw errorPallet;

    }


    /* =====================================================
       PREPARAR PIEZAS
       ===================================================== */

    const filasPiezas =
        piezas.map(
            function(pieza) {

                return {

                    numero_serie:
                        pieza.serie,

                    modelo:
                        pieza.modelo || "",

                    codigo_modelo:
                        pieza.codigo || "",

                    pallet_id:
                        nuevoPallet.id,

                    estado:
                        "EN PALLET",

                    nota:
                        pieza.nota || "",

                    motivo_segregacion:
                        ""

                };

            }
        );


    /* =====================================================
       GUARDAR PIEZAS
       ===================================================== */

    const {

        error: errorInsertPiezas

    } = await nanoClient

        .from("piezas")

        .insert(
            filasPiezas
        );


    if (errorInsertPiezas) {

        /*
           Si las piezas fallan, eliminamos
           el pallet que acabamos de crear.
        */

        await nanoClient
            .from("pallets")
            .delete()
            .eq(
                "id",
                nuevoPallet.id
            );


        throw errorInsertPiezas;

    }


    console.log(
        "✅ Pallet guardado:",
        identificador
    );


    console.log(
        "✅ Piezas guardadas:",
        piezas.length
    );


    return nuevoPallet;

}


/* =========================================================
   INTERCEPTAR FINALIZAR PALLET
   ========================================================= */

function conectarBotonFinalizar() {

    const boton =
        document.getElementById(
            "finalizarPallet"
        );


    if (!boton) {

        console.error(
            "No se encontró el botón finalizarPallet."
        );

        return;

    }


    /*
       CAPTURE = TRUE

       Esto hace que nuestro evento se ejecute
       antes que el evento original de script.js.
    */

    boton.addEventListener(

        "click",

        async function(event) {

            /*
               Detenemos el comportamiento anterior
               para que no genere el QR viejo.
            */

            event.preventDefault();

            event.stopImmediatePropagation();


            try {

                const identificador =
                    document
                        .getElementById(
                            "palletNumero"
                        )
                        .value
                        .trim();


                const piezas =
                    Array.isArray(
                        window.palletActual
                    )
                        ? window.palletActual
                        : obtenerPiezasDeAplicacion();


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
                   Guardamos TODO en Supabase
                */

                await nanoGuardarPalletCompleto(

                    identificador,

                    piezas

                );


                /*
                   Generamos QR nuevo.
                   El QR solamente guarda
                   el identificador del pallet.
                */

                nanoGenerarQRPallet(
                    identificador
                );


                alert(
                    "✅ PALLET GUARDADO EN SUPABASE\n\n" +
                    identificador +
                    "\n" +
                    piezas.length +
                    " piezas"
                );


            }

            catch(error) {

                console.error(
                    "Error guardando pallet:",
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
        "✅ Finalizar Pallet conectado a Supabase."
    );

}


/* =========================================================
   OBTENER PIEZAS DE LA APLICACIÓN
   ========================================================= */

function obtenerPiezasDeAplicacion() {

    if (
        typeof window.NANO_GET_PIEZAS ===
        "function"
    ) {

        return window.NANO_GET_PIEZAS();

    }

    return [];
}




/* =========================================================
   CONSULTAR PIEZA
   ========================================================= */

window.consultarPiezaSupabase =
async function(
    numeroSerie
) {

    if (!nanoClient) {

        if (!iniciarSupabase()) {

            throw new Error(
                "Supabase no está disponible."
            );

        }

    }


    const {

        data,

        error

    } = await nanoClient

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

};


/* =========================================================
   CONSULTAR PALLET
   ========================================================= */

window.consultarPalletSupabase =
async function(
    identificador
) {

    if (!nanoClient) {

        if (!iniciarSupabase()) {

            throw new Error(
                "Supabase no está disponible."
            );

        }

    }


    const {

        data: pallet,

        error: errorPallet

    } = await nanoClient

        .from("pallets")

        .select(
            "*"
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

    } = await nanoClient

        .from("piezas")

        .select(
            "*"
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
                ascending: true
            }
        );


    if (errorPiezas) {

        throw errorPiezas;

    }


    return {

        pallet:
            pallet,

        piezas:
            piezas || []

    };

};


/* =========================================================
   INICIALIZAR
   ========================================================= */

function iniciarNanoBaseDatos() {

    if (
        !nanoClient
    ) {

        iniciarSupabase();

    }


    conectarBotonFinalizar();

}


/*
   Como database.js se carga al final
   del HTML, podemos esperar un instante
   para asegurar que script.js también
   haya terminado de cargar.
*/

window.addEventListener(
    "load",
    function() {

        setTimeout(
            iniciarNanoBaseDatos,
            100
        );

    }
);
