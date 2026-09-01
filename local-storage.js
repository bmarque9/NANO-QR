/* =========================================================
   NANO QR
   HISTORIAL LOCAL
   VERSIÓN CORREGIDA
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURACIÓN
       ===================================================== */

    const STORAGE_KEY = "NANO_QR_PALLETS";


    /* =====================================================
       LEER PALLETS
       ===================================================== */

    function leerPallets() {

        try {

            const datos =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!datos) {

                return [];

            }


            const pallets =
                JSON.parse(datos);


            if (
                !Array.isArray(pallets)
            ) {

                return [];

            }


            return pallets;

        }

        catch (error) {

            console.error(
                "NANO QR - Error leyendo historial:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       GUARDAR PALLET
       ===================================================== */

    function guardarPallet(
        id,
        piezas
    ) {

        if (!id) {

            console.warn(
                "NANO QR - No hay ID de pallet."
            );

            return false;

        }


        if (
            !Array.isArray(piezas) ||
            piezas.length === 0
        ) {

            console.warn(
                "NANO QR - El pallet no tiene piezas."
            );

            return false;

        }


        try {

            const pallets =
                leerPallets();


            const registro = {

                id: String(id),

                fecha:
                    new Date()
                        .toLocaleString(
                            "es-MX"
                        ),

                piezas:
                    JSON.parse(
                        JSON.stringify(
                            piezas
                        )
                    )

            };


            /*
             * Si el pallet ya existe,
             * lo actualizamos.
             */

            const posicion =
                pallets.findIndex(
                    function (pallet) {

                        return (
                            pallet.id ===
                            registro.id
                        );

                    }
                );


            if (
                posicion >= 0
            ) {

                pallets[posicion] =
                    registro;

            }

            else {

                pallets.unshift(
                    registro
                );

            }


            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(
                    pallets
                )

            );


            /*
             * Verificación real
             */

            const prueba =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!prueba) {

                throw new Error(
                    "localStorage no confirmó el guardado."
                );

            }


            console.log(
                "✅ NANO QR - Pallet guardado:",
                registro.id
            );


            return true;

        }

        catch (error) {

            console.error(
                "❌ NANO QR - Error guardando pallet:",
                error
            );


            return false;

        }

    }


    /* =====================================================
       OBTENER PALLET ACTUAL DE LA PANTALLA
       ===================================================== */

    function obtenerPalletActual() {

        const campo =
            document.getElementById(
                "palletNumero"
            );


        if (!campo) {

            return null;

        }


        const id =
            campo.value.trim();


        if (!id) {

            return null;

        }


        const contenedor =
            document.getElementById(
                "listaPiezas"
            );


        if (!contenedor) {

            return null;

        }


        const elementos =
            contenedor.children;


        const piezas = [];


        for (
            let i = 0;
            i < elementos.length;
            i++
        ) {

            const elemento =
                elementos[i];


            const textos =
                elemento
                    .querySelectorAll(
                        "span"
                    );


            let serie = "";
            let modelo = "";
            let codigo = "";
            let nota = "";


            const strong =
                elemento.querySelector(
                    "strong"
                );


            if (strong) {

                serie =
                    strong.textContent
                        .trim();

            }


            textos.forEach(
                function (span) {

                    const texto =
                        span.textContent
                            .trim();


                    if (
                        texto.startsWith(
                            "Modelo:"
                        )
                    ) {

                        modelo =
                            texto
                                .replace(
                                    "Modelo:",
                                    ""
                                )
                                .trim();

                    }


                    else if (
                        texto.startsWith(
                            "Código:"
                        )
                    ) {

                        codigo =
                            texto
                                .replace(
                                    "Código:",
                                    ""
                                )
                                .trim();

                    }


                    else if (
                        texto &&
                        texto !==
                        "Sin nota"
                    ) {

                        nota =
                            texto;

                    }

                }
            );


            /*
             * Si el elemento tiene texto
             * pero no encontró strong,
             * intentamos obtenerlo.
             */

            if (!serie) {

                const texto =
                    elemento.textContent
                        .trim();


                const lineas =
                    texto
                        .split("\n")
                        .map(
                            function (x) {

                                return x.trim();

                            }
                        )
                        .filter(Boolean);


                if (
                    lineas.length > 0
                ) {

                    serie =
                        lineas[0];

                }

            }


            if (serie) {

                piezas.push({

                    serie:
                        serie,

                    modelo:
                        modelo,

                    codigo:
                        codigo,

                    nota:
                        nota ||
                        "Sin nota"

                });

            }

        }


        return {

            id:
                id,

            piezas:
                piezas

        };

    }


    /* =====================================================
       GUARDAR DESPUÉS DE FINALIZAR
       ===================================================== */

    function conectarFinalizar() {

        const boton =
            document.getElementById(
                "finalizarPallet"
            );


        if (!boton) {

            console.warn(
                "NANO QR - No se encontró finalizarPallet."
            );

            return;

        }


        /*
         * Evitar conectar dos veces.
         */

        if (
            boton.dataset.nanoGuardado ===
            "true"
        ) {

            return;

        }


        boton.dataset.nanoGuardado =
            "true";


        boton.addEventListener(

            "click",

            function () {

                /*
                 * Dejamos que primero termine
                 * el proceso original del botón.
                 */

                setTimeout(

                    function () {

                        const pallet =
                            obtenerPalletActual();


                        if (!pallet) {

                            console.warn(
                                "NANO QR - No se pudo obtener el pallet."
                            );

                            return;

                        }


                        if (
                            pallet.piezas.length ===
                            0
                        ) {

                            console.warn(
                                "NANO QR - No hay piezas para guardar."
                            );

                            return;

                        }


                        guardarPallet(

                            pallet.id,

                            pallet.piezas

                        );

                    },

                    700

                );

            }

        );

    }


    /* =====================================================
       CREAR BOTÓN HISTORIAL
       ===================================================== */

    function crearBotonHistorial() {

        const menu =
            document.getElementById(
                "menu"
            );


        if (!menu) {

            return;

        }


        /*
         * MUY IMPORTANTE:
         * Buscar si ya existe un botón
         * de historial.
         */

        const botones =
            menu.querySelectorAll(
                "button"
            );


        for (
            let i = 0;
            i < botones.length;
            i++
        ) {

            const texto =
                (
                    botones[i]
                        .textContent ||
                    ""
                )
                .toUpperCase();


            if (
                texto.includes(
                    "HISTORIAL LOCAL"
                )
            ) {

                /*
                 * Ya existe.
                 * No crear otro.
                 */

                botones[i].onclick =
                    function () {

                        mostrarHistorial();

                    };


                return;

            }

        }


        /*
         * Si no existe,
         * crear uno.
         */

        const boton =
            document.createElement(
                "button"
            );


        boton.id =
            "historialLocal";


        boton.textContent =
            "📚 HISTORIAL LOCAL";


        boton.onclick =
            function () {

                mostrarHistorial();

            };


        menu.appendChild(
            boton
        );

    }


    /* =====================================================
       CREAR PANTALLA HISTORIAL
       ===================================================== */

    function crearPantallaHistorial() {

        let pantalla =
            document.getElementById(
                "pantallaHistorial"
            );


        if (pantalla) {

            return pantalla;

        }


        const app =
            document.querySelector(
                ".app"
            );


        if (!app) {

            return null;

        }


        pantalla =
            document.createElement(
                "div"
            );


        pantalla.id =
            "pantallaHistorial";


        pantalla.className =
            "oculto";


        pantalla.innerHTML = `

            <h2>📚 HISTORIAL LOCAL</h2>

            <p class="ayuda">
                Pallets guardados en este dispositivo.
            </p>

            <input
                id="buscarPalletLocal"
                type="text"
                placeholder="🔎 Buscar pallet..."
            >

            <div
                id="listaHistorialLocal"
            ></div>

            <button
                id="borrarHistorialLocal"
            >
                🗑️ BORRAR HISTORIAL
            </button>

            <button
                id="volverHistorialLocal"
                class="secundario"
            >
                ← VOLVER
            </button>

        `;


        app.appendChild(
            pantalla
        );


        /*
         * BUSCADOR
         */

        const buscador =
            document.getElementById(
                "buscarPalletLocal"
            );


        if (buscador) {

            buscador.addEventListener(
                "input",
                function () {

                    mostrarHistorial(
                        this.value
                    );

                }
            );

        }


        /*
         * BORRAR HISTORIAL
         */

        const borrar =
            document.getElementById(
                "borrarHistorialLocal"
            );


        if (borrar) {

            borrar.onclick =
                function () {

                    const confirmar =
                        confirm(
                            "¿Seguro que quieres borrar TODO el historial?"
                        );


                    if (!confirmar) {

                        return;

                    }


                    localStorage.removeItem(
                        STORAGE_KEY
                    );


                    mostrarHistorial();

                };

        }


        /*
         * VOLVER
         */

        const volver =
            document.getElementById(
                "volverHistorialLocal"
            );


        if (volver) {

            volver.onclick =
                function () {

                    const menu =
                        document.getElementById(
                            "menu"
                        );


                    if (
                        typeof mostrar ===
                        "function"
                    ) {

                        mostrar(menu);

                    }

                    else {

                        pantalla.classList.add(
                            "oculto"
                        );

                        menu.classList.remove(
                            "oculto"
                        );

                    }

                };

        }


        return pantalla;

    }


    /* =====================================================
       CREAR REPORTE
       ===================================================== */

    function crearReporte(
        registro
    ) {

        const piezas =
            Array.isArray(
                registro.piezas
            )
                ? registro.piezas
                : [];


        const modelo27 =
            piezas.filter(
                function (pieza) {

                    return (
                        pieza.modelo ===
                        "2.7"
                    );

                }
            ).length;


        const modelo30 =
            piezas.filter(
                function (pieza) {

                    return (
                        pieza.modelo ===
                        "3.0"
                    );

                }
            ).length;


        let texto =
            "";


        texto +=
            "NANO QR — REPORTE DE TRAZABILIDAD\n\n";


        texto +=
            "PALLET: " +
            registro.id +
            "\n";


        texto +=
            "FECHA: " +
            registro.fecha +
            "\n\n";


        texto +=
            "RESUMEN\n";


        texto +=
            "----------------------------\n";


        texto +=
            "TOTAL DE PIEZAS: " +
            piezas.length +
            " / 18\n";


        texto +=
            "MODELO 2.7: " +
            modelo27 +
            "\n";


        texto +=
            "MODELO 3.0: " +
            modelo30 +
            "\n\n";


        texto +=
            "DETALLE DE PIEZAS\n";


        texto +=
            "----------------------------\n\n";


        piezas.forEach(
            function (
                pieza,
                indice
            ) {

                texto +=
                    "PIEZA " +
                    (
                        indice + 1
                    ) +
                    "\n";


                texto +=
                    "Serie: " +
                    (
                        pieza.serie ||
                        "Sin serie"
                    ) +
                    "\n";


                texto +=
                    "Modelo: " +
                    (
                        pieza.modelo ||
                        "No identificado"
                    ) +
                    "\n";


                texto +=
                    "Código: " +
                    (
                        pieza.codigo ||
                        "No identificado"
                    ) +
                    "\n";


                texto +=
                    "Nota: " +
                    (
                        pieza.nota ||
                        "Sin nota"
                    ) +
                    "\n\n";

            }
        );


        texto +=
            "----------------------------\n";


        texto +=
            "Generado por NANO QR";


        return texto;

    }


    /* =====================================================
       MOSTRAR REPORTE
       ===================================================== */

    function mostrarReporte(
        registro
    ) {

        let pantalla =
            document.getElementById(
                "reporteHistorialLocal"
            );


        if (!pantalla) {

            pantalla =
                document.createElement(
                    "div"
                );


            pantalla.id =
                "reporteHistorialLocal";


            pantalla.className =
                "oculto";


            pantalla.innerHTML = `

                <h2>📋 REPORTE</h2>

                <textarea
                    id="textoReporteHistorial"
                    readonly
                    style="
                        width:100%;
                        min-height:420px;
                        box-sizing:border-box;
                        padding:12px;
                        border-radius:10px;
                        border:1px solid #ccc;
                        font-family:Arial,sans-serif;
                        font-size:14px;
                    "
                ></textarea>

                <button
                    id="copiarReporteHistorial"
                >
                    📋 COPIAR REPORTE
                </button>

                <button
                    id="compartirReporteHistorial"
                >
                    📤 COMPARTIR REPORTE
                </button>

                <button
                    id="volverReporteHistorial"
                    class="secundario"
                >
                    ← VOLVER
                </button>

            `;


            document
                .querySelector(
                    ".app"
                )
                .appendChild(
                    pantalla
                );


            /*
             * COPIAR
             */

            document
                .getElementById(
                    "copiarReporteHistorial"
                )
                .onclick =
                async function () {

                    const campo =
                        document
                            .getElementById(
                                "textoReporteHistorial"
                            );


                    const texto =
                        campo.value;


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                texto
                            );


                        alert(
                            "✅ REPORTE COPIADO"
                        );

                    }

                    catch {

                        campo.focus();

                        campo.select();

                        document.execCommand(
                            "copy"
                        );


                        alert(
                            "✅ REPORTE COPIADO"
                        );

                    }

                };


            /*
             * COMPARTIR
             */

            document
                .getElementById(
                    "compartirReporteHistorial"
                )
                .onclick =
                async function () {

                    const texto =
                        document
                            .getElementById(
                                "textoReporteHistorial"
                            )
                            .value;


                    if (
                        navigator.share
                    ) {

                        try {

                            await navigator.share({

                                title:
                                    "NANO QR - Reporte",

                                text:
                                    texto

                            });

                        }

                        catch {

                            /*
                             * Usuario canceló.
                             */

                        }

                    }

                    else {

                        try {

                            await navigator
                                .clipboard
                                .writeText(
                                    texto
                                );


                            alert(
                                "✅ REPORTE COPIADO"
                            );

                        }

                        catch {

                            alert(
                                "No se pudo compartir el reporte."
                            );

                        }

                    }

                };


            /*
             * VOLVER
             */

            document
                .getElementById(
                    "volverReporteHistorial"
                )
                .onclick =
                function () {

                    mostrarHistorial();

                };

        }


        document
            .getElementById(
                "textoReporteHistorial"
            )
            .value =
            crearReporte(
                registro
            );


        if (
            typeof mostrar ===
            "function"
        ) {

            mostrar(
                pantalla
            );

        }

        else {

            document
                .querySelectorAll(
                    ".app > div"
                )
                .forEach(
                    function (elemento) {

                        elemento.classList.add(
                            "oculto"
                        );

                    }
                );


            pantalla.classList.remove(
                "oculto"
            );

        }

    }


    /* =====================================================
       MOSTRAR HISTORIAL
       ===================================================== */

    function mostrarHistorial(
        filtro
    ) {

        const pantalla =
            crearPantallaHistorial();


        if (!pantalla) {

            return;

        }


        const lista =
            document.getElementById(
                "listaHistorialLocal"
            );


        if (!lista) {

            return;

        }


        lista.innerHTML =
            "";


        const busqueda =
            String(
                filtro ||
                ""
            )
            .toLowerCase()
            .trim();


        const pallets =
            leerPallets()
                .filter(
                    function (
                        pallet
                    ) {

                        return String(
                            pallet.id
                        )
                        .toLowerCase()
                        .includes(
                            busqueda
                        );

                    }
                );


        if (
            pallets.length ===
            0
        ) {

            lista.innerHTML = `

                <div
                    style="
                        padding:20px;
                        text-align:center;
                        color:#777;
                    "
                >
                    📭 No hay pallets guardados.
                </div>

            `;

        }


        pallets.forEach(
            function (
                registro
            ) {

                const caja =
                    document.createElement(
                        "div"
                    );


                caja.className =
                    "pieza";


                caja.innerHTML = `

                    <strong>
                        📦 ${registro.id}
                    </strong>

                    <span>
                        ${registro.piezas.length}
                        piezas
                    </span>

                    <span>
                        ${registro.fecha}
                    </span>

                `;


                /*
                 * VER REPORTE
                 */

                const ver =
                    document.createElement(
                        "button"
                    );


                ver.textContent =
                    "📋 VER REPORTE";


                ver.onclick =
                    function () {

                        mostrarReporte(
                            registro
                        );

                    };


                /*
                 * ELIMINAR
                 */

                const eliminar =
                    document.createElement(
                        "button"
                    );


                eliminar.textContent =
                    "🗑️ ELIMINAR";


                eliminar.onclick =
                    function () {

                        const confirmar =
                            confirm(
                                "¿Eliminar el pallet " +
                                registro.id +
                                "?"
                            );


                        if (
                            !confirmar
                        ) {

                            return;

                        }


                        const restantes =
                            leerPallets()
                                .filter(
                                    function (
                                        pallet
                                    ) {

                                        return (
                                            pallet.id !==
                                            registro.id
                                        );

                                    }
                                );


                        localStorage.setItem(

                            STORAGE_KEY,

                            JSON.stringify(
                                restantes
                            )

                        );


                        mostrarHistorial(
                            filtro
                        );

                    };


                caja.appendChild(
                    ver
                );


                caja.appendChild(
                    eliminar
                );


                lista.appendChild(
                    caja
                );

            }
        );


        if (
            typeof mostrar ===
            "function"
        ) {

            mostrar(
                pantalla
            );

        }

        else {

            document
                .querySelectorAll(
                    ".app > div"
                )
                .forEach(
                    function (elemento) {

                        elemento.classList.add(
                            "oculto"
                        );

                    }
                );


            pantalla.classList.remove(
                "oculto"
            );

        }

    }


    /* =====================================================
       INICIAR
       ===================================================== */

    function iniciar() {

        console.log(
            "📚 NANO QR - Historial local iniciado."
        );


        crearBotonHistorial();

        crearPantallaHistorial();

        conectarFinalizar();

    }


    /*
     * Esperamos a que script.js termine
     * de cargar todos sus elementos.
     */

    window.addEventListener(
        "load",
        function () {

            setTimeout(
                iniciar,
                1000
            );

        }
    );


    /*
     * Exponer funciones por si después
     * queremos utilizarlas desde otra parte.
     */

    window.NANO_QR_HISTORIAL = {

        leer:
            leerPallets,

        guardar:
            guardarPallet,

        mostrar:
            mostrarHistorial

    };


})();
