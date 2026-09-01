/* =========================================================
   NANO QR - BASE DE DATOS SUPABASE
   ========================================================= */

const NANO_SUPABASE_URL =
    "https://xmlifzybnovnmjdsaxl.supabase.co";

/*
   IMPORTANTE:
   Conserva aquí TU publishable key actual de Supabase.

   Debe comenzar con:
   sb_publishable_

   NO uses una secret key.
*/
const NANO_SUPABASE_KEY =
    "sb_publishable_jgN5hee6h-Xsohkoe8pfug__oWSZRyK";


/* =========================================================
   CARGAR SUPABASE AUTOMÁTICAMENTE
   ========================================================= */

let nanoSupabaseReady = null;


function cargarSupabase() {

    if (
        window.supabase &&
        window.supabase.createClient
    ) {

        return Promise.resolve();

    }


    return new Promise(function(resolve, reject) {

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = function() {

            if (
                window.supabase &&
                window.supabase.createClient
            ) {

                resolve();

            }

            else {

                reject(
                    new Error(
                        "Supabase no pudo cargarse."
                    )
                );

            }

        };


        script.onerror = function() {

            reject(
                new Error(
                    "No se pudo cargar Supabase."
                )
            );

        };


        document.head.appendChild(script);

    });

}


nanoSupabaseReady =
    cargarSupabase()
    .then(function() {

        if (
            !NANO_SUPABASE_KEY ||
            NANO_SUPABASE_KEY ===
            "PEGA_AQUI_TU_SB_PUBLISHABLE_KEY"
        ) {

            throw new Error(
                "Falta colocar la Publishable Key de Supabase."
            );

        }


        window.nanoDB =
            window.supabase.createClient(
                NANO_SUPABASE_URL,
                NANO_SUPABASE_KEY
            );


        console.log(
            "NANO QR: Supabase conectado."
        );

    });


/* =========================================================
   UTILIDAD
   ========================================================= */

async function nanoDB() {

    await nanoSupabaseReady;

    return window.nanoDB;

}


window.nanoSupabaseReady =
    nanoSupabaseReady;


/* =========================================================
   CONSULTAR PALLET
   ========================================================= */

async function nanoObtenerPallet(
    identificador
) {

    const db = await nanoDB();


    const { data: pallet, error: errorPallet } =

        await db
            .from("pallets")
            .select(
                "id, identificador, nota, estado"
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

        throw new Error(
            "El pallet " +
            identificador +
            " no existe en la base de datos."
        );

    }


    const { data: piezas, error: errorPiezas } =

        await db
            .from("piezas")
            .select(
                "numero_serie, modelo, codigo_modelo, nota, estado"
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


/* =========================================================
   GUARDAR / ACTUALIZAR PALLET
   ========================================================= */

async function nanoSincronizarPallet(
    identificador,
    piezas
) {

    const db = await nanoDB();


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


    /* Buscar pallet */

    const { data: palletExistente, error: errorBusqueda } =

        await db
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


    let pallet = palletExistente;


    /* Crear si no existe */

    if (!pallet) {

        const { data, error } =

            await db
                .from("pallets")
                .insert({

                    identificador:
                        identificador,

                    estado:
                        "ACTIVO",

                    nota:
                        ""

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


    const seriesActuales =
        piezas
            .map(
                function(p) {
                    return p.serie;
                }
            )
            .filter(Boolean);


    /* Obtener piezas que estaban en este pallet */

    const { data: piezasAnteriores, error: errorAnteriores } =

        await db
            .from("piezas")
            .select(
                "id, numero_serie"
            )
            .eq(
                "pallet_id",
                pallet.id
            );


    if (errorAnteriores) {

        throw errorAnteriores;

    }


    /* Las que ya no están quedan sin pallet */

    const removidas =
        (piezasAnteriores || [])
            .filter(
                function(p) {

                    return !seriesActuales.includes(
                        p.numero_serie
                    );

                }
            );


    if (removidas.length > 0) {

        const idsRemovidos =
            removidas.map(
                function(p) {
                    return p.id;
                }
            );


        const { error } =

            await db
                .from("piezas")
                .update({

                    pallet_id:
                        null,

                    estado:
                        "LIBERADA"

                })
                .in(
                    "id",
                    idsRemovidos
                );


        if (error) {

            throw error;

        }

    }


    /* Guardar cada pieza */

    for (
        const pieza of piezas
    ) {

        if (!pieza.serie) {

            continue;

        }


        const { data: piezaExistente, error: errorPieza } =

            await db
                .from("piezas")
                .select(
                    "id"
                )
                .eq(
                    "numero_serie",
                    pieza.serie
                )
                .maybeSingle();


        if (errorPieza) {

            throw errorPieza;

        }


        if (piezaExistente) {

            const { error } =

                await db
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

        else {

            const { error } =

                await db
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


    /* Actualizar estado */

    const { error: errorEstado } =

        await db
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
   SEGREGAR PIEZA
   ========================================================= */

async function nanoSegregarPieza(
    numeroSerie,
    motivo
) {

    const db = await nanoDB();


    const { error } =

        await db
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
   MODIFICAR NOTA
   ========================================================= */

async function nanoModificarNota(
    numeroSerie,
    nota
) {

    const db = await nanoDB();


    const { error } =

        await db
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
   CONSULTAR PIEZA EN BASE
   ========================================================= */

async function nanoBuscarPieza(
    numeroSerie
) {

    const db = await nanoDB();


    const { data, error } =

        await db
            .from("piezas")
            .select(
                "numero_serie, modelo, codigo_modelo, estado, nota, motivo_segregacion"
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


/* =========================================================
   GUARDAR / ACTUALIZAR RACK
   ========================================================= */

async function nanoSincronizarRack(
    identificador,
    pallets
) {

    const db = await nanoDB();


    /* Buscar rack */

    const { data: rackExistente, error: errorBusqueda } =

        await db
            .from("racks")
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


    let rack = rackExistente;


    /* Crear rack si no existe */

    if (!rack) {

        const { data, error } =

            await db
                .from("racks")
                .insert({

                    identificador:
                        identificador,

                    nota:
                        ""

                })
                .select(
                    "id, identificador"
                )
                .single();


        if (error) {

            throw error;

        }


        rack = data;

    }


    const idsActuales = [];


    for (
        const pallet of pallets
    ) {

        const { data: dbPallet, error } =

            await db
                .from("pallets")
                .select(
                    "id, identificador"
                )
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
                "El pallet " +
                pallet.pallet +
                " no existe en Supabase."
            );

        }


        idsActuales.push(
            dbPallet.id
        );


        const { error: errorRack } =

            await db
                .from("pallets")
                .update({

                    rack_id:
                        rack.id

                })
                .eq(
                    "id",
                    dbPallet.id
                );


        if (errorRack) {

            throw errorRack;

        }

    }


    /* Retirar del rack los pallets que ya no están */

    const { data: anteriores, error: errorAnteriores } =

        await db
            .from("pallets")
            .select(
                "id"
            )
            .eq(
                "rack_id",
                rack.id
            );


    if (errorAnteriores) {

        throw errorAnteriores;

    }


    const retirar =
        (anteriores || [])
            .filter(
                function(p) {

                    return !idsActuales.includes(
                        p.id
                    );

                }
            )
            .map(
                function(p) {
                    return p.id;
                }
            );


    if (retirar.length > 0) {

        const { error } =

            await db
                .from("pallets")
                .update({

                    rack_id:
                        null

                })
                .in(
                    "id",
                    retirar
                );


        if (error) {

            throw error;

        }

    }


    return rack;

}


/* =========================================================
   CONSULTAR RACK
   ========================================================= */

async function nanoObtenerRack(
    identificador
) {

    const db = await nanoDB();


    const { data: rack, error: errorRack } =

        await db
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


    if (!rack) {

        throw new Error(
            "El rack " +
            identificador +
            " no existe."
        );

    }


    const { data: pallets, error: errorPallets } =

        await db
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
                    ascending: true
                }
            );


    if (errorPallets) {

        throw errorPallets;

    }


    const resultado = [];


    for (
        const pallet of pallets || []
    ) {

        const datos =
            await nanoObtenerPallet(
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
   GENERAR QR PALLET
   ========================================================= */

window.generarQRPallet = async function(
    id,
    piezas
) {

    try {

        await nanoSincronizarPallet(
            id,
            piezas
        );


        const contenedor =
            document.getElementById(
                "codigoQR"
            );


        contenedor.innerHTML = "";


        document
            .getElementById(
                "qrPalletNumero"
            )
            .textContent = id;


        /*
           El QR ahora contiene solamente
           el identificador del pallet.
        */

        const codigoQR =
            JSON.stringify({

                tipo:
                    "PALLET",

                id:
                    id

            });


        new QRCode(

            contenedor,

            {

                text:
                    codigoQR,

                width:
                    240,

                height:
                    240,

                correctLevel:
                    QRCode.CorrectLevel.M

            }

        );


        mostrar(
            document.getElementById(
                "qrPallet"
            )
        );


    }

    catch (error) {

        console.error(error);


        alert(
            "No se pudo guardar el pallet.\n\n" +
            error.message
        );

    }

};


/* =========================================================
   CONSULTAR PALLET
   ========================================================= */

window.iniciarScannerPallet = function() {

    if (
        window.nanoScannerPalletActivo
    ) {

        return;

    }


    const lector =
        new Html5Qrcode(
            "readerPallet"
        );


    window.nanoScannerPalletActivo =
        true;


    lector.start(

        {
            facingMode:
                "environment"
        },

        {

            fps:
                10,

            qrbox:
                {
                    width:
                        250,

                    height:
                        250
                }

        },

        async function(codigo) {


            try {

                let identificador =
                    null;


                try {

                    const datos =
                        JSON.parse(
                            codigo
                        );


                    if (
                        datos.tipo ===
                        "PALLET"
                    ) {

                        identificador =
                            datos.id;

                    }

                    else if (
                        datos.pallet
                    ) {

                        identificador =
                            datos.pallet;

                    }

                }

                catch {

                    identificador =
                        codigo.trim();

                }


                if (!identificador) {

                    throw new Error(
                        "QR de pallet inválido."
                    );

                }


                const datos =
                    await nanoObtenerPallet(
                        identificador
                    );


                palletActual =
                    datos.piezas;


                document
                    .getElementById(
                        "consultaNumero"
                    )
                    .textContent =
                    datos.pallet;


                actualizarConsulta();


                await lector
                    .stop()
                    .catch(
                        () => {}
                    );


                window.nanoScannerPalletActivo =
                    false;

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    "No se pudo consultar el pallet.\n\n" +
                    error.message
                );

            }

        },

        function(){}

    )


    .catch(function(error) {

        window.nanoScannerPalletActivo =
            false;


        console.error(
            error
        );


        alert(
            "No se pudo abrir la cámara."
        );

    });

};


/* =========================================================
   GENERAR QR RACK
   ========================================================= */

window.generarQRRack = async function(
    id,
    pallets
) {

    try {

        await nanoSincronizarRack(
            id,
            pallets
        );


        const contenedor =
            document.getElementById(
                "codigoQRRack"
            );


        contenedor.innerHTML = "";


        document
            .getElementById(
                "qrRackNumero"
            )
            .textContent =
            id;


        const codigoQR =
            JSON.stringify({

                tipo:
                    "RACK",

                id:
                    id

            });


        new QRCode(

            contenedor,

            {

                text:
                    codigoQR,

                width:
                    240,

                height:
                    240,

                correctLevel:
                    QRCode.CorrectLevel.L

            }

        );


        mostrar(
            document.getElementById(
                "qrRack"
            )
        );

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "No se pudo guardar el rack.\n\n" +
            error.message
        );

    }

};


/* =========================================================
   CONSULTAR RACK
   ========================================================= */

window.iniciarScannerRack = function() {

    if (
        window.nanoScannerRackActivo
    ) {

        return;

    }


    const lector =
        new Html5Qrcode(
            "readerRack"
        );


    window.nanoScannerRackActivo =
        true;


    lector.start(

        {
            facingMode:
                "environment"
        },

        {

            fps:
                10,

            qrbox:
                {
                    width:
                        250,

                    height:
                        250
                }

        },

        async function(codigo) {


            try {

                let identificador =
                    null;


                try {

                    const datos =
                        JSON.parse(
                            codigo
                        );


                    if (
                        datos.tipo ===
                        "RACK"
                    ) {

                        identificador =
                            datos.id;

                    }

                    else if (
                        datos.rack
                    ) {

                        identificador =
                            datos.rack;

                    }

                }

                catch {

                    identificador =
                        codigo.trim();

                }


                if (!identificador) {

                    throw new Error(
                        "QR de rack inválido."
                    );

                }


                const datos =
                    await nanoObtenerRack(
                        identificador
                    );


                rackActual =
                    datos.pallets;


                document
                    .getElementById(
                        "consultaRackNumero"
                    )
                    .textContent =
                    datos.rack;


                mostrarInformacionRack();


                await lector
                    .stop()
                    .catch(
                        () => {}
                    );


                window.nanoScannerRackActivo =
                    false;

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    "No se pudo consultar el rack.\n\n" +
                    error.message
                );

            }

        },

        function(){}

    )


    .catch(function(error) {

        window.nanoScannerRackActivo =
            false;


        console.error(
            error
        );


        alert(
            "No se pudo abrir la cámara."
        );

    });

};


/* =========================================================
   CONSULTAR PALLET PARA METERLO EN RACK
   ========================================================= */

window.iniciarScannerPalletRack =
function() {

    if (
        window.nanoScannerPalletRackActivo
    ) {

        return;

    }


    const lector =
        new Html5Qrcode(
            "readerPalletRack"
        );


    window.nanoScannerPalletRackActivo =
        true;


    lector.start(

        {
            facingMode:
                "environment"
        },

        {

            fps:
                10,

            qrbox:
                {
                    width:
                        250,

                    height:
                        250
                }

        },

        async function(codigo) {


            try {

                let identificador =
                    null;


                try {

                    const datos =
                        JSON.parse(
                            codigo
                        );


                    if (
                        datos.tipo ===
                        "PALLET"
                    ) {

                        identificador =
                            datos.id;

                    }

                    else if (
                        datos.pallet
                    ) {

                        identificador =
                            datos.pallet;

                    }

                }

                catch {

                    identificador =
                        codigo.trim();

                }


                const datos =
                    await nanoObtenerPallet(
                        identificador
                    );


                document
                    .getElementById(
                        "rackPalletNumero"
                    )
                    .textContent =
                    datos.pallet;


                const total =
                    datos.piezas.length;


                const modelo27 =
                    datos.piezas.filter(
                        function(p) {
                            return p.modelo === "2.7";
                        }
                    ).length;


                const modelo30 =
                    datos.piezas.filter(
                        function(p) {
                            return p.modelo === "3.0";
                        }
                    ).length;


                document
                    .getElementById(
                        "rackPalletResumen"
                    )
                    .innerHTML = `

                        <p>
                            <strong>
                                ${total} piezas
                            </strong>
                        </p>

                        <p>
                            2.7: ${modelo27}
                        </p>

                        <p>
                            3.0: ${modelo30}
                        </p>

                    `;


                window.palletTemporalRack =
                    datos;


                document
                    .getElementById(
                        "palletDetectadoRack"
                    )
                    .classList.remove(
                        "oculto"
                    );


                await lector
                    .stop()
                    .catch(
                        () => {}
                    );


                window.nanoScannerPalletRackActivo =
                    false;

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    "No se pudo consultar el pallet.\n\n" +
                    error.message
                );

            }

        },

        function(){}

    )


    .catch(function(error) {

        window.nanoScannerPalletRackActivo =
            false;


        console.error(
            error
        );


        alert(
            "No se pudo abrir la cámara."
        );

    });

};


/* =========================================================
   PUENTE PARA GUARDAR NOTAS Y SEGREGACIONES
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {


        if (
            event.target &&
            event.target.id ===
            "guardarNota"
        ) {

            setTimeout(
                async function() {

                    try {

                        const numeroSerie =
                            document
                                .getElementById(
                                    "serieEditar"
                                )
                                .textContent
                                .trim();


                        const nota =
                            document
                                .getElementById(
                                    "nuevaNota"
                                )
                                .value
                                .trim();


                        await nanoModificarNota(
                            numeroSerie,
                            nota
                        );


                        console.log(
                            "Nota guardada en Supabase."
                        );

                    }

                    catch(error) {

                        console.error(
                            error
                        );


                        alert(
                            "La nota no pudo guardarse en la base de datos.\n\n" +
                            error.message
                        );

                    }

                },
                100
            );

        }


        if (
            event.target &&
            event.target.id ===
            "confirmarSegregacion"
        ) {

            setTimeout(
                async function() {

                    try {

                        const numeroSerie =
                            document
                                .getElementById(
                                    "serieSegregar"
                                )
                                .textContent
                                .trim();


                        const motivo =
                            document
                                .getElementById(
                                    "motivoSegregacion"
                                )
                                .value
                                .trim();


                        await nanoSegregarPieza(
                            numeroSerie,
                            motivo
                        );


                        console.log(
                            "Segregación guardada en Supabase."
                        );

                    }

                    catch(error) {

                        console.error(
                            error
                        );


                        alert(
                            "La segregación no pudo guardarse en la base de datos.\n\n" +
                            error.message
                        );

                    }

                },
                100
            );

        }

    }
);


/* =========================================================
   MENSAJE DE ARRANQUE
   ========================================================= */

nanoSupabaseReady

    .then(function() {

        console.log(
            "✅ NANO QR conectado a Supabase"
        );

    })

    .catch(function(error) {

        console.error(
            "❌ Supabase:",
            error
        );

    });
