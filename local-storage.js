/* =========================================================
   NANO QR - GUARDADO LOCAL DE PALLETS
   ========================================================= */

(function () {

    "use strict";


    const STORAGE_KEY =
        "NANO_QR_PALLETS";


    function leerPallets() {

        try {

            const datos =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!datos) {
                return [];
            }

            const resultado =
                JSON.parse(datos);

            return Array.isArray(
                resultado
            )
                ? resultado
                : [];

        }
        catch (error) {

            console.error(
                "Error leyendo historial:",
                error
            );

            return [];

        }

    }


    function guardarPallet(
        id,
        piezas
    ) {

        if (
            !id ||
            !Array.isArray(piezas) ||
            piezas.length === 0
        ) {

            return;

        }


        const pallets =
            leerPallets();


        const registro = {

            id:
                id,

            piezas:
                JSON.parse(
                    JSON.stringify(
                        piezas
                    )
                ),

            fecha:
                new Date()
                    .toLocaleString(
                        "es-MX"
                    )

        };


        const existente =
            pallets.findIndex(
                function (pallet) {

                    return pallet.id ===
                        id;

                }
            );


        if (
            existente >= 0
        ) {

            pallets[
                existente
            ] =
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


        console.log(
            "✅ Pallet guardado localmente:",
            id
        );

    }


    function obtenerPalletDesdePantalla() {

        const campo =
            document.getElementById(
                "palletNumero"
            );


        const id =
            campo
                ? campo.value.trim()
                : "";


        const tarjetas =
            [
                ...document.querySelectorAll(
                    "#listaPiezas .pieza"
                )
            ];


        const piezas =
            tarjetas
                .map(
                    function (tarjeta) {

                        const serie =
                            (
                                tarjeta
                                    .querySelector(
                                        "strong"
                                    )
                                    ?.textContent ||
                                ""
                            )
                            .trim();


                        const spans =
                            [
                                ...tarjeta
                                    .querySelectorAll(
                                        "span"
                                    )
                            ]
                            .map(
                                function (
                                    elemento
                                ) {

                                    return (
                                        elemento
                                            .textContent ||
                                        ""
                                    )
                                    .trim();

                                }
                            );


                        let modelo =
                            "";

                        let codigo =
                            "";

                        let nota =
                            "";


                        spans.forEach(
                            function (
                                texto
                            ) {

                                if (
                                    texto.startsWith(
                                        "Modelo:"
                                    )
                                ) {

                                    modelo =
                                        texto.replace(
                                            /^Modelo:\s*/i,
                                            ""
                                        );

                                }

                                else if (
                                    texto.startsWith(
                                        "Código:"
                                    )
                                ) {

                                    codigo =
                                        texto.replace(
                                            /^Código:\s*/i,
                                            ""
                                        );

                                }

                                else if (
                                    texto &&
                                    !/^Pieza\s+\d+$/i.test(
                                        texto
                                    )
                                ) {

                                    nota =
                                        texto;

                                }

                            }
                        );


                        return {

                            serie,
                            modelo,
                            codigo,
                            nota

                        };

                    }
                )
                .filter(
                    function (pieza) {

                        return pieza.serie;

                    }
                );


        return {

            id,
            piezas

        };

    }


    function crearBotonHistorial() {

        if (
            document.getElementById(
                "historialLocal"
            )
        ) {

            return;

        }


        const menu =
            document.getElementById(
                "menu"
            );


        if (!menu) {
            return;
        }


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


    function crearPantallaHistorial() {

        if (
            document.getElementById(
                "pantallaHistorial"
            )
        ) {

            return;

        }


        const app =
            document.querySelector(
                ".app"
            );


        const pantalla =
            document.createElement(
                "div"
            );


        pantalla.id =
            "pantallaHistorial";


        pantalla.className =
            "oculto";


        pantalla.innerHTML = `

            <h2>📚 HISTORIAL LOCAL</h2>

            <input
                id="buscarPalletLocal"
                placeholder="Buscar pallet..."
            >

            <div
                id="listaHistorialLocal"
            ></div>

            <button
                id="borrarHistorialLocal"
                class="peligro"
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


        document
            .getElementById(
                "buscarPalletLocal"
            )
            .addEventListener(
                "input",
                function () {

                    mostrarHistorial(
                        this.value
                    );

                }
            );


        document
            .getElementById(
                "borrarHistorialLocal"
            )
            .onclick =
            function () {

                if (
                    !confirm(
                        "¿Borrar todo el historial?"
                    )
                ) {

                    return;

                }


                localStorage.removeItem(
                    STORAGE_KEY
                );


                mostrarHistorial();

            };


        document
            .getElementById(
                "volverHistorialLocal"
            )
            .onclick =
            function () {

                mostrar(
                    document.getElementById(
                        "menu"
                    )
                );

            };

    }


    function mostrarReporte(
        registro
    ) {

        let pantalla =
            document.getElementById(
                "reporteLocal"
            );


        if (!pantalla) {

            pantalla =
                document.createElement(
                    "div"
                );


            pantalla.id =
                "reporteLocal";


            pantalla.className =
                "oculto";


            pantalla.innerHTML = `

                <h2>📋 REPORTE DE PALLET</h2>

                <textarea
                    id="textoReporteLocal"
                    readonly
                    style="
                        width:100%;
                        min-height:420px;
                        padding:15px;
                        border:1px solid #ccc;
                        border-radius:10px;
                        font-family:Arial,sans-serif;
                        font-size:14px;
                        line-height:1.5;
                    "
                ></textarea>

                <button
                    id="copiarReporteLocal"
                >
                    📋 COPIAR REPORTE
                </button>

                <button
                    id="compartirReporteLocal"
                >
                    📤 COMPARTIR REPORTE
                </button>

                <button
                    id="volverReporteLocal"
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


            document
                .getElementById(
                    "copiarReporteLocal"
                )
                .onclick =
                async function () {

                    const texto =
                        document
                            .getElementById(
                                "textoReporteLocal"
                            )
                            .value;


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                texto
                            );

                        alert(
                            "✅ Reporte copiado."
                        );

                    }
                    catch {

                        const campo =
                            document
                                .getElementById(
                                    "textoReporteLocal"
                                );

                        campo.select();

                        document.execCommand(
                            "copy"
                        );

                        alert(
                            "✅ Reporte copiado."
                        );

                    }

                };


            document
                .getElementById(
                    "compartirReporteLocal"
                )
                .onclick =
                async function () {

                    const texto =
                        document
                            .getElementById(
                                "textoReporteLocal"
                            )
                            .value;


                    if (
                        navigator.share
                    ) {

                        try {

                            await navigator.share({

                                title:
                                    "Reporte NANO QR",

                                text:
                                    texto

                            });

                        }
                        catch {}

                    }
                    else {

                        try {

                            await navigator.clipboard.writeText(
                                texto
                            );

                            alert(
                                "✅ Reporte copiado."
                            );

                        }
                        catch {}

                    }

                };


            document
                .getElementById(
                    "volverReporteLocal"
                )
                .onclick =
                function () {

                    mostrar(
                        document.getElementById(
                            "pantallaHistorial"
                        )
                    );

                };

        }


        document
            .getElementById(
                "textoReporteLocal"
            )
            .value =
            crearReporte(
                registro
            );


        mostrar(
            pantalla
        );

    }


    function crearReporte(
        registro
    ) {

        const piezas =
            Array.isArray(
                registro.piezas
            )
                ? registro.piezas
                : [];


        const m27 =
            piezas.filter(
                p =>
                    p.modelo ===
                    "2.7"
            ).length;


        const m30 =
            piezas.filter(
                p =>
                    p.modelo ===
                    "3.0"
            ).length;


        let texto =
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
            "Total de piezas: " +
            piezas.length +
            " / 18\n";

        texto +=
            "Modelo 2.7: " +
            m27 +
            "\n";

        texto +=
            "Modelo 3.0: " +
            m30 +
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
                    String(
                        indice + 1
                    ).padStart(
                        2,
                        "0"
                    ) +
                    " | " +
                    pieza.serie +
                    "\n";

                texto +=
                    "    Modelo: " +
                    (
                        pieza.modelo ||
                        "NO IDENTIFICADO"
                    ) +
                    "\n";

                texto +=
                    "    Código: " +
                    (
                        pieza.codigo ||
                        "NO IDENTIFICADO"
                    ) +
                    "\n";

                texto +=
                    "    Nota: " +
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


    function mostrarHistorial(
        filtro
    ) {

        crearPantallaHistorial();


        const lista =
            document
                .getElementById(
                    "listaHistorialLocal"
                );


        lista.innerHTML =
            "";


        const busqueda =
            (
                filtro ||
                ""
            )
            .toLowerCase()
            .trim();


        const pallets =
            leerPallets()
                .filter(
                    function (
                        registro
                    ) {

                        return registro.id
                            .toLowerCase()
                            .includes(
                                busqueda
                            );

                    }
                );


        if (
            pallets.length === 0
        ) {

            lista.innerHTML =
                "<p style='color:#777;margin-top:20px;'>No hay pallets guardados.</p>";

            mostrar(
                document.getElementById(
                    "pantallaHistorial"
                )
            );

            return;

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
                        ${registro.id}
                    </strong>

                    <span>
                        ${registro.piezas.length}
                        piezas
                    </span>

                    <span>
                        ${registro.fecha}
                    </span>

                `;


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


                const eliminar =
                    document.createElement(
                        "button"
                    );


                eliminar.className =
                    "peligro";


                eliminar.textContent =
                    "🗑️ ELIMINAR";


                eliminar.onclick =
                    function () {

                        if (
                            !confirm(
                                "¿Eliminar " +
                                registro.id +
                                "?"
                            )
                        ) {

                            return;

                        }


                        const restantes =
                            leerPallets()
                                .filter(
                                    function (
                                        p
                                    ) {

                                        return p.id !==
                                            registro.id;

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


        mostrar(
            document.getElementById(
                "pantallaHistorial"
            )
        );

    }


    function conectarFinalizar() {

        const boton =
            document.getElementById(
                "finalizarPallet"
            );


        if (
            !boton ||
            boton.dataset.nanoLocal
        ) {

            return;

        }


        boton.dataset.nanoLocal =
            "1";


        /*
         * Capture=true para tomar el botón
         * antes del evento original.
         *
         * Después esperamos a que el flujo
         * original termine y leemos la lista.
         */

        boton.addEventListener(

            "click",

            function () {

                setTimeout(

                    function () {

                        const pallet =
                            obtenerPalletDesdePantalla();


                        if (
                            pallet.id &&
                            pallet.piezas.length
                        ) {

                            guardarPallet(

                                pallet.id,

                                pallet.piezas

                            );

                        }

                    },

                    300

                );

            },

            true

        );

    }


    window.addEventListener(

        "load",

        function () {

            setTimeout(

                function () {

                    crearBotonHistorial();

                    crearPantallaHistorial();

                    conectarFinalizar();

                },

                800

            );

        }

    );


    window.NANO_HISTORIAL =
        leerPallets;


})();
