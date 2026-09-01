/* =========================================================
   NANO QR - MODO SIN BASE DE DATOS
   Reportes + guardado local del trabajo en curso
   ========================================================= */

(function () {
    "use strict";

    const DRAFT_KEY = "NANO_QR_BORRADOR_V1";
    const PALLET_PREFIX = "NANO_QR_PALLET_V1_";

    function byId(id) {
        return document.getElementById(id);
    }

    function safeText(value) {
        return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function getDraftFromScreen() {
        const id = safeText(byId("palletNumero")?.value);
        const cards = [...document.querySelectorAll("#listaPiezas .pieza")];

        const piezas = cards.map(card => {
            const spans = [...card.querySelectorAll("span")].map(safeText);
            const strong = safeText(card.querySelector("strong")?.textContent);

            let modelo = "";
            let codigo = "";
            let nota = "";

            for (const s of spans) {
                if (s.startsWith("Modelo:")) {
                    modelo = s.replace(/^Modelo:\s*/i, "");
                } else if (s.startsWith("Código:")) {
                    codigo = s.replace(/^Código:\s*/i, "");
                } else if (
                    s !== "" &&
                    !/^Pieza\s+\d+$/i.test(s)
                ) {
                    nota = s;
                }
            }

            return {
                serie: strong,
                modelo,
                codigo,
                nota
            };
        }).filter(p => p.serie);

        return {
            id,
            piezas
        };
    }

    function saveDraft() {
        try {
            const draft = getDraftFromScreen();

            if (
                !draft.id &&
                draft.piezas.length === 0
            ) {
                return;
            }

            localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify({
                    ...draft,
                    savedAt: new Date().toISOString()
                })
            );

        } catch (error) {
            console.warn(
                "NANO QR: no se pudo guardar el borrador local.",
                error
            );
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch (error) {}
    }

    function restoreDraft() {
        try {

            const raw =
                localStorage.getItem(
                    DRAFT_KEY
                );

            if (!raw) {
                return;
            }

            const draft =
                JSON.parse(raw);

            if (
                !draft ||
                !Array.isArray(draft.piezas) ||
                draft.piezas.length === 0
            ) {
                return;
            }

            const campo =
                byId("palletNumero");

            if (!campo) {
                return;
            }

            campo.value =
                draft.id || "";

            /*
             * Intentamos restaurar las piezas
             * usando la función de la aplicación.
             */

            if (
                typeof window.agregarPiezaAlPallet ===
                "function"
            ) {

                for (
                    const pieza of
                    draft.piezas
                ) {

                    try {

                        window.agregarPiezaAlPallet(
                            pieza.serie,
                            pieza.modelo,
                            pieza.codigo,
                            pieza.nota || ""
                        );

                    } catch (error) {

                        console.warn(
                            "NANO QR: no se pudo restaurar una pieza.",
                            error
                        );

                    }

                }

            }

            console.log(
                "✅ NANO QR: borrador local restaurado."
            );

        } catch (error) {

            console.warn(
                "NANO QR: no se pudo restaurar el borrador.",
                error
            );

        }
    }

    function getPalletFromVisibleList() {

        const id =
            safeText(
                byId("palletNumero")?.value ||
                byId("consultaNumero")?.textContent
            );

        const cards = [
            ...document.querySelectorAll(
                "#listaPiezas .pieza, #consultaPiezas .pieza"
            )
        ];

        const seen =
            new Set();

        const piezas =
            [];

        for (
            const card of
            cards
        ) {

            const serie =
                safeText(
                    card.querySelector("strong")
                        ?.textContent
                );

            if (
                !serie ||
                seen.has(serie)
            ) {
                continue;
            }

            const spans =
                [
                    ...card.querySelectorAll("span")
                ].map(safeText);

            let modelo = "";
            let codigo = "";
            let nota = "";

            for (
                const s of
                spans
            ) {

                if (
                    s.startsWith("Modelo:")
                ) {

                    modelo =
                        s.replace(
                            /^Modelo:\s*/i,
                            ""
                        );

                }

                else if (
                    s.startsWith("Código:")
                ) {

                    codigo =
                        s.replace(
                            /^Código:\s*/i,
                            ""
                        );

                }

                else if (
                    s &&
                    !/^Pieza\s+\d+$/i.test(s)
                ) {

                    nota =
                        s;

                }

            }

            seen.add(
                serie
            );

            piezas.push({

                serie,
                modelo,
                codigo,
                nota

            });

        }

        return {

            id,
            piezas

        };

    }


    function getReportTextFromPallet(
        pallet
    ) {

        const piezas =
            Array.isArray(
                pallet?.piezas
            )
                ? pallet.piezas
                : [];

        const total27 =
            piezas.filter(
                p => p.modelo === "2.7"
            ).length;

        const total30 =
            piezas.filter(
                p => p.modelo === "3.0"
            ).length;

        let texto =
            "NANO QR — REPORTE DE PALLET\n\n";

        texto +=
            `Pallet: ${pallet?.id || "SIN IDENTIFICADOR"}\n`;

        texto +=
            `Fecha: ${new Date().toLocaleString("es-MX")}\n`;

        texto +=
            `Total de piezas: ${piezas.length} / 18\n`;

        texto +=
            `Modelo 2.7: ${total27}\n`;

        texto +=
            `Modelo 3.0: ${total30}\n\n`;

        texto +=
            "PIEZAS\n";

        texto +=
            "----------------------------\n";

        piezas.forEach(
            function (
                pieza,
                index
            ) {

                texto +=
                    `${index + 1}. Serie: ${pieza.serie}\n`;

                texto +=
                    `   Modelo: ${pieza.modelo || "NO IDENTIFICADO"}\n`;

                texto +=
                    `   Código: ${pieza.codigo || "NO IDENTIFICADO"}\n`;

                texto +=
                    `   Nota: ${pieza.nota || "Sin nota"}\n\n`;

            }
        );

        texto +=
            "----------------------------\n";

        texto +=
            "Generado por NANO QR";

        return texto;

    }


    function getReportTextFromRack() {

        const id =
            safeText(
                byId("consultaRackNumero")?.textContent ||
                byId("rackNumero")?.value
            );

        const cards =
            [
                ...document.querySelectorAll(
                    "#palletsRackConsulta .palletRack, #listaPalletsRack .palletRack"
                )
            ];

        let totalPiezas = 0;
        let total27 = 0;
        let total30 = 0;

        const pallets =
            cards
                .map(
                    function(card) {

                        const spans =
                            [
                                ...card.querySelectorAll("span")
                            ].map(safeText);

                        const pallet =
                            safeText(
                                card.querySelector(
                                    "strong"
                                )?.textContent
                            );

                        const piezas =
                            Number(
                                (
                                    spans.find(
                                        s =>
                                            /piezas/i.test(
                                                s
                                            )
                                    ) || ""
                                ).match(
                                    /\d+/
                                )?.[0] || 0
                            );

                        const m27 =
                            Number(
                                (
                                    spans.find(
                                        s =>
                                            /^2\.7:/i.test(
                                                s
                                            )
                                    ) || ""
                                ).match(
                                    /\d+/
                                )?.[0] || 0
                            );

                        const m30 =
                            Number(
                                (
                                    spans.find(
                                        s =>
                                            /^3\.0:/i.test(
                                                s
                                            )
                                    ) || ""
                                ).match(
                                    /\d+/
                                )?.[0] || 0
                            );

                        totalPiezas +=
                            piezas;

                        total27 +=
                            m27;

                        total30 +=
                            m30;

                        return {

                            pallet,
                            piezas,
                            m27,
                            m30

                        };

                    }
                )
                .filter(
                    p =>
                        p.pallet
                );


        let texto =
            "NANO QR — REPORTE DE RACK\n\n";

        texto +=
            `Rack: ${id || "SIN IDENTIFICADOR"}\n`;

        texto +=
            `Fecha: ${new Date().toLocaleString("es-MX")}\n`;

        texto +=
            `Pallets: ${pallets.length}\n`;

        texto +=
            `Piezas: ${totalPiezas}\n`;

        texto +=
            `Modelo 2.7: ${total27}\n`;

        texto +=
            `Modelo 3.0: ${total30}\n\n`;

        texto +=
            "PALLETS\n";

        texto +=
            "----------------------------\n";

        pallets.forEach(
            function(
                pallet,
                index
            ) {

                texto +=
                    `${index + 1}. ${pallet.pallet}\n`;

                texto +=
                    `   Piezas: ${pallet.piezas}\n`;

                texto +=
                    `   2.7: ${pallet.m27}\n`;

                texto +=
                    `   3.0: ${pallet.m30}\n\n`;

            }
        );

        texto +=
            "----------------------------\n";

        texto +=
            "Generado por NANO QR";

        return texto;

    }


    async function copyText(
        texto
    ) {

        try {

            await navigator.clipboard.writeText(
                texto
            );

            alert(
                "✅ Reporte copiado. Ya puedes pegarlo en WhatsApp, correo o Teams."
            );

        }

        catch (error) {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                texto;

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();

            alert(
                "✅ Reporte copiado."
            );

        }

    }


    function ensureButton(
        id,
        label,
        handler,
        parentId
    ) {

        if (
            byId(id)
        ) {
            return;
        }

        const parent =
            byId(parentId);

        if (!parent) {
            return;
        }

        const boton =
            document.createElement(
                "button"
            );

        boton.id =
            id;

        boton.type =
            "button";

        boton.textContent =
            label;

        boton.addEventListener(
            "click",
            handler
        );

        parent.appendChild(
            boton
        );

    }


    function saveCurrentPalletSnapshot() {

        try {

            const pallet =
                getPalletFromVisibleList();

            if (
                !pallet.id ||
                !pallet.piezas.length
            ) {
                return;
            }

            localStorage.setItem(

                PALLET_PREFIX +
                pallet.id,

                JSON.stringify({

                    ...pallet,

                    savedAt:
                        new Date().toISOString()

                })

            );

        }

        catch (error) {

            console.warn(
                "NANO QR: no se pudo guardar el pallet localmente.",
                error
            );

        }

    }


    function setup() {

        /*
         * Reporte de pallet en la pantalla QR
         */

        ensureButton(

            "reportePalletQR",

            "📋 COPIAR REPORTE COMPLETO",

            function() {

                const id =
                    safeText(
                        byId("qrPalletNumero")
                            ?.textContent
                    );

                let pallet =
                    getPalletFromVisibleList();

                if (id) {

                    pallet.id =
                        id;

                }

                if (
                    !pallet.piezas.length
                ) {

                    try {

                        const raw =
                            localStorage.getItem(
                                PALLET_PREFIX +
                                id
                            );

                        if (raw) {

                            pallet =
                                JSON.parse(
                                    raw
                                );

                        }

                    }

                    catch (error) {}

                }

                copyText(
                    getReportTextFromPallet(
                        pallet
                    )
                );

            },

            "qrPallet"

        );


        /*
         * Reporte de pallet consultado
         */

        ensureButton(

            "reportePalletConsulta",

            "📋 COPIAR REPORTE COMPLETO",

            function() {

                copyText(

                    getReportTextFromPallet({

                        id:
                            byId(
                                "consultaNumero"
                            )
                            ?.textContent,

                        piezas:
                            getPalletFromVisibleList()
                                .piezas

                    })

                );

            },

            "informacionPallet"

        );


        /*
         * Reporte de rack
         */

        ensureButton(

            "reporteRackConsulta",

            "📋 COPIAR REPORTE COMPLETO",

            function() {

                copyText(
                    getReportTextFromRack()
                );

            },

            "informacionRack"

        );


        /*
         * Guardar automáticamente
         * cuando se finaliza un pallet.
         */

        const finalButton =
            byId(
                "finalizarPallet"
            );

        if (
            finalButton &&
            !finalButton.dataset.nanoOfflineHook
        ) {

            finalButton.dataset.nanoOfflineHook =
                "1";

            finalButton.addEventListener(

                "click",

                function() {

                    setTimeout(

                        function() {

                            saveCurrentPalletSnapshot();

                            clearDraft();

                        },

                        200

                    );

                }

            );

        }


        /*
         * Guardar borrador después
         * de cambios importantes.
         */

        const botones = [

            "confirmarPiezaEscaner",

            "confirmarPiezaManual",

            "guardarNota",

            "confirmarSegregacion",

            "confirmarPalletRack",

            "generarQRActualizado",

            "generarRackActualizado"

        ];


        for (
            const id of botones
        ) {

            const boton =
                byId(id);

            if (
                !boton ||
                boton.dataset.nanoDraftHook
            ) {

                continue;

            }

            boton.dataset.nanoDraftHook =
                "1";

            boton.addEventListener(

                "click",

                function() {

                    setTimeout(
                        saveDraft,
                        150
                    );

                }

            );

        }

    }


    /*
     * Exponer funciones por si
     * queremos usarlas después.
     */

    window.NANO_COPY_PALLET_REPORT =
        function() {

            const pallet =
                getPalletFromVisibleList();

            copyText(
                getReportTextFromPallet(
                    pallet
                )
            );

        };


    window.NANO_COPY_RACK_REPORT =
        function() {

            copyText(
                getReportTextFromRack()
            );

        };


    /*
     * Iniciar
     */

    window.addEventListener(

        "load",

        function() {

            setTimeout(

                function() {

                    setup();

                    /*
                     * Dejamos la restauración
                     * desactivada por defecto para
                     * no duplicar piezas de una sesión
                     * que ya exista.
                     */

                },

                600

            );

        }

    );


    console.log(
        "✅ NANO QR: modo sin base de datos activo."
    );

})();
