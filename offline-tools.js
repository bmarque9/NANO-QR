/* =========================================================
   NANO QR - REPORTE COMO RESULTADO PRINCIPAL
   Sin base de datos
   ========================================================= */

(function () {

    "use strict";


    const DRAFT_KEY =
        "NANO_QR_BORRADOR_V2";


    function byId(id) {
        return document.getElementById(id);
    }


    function txt(valor) {

        return String(
            valor ?? ""
        )
        .replace(/\s+/g, " ")
        .trim();

    }


    function escapeHTML(valor) {

        return txt(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       OBTENER PALLET
       ===================================================== */

    function obtenerPallet() {

        const id =
            txt(
                byId("palletNumero")?.value ||
                byId("qrPalletNumero")?.textContent ||
                byId("consultaNumero")?.textContent
            );


        /*
         * Primero intentamos obtener las piezas
         * directamente del script principal.
         */

        if (
            typeof window.NANO_GET_PIEZAS ===
            "function"
        ) {

            const piezas =
                window.NANO_GET_PIEZAS();

            if (
                Array.isArray(piezas) &&
                piezas.length > 0
            ) {

                return {

                    id,
                    piezas

                };

            }

        }


        /*
         * Compatibilidad con la variable
         * de la aplicación.
         */

        if (
            Array.isArray(
                window.palletActual
            ) &&
            window.palletActual.length > 0
        ) {

            return {

                id,
                piezas:
                    window.palletActual

            };

        }


        /*
         * Último recurso:
         * leer las piezas visibles.
         */

        const tarjetas =
            [
                ...document.querySelectorAll(
                    "#listaPiezas .pieza"
                )
            ];


        const piezas =
            tarjetas.map(
                function(tarjeta) {

                    const spans =
                        [
                            ...tarjeta
                                .querySelectorAll(
                                    "span"
                                )
                        ].map(txt);


                    const serie =
                        txt(
                            tarjeta
                                .querySelector(
                                    "strong"
                                )
                                ?.textContent
                        );


                    let modelo = "";
                    let codigo = "";
                    let nota = "";


                    spans.forEach(
                        function(valor) {

                            if (
                                valor.startsWith(
                                    "Modelo:"
                                )
                            ) {

                                modelo =
                                    valor.replace(
                                        /^Modelo:\s*/i,
                                        ""
                                    );

                            }


                            else if (
                                valor.startsWith(
                                    "Código:"
                                )
                            ) {

                                codigo =
                                    valor.replace(
                                        /^Código:\s*/i,
                                        ""
                                    );

                            }


                            else if (
                                valor &&
                                !/^Pieza\s+\d+$/i.test(
                                    valor
                                )
                            ) {

                                nota =
                                    valor;

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
                function(pieza) {

                    return pieza.serie;

                }
            );


        return {

            id,
            piezas

        };

    }


    /* =====================================================
       CREAR TEXTO DEL REPORTE
       ===================================================== */

    function crearReporte(
        pallet
    ) {

        const piezas =
            Array.isArray(
                pallet?.piezas
            )
                ? pallet.piezas
                : [];


        const ahora =
            new Date();


        const fecha =
            ahora.toLocaleDateString(
                "es-MX"
            );


        const hora =
            ahora.toLocaleTimeString(
                "es-MX"
            );


        const total27 =
            piezas.filter(
                function(pieza) {

                    return pieza.modelo ===
                        "2.7";

                }
            ).length;


        const total30 =
            piezas.filter(
                function(pieza) {

                    return pieza.modelo ===
                        "3.0";

                }
            ).length;


        let reporte =
            "";


        reporte +=
            "NANO QR — REPORTE DE PALLET\n\n";


        reporte +=
            "Pallet: " +
            (
                pallet?.id ||
                "SIN IDENTIFICADOR"
            ) +
            "\n";


        reporte +=
            "Fecha: " +
            fecha +
            "\n";


        reporte +=
            "Hora: " +
            hora +
            "\n\n";


        reporte +=
            "RESUMEN\n";


        reporte +=
            "----------------------------\n";


        reporte +=
            "Total de piezas: " +
            piezas.length +
            " / 18\n";


        reporte +=
            "Modelo 2.7: " +
            total27 +
            "\n";


        reporte +=
            "Modelo 3.0: " +
            total30 +
            "\n\n";


        reporte +=
            "PIEZAS\n";


        reporte +=
            "----------------------------\n\n";


        piezas.forEach(
            function(
                pieza,
                indice
            ) {

                reporte +=
                    (
                        indice +
                        1
                    ) +
                    ". Serie: " +
                    (
                        pieza.serie ||
                        "SIN SERIE"
                    ) +
                    "\n";


                reporte +=
                    "   Modelo: " +
                    (
                        pieza.modelo ||
                        "NO IDENTIFICADO"
                    ) +
                    "\n";


                reporte +=
                    "   Código: " +
                    (
                        pieza.codigo ||
                        "NO IDENTIFICADO"
                    ) +
                    "\n";


                reporte +=
                    "   Nota: " +
                    (
                        pieza.nota ||
                        "Sin nota"
                    ) +
                    "\n\n";

            }
        );


        reporte +=
            "----------------------------\n";


        reporte +=
            "Generado por NANO QR";


        return reporte;

    }


    /* =====================================================
       COPIAR
       ===================================================== */

    async function copiarReporte(
        reporte
    ) {

        try {

            await navigator.clipboard.writeText(
                reporte
            );


            alert(
                "✅ REPORTE COPIADO\n\n" +
                "Ahora puedes pegarlo en WhatsApp, correo, Teams o Word."
            );

        }


        catch (error) {

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value =
                reporte;


            textarea.style.position =
                "fixed";


            textarea.style.left =
                "-9999px";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();


            try {

                document.execCommand(
                    "copy"
                );

            }

            catch (_) {}


            textarea.remove();


            alert(
                "✅ REPORTE COPIADO"
            );

        }

    }


    /* =====================================================
       MOSTRAR REPORTE
       ===================================================== */

    function mostrarReporte() {

        const pallet =
            obtenerPallet();


        const reporte =
            crearReporte(
                pallet
            );


        let pantalla =
            byId(
                "pantallaReporteNano"
            );


        if (!pantalla) {

            pantalla =
                document.createElement(
                    "div"
                );


            pantalla.id =
                "pantallaReporteNano";


            pantalla.innerHTML = `

                <div style="
                    text-align:center;
                    width:100%;
                ">

                    <h2>
                        📋 REPORTE DE PALLET
                    </h2>

                    <p style="
                        color:#777;
                        margin-bottom:15px;
                    ">
                        Información lista para copiar
                        y enviar.
                    </p>

                    <textarea
                        id="textoReporteNano"
                        readonly
                        style="
                            width:100%;
                            min-height:380px;
                            padding:15px;
                            border:1px solid #ccc;
                            border-radius:12px;
                            font-family:Arial,sans-serif;
                            font-size:14px;
                            line-height:1.5;
                            resize:vertical;
                        "
                    ></textarea>

                    <button
                        id="copiarReporteNano"
                    >
                        📋 COPIAR REPORTE
                    </button>

                    <button
                        id="compartirReporteNano"
                    >
                        📤 COMPARTIR REPORTE
                    </button>

                    <button
                        id="crearOtroPalletNano"
                        class="secundario"
                    >
                        🔄 CREAR OTRO PALLET
                    </button>

                </div>

            `;


            document
                .querySelector(
                    ".app"
                )
                .appendChild(
                    pantalla
                );


            byId(
                "copiarReporteNano"
            )
            .addEventListener(
                "click",
                function() {

                    copiarReporte(
                        byId(
                            "textoReporteNano"
                        ).value
                    );

                }
            );


            byId(
                "compartirReporteNano"
            )
            .addEventListener(
                "click",
                async function() {

                    const texto =
                        byId(
                            "textoReporteNano"
                        ).value;


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

                        catch (error) {}

                    }

                    else {

                        copiarReporte(
                            texto
                        );

                    }

                }
            );


            byId(
                "crearOtroPalletNano"
            )
            .addEventListener(
                "click",
                function() {

                    pantalla
                        .classList.add(
                            "oculto"
                        );


                    if (
                        byId(
                            "menu"
                        )
                    ) {

                        mostrar(
                            byId(
                                "menu"
                            )
                        );

                    }

                }
            );

        }


        byId(
            "textoReporteNano"
        ).value =
            reporte;


        /*
         * Ocultamos todas las demás pantallas,
         * incluido el QR.
         */

        document
            .querySelectorAll(
                ".app > div"
            )
            .forEach(
                function(elemento) {

                    elemento.classList.add(
                        "oculto"
                    );

                }
            );


        pantalla
            .classList.remove(
                "oculto"
            );


        /*
         * Guardamos una copia local del reporte.
         */

        try {

            localStorage.setItem(

                "NANO_QR_ULTIMO_REPORTE",

                JSON.stringify({

                    pallet:
                        pallet,

                    reporte:
                        reporte,

                    fecha:
                        new Date()
                            .toISOString()

                })

            );

        }

        catch (_) {}

    }


    /* =====================================================
       INTERCEPTAR FINALIZAR
       ===================================================== */

    function conectarFinalizar() {

        const boton =
            byId(
                "finalizarPallet"
            );


        if (
            !boton ||
            boton.dataset.nanoReporteHook
        ) {

            return;

        }


        boton.dataset.nanoReporteHook =
            "1";


        /*
         * Dejamos que el sistema original termine
         * primero y después reemplazamos la pantalla QR
         * por el reporte.
         */

        boton.addEventListener(

            "click",

            function() {

                setTimeout(

                    function() {

                        mostrarReporte();

                    },

                    250

                );

            },

            false

        );

    }


    /* =====================================================
       GUARDADO LOCAL DEL BORRADOR
       ===================================================== */

    function guardarBorrador() {

        try {

            const pallet =
                obtenerPallet();


            if (
                !pallet.id &&
                pallet.piezas.length === 0
            ) {

                return;

            }


            localStorage.setItem(

                DRAFT_KEY,

                JSON.stringify({

                    pallet:
                        pallet,

                    fecha:
                        new Date()
                            .toISOString()

                })

            );

        }

        catch (error) {

            console.warn(
                "NANO QR: no se pudo guardar borrador.",
                error
            );

        }

    }


    /* =====================================================
       INICIALIZAR
       ===================================================== */

    function iniciar() {

        conectarFinalizar();


        const botones = [

            "confirmarPiezaEscaner",

            "confirmarPiezaManual",

            "guardarNota",

            "confirmarSegregacion",

            "confirmarPalletRack"

        ];


        botones.forEach(

            function(id) {

                const boton =
                    byId(id);


                if (
                    !boton ||
                    boton.dataset.nanoBorrador
                ) {

                    return;

                }


                boton.dataset.nanoBorrador =
                    "1";


                boton.addEventListener(

                    "click",

                    function() {

                        setTimeout(
                            guardarBorrador,
                            150
                        );

                    }

                );

            }

        );

    }


    window.addEventListener(

        "load",

        function() {

            setTimeout(
                iniciar,
                500
            );

        }

    );


    console.log(
        "✅ NANO QR: reporte listo."
    );

})();
