/* =========================================
   NANO QR - CONEXIÓN CON SUPABASE
   ========================================= */

const SUPABASE_URL =
    "https://xmlifzybnovnmjdsaxl.supabase.co";

/*
   PEGA AQUÍ TU PUBLISHABLE KEY.

   Debe comenzar con:
   sb_publishable_

   NO pongas una secret key.
*/
const SUPABASE_KEY =
    "sb_publishable_jgN5hee6h-Xsohkoe8pfug__oWSZRyK";


/* =========================================
   CREAR CLIENTE SUPABASE
   ========================================= */

if (
    !window.supabase ||
    !window.supabase.createClient
) {

    console.error(
        "No se cargó la librería de Supabase."
    );

}
else {

    window.nanoDB =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

}


/* =========================================
   PRUEBA DE CONEXIÓN
   ========================================= */

window.probarConexionSupabase =
    async function () {

        try {

            const { data, error } =
                await window.nanoDB
                    .from("pallets")
                    .select("id")
                    .limit(1);

            if (error) {

                console.error(
                    "Error Supabase:",
                    error
                );

                return false;

            }

            console.log(
                "NANO QR conectado correctamente a Supabase."
            );

            return true;

        }
        catch (error) {

            console.error(
                "Error de conexión:",
                error
            );

            return false;

        }

    };


/* =========================================
   GUARDAR PIEZA
   ========================================= */

window.guardarPiezaSupabase =
    async function (pieza) {

        if (!window.nanoDB) {

            throw new Error(
                "Supabase no está conectado."
            );

        }


        const { data, error } =
            await window.nanoDB
                .from("piezas")
                .insert({

                    numero_serie:
                        pieza.serie,

                    modelo:
                        pieza.modelo || "",

                    codigo_modelo:
                        pieza.codigo || "",

                    estado:
                        pieza.estado || "EN PALLET",

                    nota:
                        pieza.nota || "",

                    motivo_segregacion:
                        pieza.motivo_segregacion || ""

                })
                .select()
                .single();


        if (error) {

            throw error;

        }


        return data;

    };


/* =========================================
   BUSCAR PIEZA
   ========================================= */

window.buscarPiezaSupabase =
    async function (numeroSerie) {

        if (!window.nanoDB) {

            throw new Error(
                "Supabase no está conectado."
            );

        }


        const { data, error } =
            await window.nanoDB
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

    };


/* =========================================
   CREAR PALLET
   ========================================= */

window.crearPalletSupabase =
    async function (
        identificador,
        nota = ""
    ) {

        const { data, error } =
            await window.nanoDB
                .from("pallets")
                .insert({

                    identificador:
                        identificador,

                    nota:
                        nota,

                    estado:
                        "ACTIVO"

                })
                .select()
                .single();


        if (error) {

            throw error;

        }


        return data;

    };


/* =========================================
   BUSCAR PALLET
   ========================================= */

window.buscarPalletSupabase =
    async function (identificador) {

        const { data, error } =
            await window.nanoDB
                .from("pallets")
                .select("*")
                .eq(
                    "identificador",
                    identificador
                )
                .maybeSingle();


        if (error) {

            throw error;

        }


        return data;

    };


/* =========================================
   CREAR RACK
   ========================================= */

window.crearRackSupabase =
    async function (identificador) {

        const { data, error } =
            await window.nanoDB
                .from("racks")
                .insert({

                    identificador:
                        identificador

                })
                .select()
                .single();


        if (error) {

            throw error;

        }


        return data;

    };


/* =========================================
   BUSCAR RACK
   ========================================= */

window.buscarRackSupabase =
    async function (identificador) {

        const { data, error } =
            await window.nanoDB
                .from("racks")
                .select("*")
                .eq(
                    "identificador",
                    identificador
                )
                .maybeSingle();


        if (error) {

            throw error;

        }


        return data;

    };
