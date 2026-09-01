/* =========================================================
   NANO QR - INTEGRACIÓN SUPABASE
   ========================================================= */

const NANO_SUPABASE_URL =
    "https://xmlifzybnovnmjdsaxl.supabase.co";

const NANO_SUPABASE_KEY =
    "sb_publishable_jgN5hee6h-Xsohkoe8pfug__oWSZRyK";


let NANO_CLIENT = null;


/* =========================================================
   INICIAR SUPABASE
   ========================================================= */

function nanoIniciarSupabase() {

    if (NANO_CLIENT) {
        return NANO_CLIENT;
    }

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "NANO QR: no se cargó Supabase."
        );

        return null;
    }

    if (
        !NANO_SUPABASE_KEY ||
        !NANO_SUPABASE_KEY.startsWith(
            "sb_publishable_"
        )
    ) {

        console.error(
            "NANO QR: Publishable Key inválida."
        );

        return null;
    }

    NANO_CLIENT =
        window.supabase.createClient(
            NANO_SUPABASE_URL,
            NANO_SUPABASE_KEY
        );

    console.log(
        "✅ NANO QR conectado a Supabase."
    );

    return NANO_CLIENT;
}


/* =========================================================
   GUARDAR PALLET Y PIEZAS
   ========================================================= */

async function nanoGuardarPallet() {

    const db =
        nanoIniciarSupabase();

    if (!db) {

        throw new Error(
            "No se pudo conectar con Supabase."
        );
    }


    const campo =
        document.getElementById(
            "palletNumero"
        );

    const identificador =
        campo
            ? campo.value.trim()
            : "";


    if (!identificador) {

        throw new Error(
            "Escribe el identificador del pallet."
        );
    }


    /*
       El script principal nos entrega
       las piezas mediante este puente.
    */

    const piezas =
        typeof window.NANO_GET_PIEZAS ===
        "function"
            ? window.NANO_GET_PIEZAS()
            : [];


    if (
        !Array.isArray(piezas) ||
        piezas.length === 0
    ) {

        throw new Error(
            "No se encontraron piezas para guardar."
        );
    }


    if (piezas.length > 18) {

        throw new Error(
            "Un pallet no puede tener más de 18 piezas."
        );
    }


    /* =====================================================
       VERIFICAR SI EL PALLET YA EXISTE
       ===================================================== */

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


    if (palletExistente) {

        throw new Error(
            "El pallet " +
            identificador +
            " ya existe en la base de datos."
        );
    }


    /* =====================================================
       CREAR PALLET
       ===================================================== */

    const {

        data: pallet,
        error: errorPallet

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


    if (errorPallet) {
        throw errorPallet;
    }


    /* =====================================================
       PREPARAR PIEZAS
       ===================================================== */

    const filas =
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
                        pallet.id,

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

        error: errorPiezas

    } = await db

        .from("piezas")

        .insert(
            filas
        );


    if (errorPiezas) {

        /*
           Si algo falla, borramos el pallet
           recién creado para no dejar basura.
        */

        await db

            .from("pallets")

            .delete()

            .eq(
                "id",
                pallet.id
            );


        throw errorPiezas;
    }


    console.log(
        "✅ Pallet guardado:",
        identificador
    );


    console.log(
        "✅ Piezas guardadas:",
        piezas.length
    );


    return {

        pallet:
            identificador,

        piezas:
            piezas

    };

}


/* =========================================================
   GENERAR QR DEL PALLET
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


    const etiqueta =
        document.getElementById(
            "qrPalletNumero"
        );

    if (etiqueta) {

        etiqueta.textContent =
            identificador;

    }


    /*
       El QR contiene únicamente
       el identificador.
    */

    const contenido =
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
                contenido,

            width:
                240,

            height:
                240,

            correctLevel:
                QRCode.CorrectLevel.M

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
            "qrPallet"
        )
        .classList.remove(
            "oculto"
        );

}


/* =========================================================
   INTERCEPTAR FINALIZAR PALLET
   ========================================================= */

function nanoConectarFinalizarPallet() {

    const boton =
        document.getElementById(
            "finalizarPallet"
        );


    if (!boton) {

        console.error(
            "No se encontró finalizarPallet."
        );

        return;
    }


    /*
       Capture = true

       Se ejecuta antes del evento
       original de script.js.
    */

    boton.addEventListener(

        "click",

        async function(event) {

            event.preventDefault();

            event.stopImmediatePropagation();


            try {

                const resultado =
                    await nanoGuardarPallet();


                nanoGenerarQRPallet(
                    resultado.pallet
                );


                /*
                   El contador de pallets
                   se incrementa visualmente.
                */

                alert(

                    "✅ PALLET GUARDADO\n\n" +

                    resultado.pallet +

                    "\n" +

                    resultado.piezas.length +

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
                        error &&
                        error.message
                            ? error.message
                            : "Error desconocido."
                    )

                );

            }

        },

        true

    );


    console.log(
        "✅ Finalizar Pallet conectado con Supabase."
    );

}


/* =========================================================
   INICIO
   ========================================================= */

window.addEventListener(

    "load",

    function() {

        setTimeout(

            function() {

                nanoIniciarSupabase();

                nanoConectarFinalizarPallet();

            },

            300

        );

    }

);
