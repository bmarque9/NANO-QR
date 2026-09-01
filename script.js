let palletActual = [];

let rackActual = [];

let piezaSeleccionada = null;

let palletSeleccionado = null;

let numeroPalletAutomatico = 1;

let scannerPieza = null;

let scannerPallet = null;

let scannerConsultaPieza = null;

let scannerPalletRack = null;

let scannerRack = null;

let escaneandoPieza = false;

let escaneandoPallet = false;

let escaneandoConsultaPieza = false;

let escaneandoPalletRack = false;

let escaneandoRack = false;
/* =========================================
   PUENTE PARA SUPABASE
   ========================================= */

window.NANO_GET_PIEZAS = function() {
    return palletActual;
};

/* ========================================= */
/* MOSTRAR PANTALLA */
/* ========================================= */

function mostrar(pantalla) {

document
.querySelectorAll(".app > div")
.forEach(function(elemento){

elemento.classList.add("oculto");

});

pantalla.classList.remove("oculto");

}


/* ========================================= */
/* ANALIZAR PIEZA */
/* ========================================= */

function analizarCodigo(codigo) {

codigo = codigo.trim();

let codigoDetectado="DESCONOCIDO";

let modeloDetectado="NO IDENTIFICADO";

if(codigo.includes("PBFT4E")){

codigoDetectado="PBFT4E";

modeloDetectado="2.7";

}

else if(codigo.includes("PBGB8E")){

codigoDetectado="PBGB8E";

modeloDetectado="3.0";

}

const posicionModelo=codigo.indexOf("PB");

let numeroSerie;

if(posicionModelo>0){

numeroSerie=

codigo.substring(0,posicionModelo).trim();

}

else{

numeroSerie=codigo;

}

return{

serie:numeroSerie,

modelo:modeloDetectado,

codigo:codigoDetectado

};

}


/* ========================================= */
/* CREAR PALLET */
/* ========================================= */

document
.getElementById("nuevoPallet")
.addEventListener("click",function(){

palletActual=[];

document
.getElementById("palletNumero")
.value=
"NANO-"+String(numeroPalletAutomatico).padStart(3,"0");

actualizarLista();

mostrar(
document.getElementById("crear")
);

});


/* ========================================= */
/* AGREGAR PIEZA */
/* ========================================= */

document
.getElementById("agregarPieza")
.addEventListener("click",function(){

if(palletActual.length>=18){

alert("El pallet ya tiene 18 piezas.");

return;

}

mostrar(
document.getElementById("metodoPieza")
);

});


/* ========================================= */
/* ESCANEAR PIEZA */
/* ========================================= */

document
.getElementById("escanearPiezaBoton")
.addEventListener("click",function(){

document
.getElementById("piezaDetectada")
.classList.add("oculto");

mostrar(
document.getElementById("escanearPieza")
);

iniciarScannerPieza();

});


function iniciarScannerPieza(){

if(escaneandoPieza)return;

scannerPieza=
new Html5Qrcode("reader");

scannerPieza.start(

{facingMode:"environment"},

{

fps:10,

qrbox:{
width:250,
height:250
},

formatsToSupport:[
Html5QrcodeSupportedFormats.DATA_MATRIX
]

},

function(codigo){

const datos=analizarCodigo(codigo);

document.getElementById("serie").textContent=datos.serie;

document.getElementById("modelo").textContent=datos.modelo;

document.getElementById("codigoModelo").textContent=datos.codigo;

document
.getElementById("piezaDetectada")
.classList.remove("oculto");

detenerScannerPieza();

},

function(){}

)

.then(function(){

escaneandoPieza=true;

})

.catch(function(error){

console.error(error);

alert("No se pudo abrir la cámara.");

});

}


/* ========================================= */
/* AGREGAR ESCANEADA */
/* ========================================= */

document
.getElementById("confirmarPiezaEscaner")
.addEventListener("click",function(){

agregarPieza(

document.getElementById("serie").textContent,

document.getElementById("modelo").textContent,

document.getElementById("codigoModelo").textContent,

document.getElementById("notaEscaner").value.trim()

);

});


/* ========================================= */
/* CAPTURA MANUAL */
/* ========================================= */

document
.getElementById("manualPiezaBoton")
.addEventListener("click",function(){

document
.getElementById("codigoManual")
.value="";

document
.getElementById("resultadoManual")
.classList.add("oculto");

mostrar(
document.getElementById("manual")
);

});


document
.getElementById("procesarManual")
.addEventListener("click",function(){

const codigo=
document
.getElementById("codigoManual")
.value.trim();

if(!codigo){

alert("Escribe el código.");

return;

}

const datos=analizarCodigo(codigo);

document.getElementById("serieManual").textContent=datos.serie;

document.getElementById("modeloManual").textContent=datos.modelo;

document.getElementById("codigoModeloManual").textContent=datos.codigo;

document
.getElementById("resultadoManual")
.classList.remove("oculto");

});


document
.getElementById("confirmarPiezaManual")
.addEventListener("click",function(){

agregarPieza(

document.getElementById("serieManual").textContent,

document.getElementById("modeloManual").textContent,

document.getElementById("codigoModeloManual").textContent,

document.getElementById("notaManual").value.trim()

);

});


/* ========================================= */
/* AGREGAR PIEZA */
/* ========================================= */

function agregarPieza(

serie,
modelo,
codigo,
nota

){

if(!serie||serie==="NO IDENTIFICADO"){

alert("Número de serie inválido.");

return;

}

if(palletActual.length>=18){

alert("El pallet ya tiene 18 piezas.");

return;

}

if(
palletActual.some(function(p){

return p.serie===serie;

})
){

alert("Esta pieza ya está en el pallet.");

return;

}

palletActual.push({

serie:serie,

modelo:modelo,

codigo:codigo,

nota:nota

});

actualizarLista();

mostrar(
document.getElementById("crear")
);

}


/* ========================================= */
/* LISTA PALLET */
/* ========================================= */

function actualizarLista(){

const lista=
document.getElementById("listaPiezas");

lista.innerHTML="";

document
.getElementById("contadorPiezas")
.textContent=
palletActual.length+" / 18";

if(palletActual.length===0){

lista.innerHTML=
"<p style='color:#777'>No hay piezas todavía.</p>";

return;

}

palletActual.forEach(function(pieza,index){

const div=
document.createElement("div");

div.className="pieza";

div.innerHTML=`

<span>Pieza ${index+1}</span>

<strong>${pieza.serie}</strong>

<span>Modelo: ${pieza.modelo}</span>

<span>Código: ${pieza.codigo}</span>

<span>${pieza.nota||"Sin nota"}</span>

`;

lista.appendChild(div);

});

}


/* ========================================= */
/* FINALIZAR PALLET */
/* ========================================= */

document
.getElementById("finalizarPallet")
.addEventListener("click",function(){

const id=
document
.getElementById("palletNumero")
.value.trim();

if(!id){

alert("Escribe el identificador.");

return;

}

if(palletActual.length===0){

alert("Agrega al menos una pieza.");

return;

}

generarQRPallet(id,palletActual);

numeroPalletAutomatico++;

});


function generarQRPallet(id,piezas){

const datos={

pallet:id,

piezas:piezas

};

const contenedor=
document.getElementById("codigoQR");

contenedor.innerHTML="";

document
.getElementById("qrPalletNumero")
.textContent=id;

new QRCode(

contenedor,

{

text:JSON.stringify(datos),

width:240,

height:240,

correctLevel:QRCode.CorrectLevel.M

}

);

mostrar(
document.getElementById("qrPallet")
);

}


/* ========================================= */
/* CONSULTAR PIEZA */
/* ========================================= */

document
.getElementById("consultarPieza")
.addEventListener("click",function(){

document
.getElementById("resultadoConsultaPieza")
.classList.add("oculto");

mostrar(
document.getElementById("consultaPieza")
);

iniciarScannerConsultaPieza();

});


function iniciarScannerConsultaPieza(){

if(escaneandoConsultaPieza)return;

scannerConsultaPieza=
new Html5Qrcode("readerConsultaPieza");

scannerConsultaPieza.start(

{facingMode:"environment"},

{

fps:10,

qrbox:{
width:250,
height:250
},

formatsToSupport:[
Html5QrcodeSupportedFormats.DATA_MATRIX
]

},

function(codigo){

const datos=analizarCodigo(codigo);

document
.getElementById("serieConsultaPieza")
.textContent=datos.serie;

document
.getElementById("modeloConsultaPieza")
.textContent=datos.modelo;

document
.getElementById("codigoConsultaPieza")
.textContent=datos.codigo;

document
.getElementById("resultadoConsultaPieza")
.classList.remove("oculto");

detenerScannerConsultaPieza();

},

function(){}

)

.then(function(){

escaneandoConsultaPieza=true;

})

.catch(function(error){

console.error(error);

alert("No se pudo abrir la cámara.");

});

}


/* ========================================= */
/* COPIAR SERIE */
/* ========================================= */

document
.getElementById("copiarSerie")
.addEventListener("click",async function(){

const serie=
document
.getElementById("serieConsultaPieza")
.textContent;

try{

await navigator.clipboard.writeText(serie);

alert("Número de serie copiado.");

}

catch{

alert("No se pudo copiar.");

}

});


/* ========================================= */
/* CONSULTAR PALLET */
/* ========================================= */

document
.getElementById("consultarPallet")
.addEventListener("click",function(){

document
.getElementById("informacionPallet")
.classList.add("oculto");

mostrar(
document.getElementById("consultar")
);

iniciarScannerPallet();

});


function iniciarScannerPallet(){

if(escaneandoPallet)return;

scannerPallet=
new Html5Qrcode("readerPallet");

scannerPallet.start(

{facingMode:"environment"},

{

fps:10,

qrbox:{
width:250,
height:250
}

},

function(codigo){

try{

const datos=JSON.parse(codigo);

palletActual=datos.piezas;

document
.getElementById("consultaNumero")
.textContent=datos.pallet;

actualizarConsulta();

detenerScannerPallet();

}

catch{

alert("QR de pallet inválido.");

}

},

function(){}

)

.then(function(){

escaneandoPallet=true;

})

.catch(function(error){

console.error(error);

alert("No se pudo abrir la cámara.");

});

}


/* ========================================= */
/* MOSTRAR PALLET */
/* ========================================= */

function actualizarConsulta(){

document
.getElementById("consultaResumen")
.innerHTML=
`<strong>${palletActual.length} / 18 piezas</strong>`;

const contenedor=
document.getElementById("consultaPiezas");

contenedor.innerHTML="";

palletActual.forEach(function(pieza,index){

const div=
document.createElement("div");

div.className="pieza";

div.innerHTML=`

<span>Pieza ${index+1}</span>

<strong>${pieza.serie}</strong>

<span>Modelo: ${pieza.modelo}</span>

<span>Código: ${pieza.codigo}</span>

<span>${pieza.nota||"Sin nota"}</span>

`;

contenedor.appendChild(div);

});

document
.getElementById("informacionPallet")
.classList.remove("oculto");

}


/* ========================================= */
/* AGREGAR A PALLET EXISTENTE */
/* ========================================= */

document
.getElementById("agregarPiezaExistente")
.addEventListener("click",function(){

if(palletActual.length>=18){

alert("El pallet está lleno.");

return;

}

mostrar(
document.getElementById("metodoPieza")
);

});


/* ========================================= */
/* SEGREGAR */
/* ========================================= */

document
.getElementById("segregarPieza")
.addEventListener("click",function(){

abrirSeleccionPieza("SEGREGAR PIEZA");

});


function abrirSeleccionPieza(titulo){

document
.getElementById("tituloSeleccion")
.textContent=titulo;

const lista=
document.getElementById("listaSeleccion");

lista.innerHTML="";

palletActual.forEach(function(pieza,index){

const boton=
document.createElement("button");

boton.className="piezaSeleccion";

boton.innerHTML=`

<strong>${index+1}. ${pieza.serie}</strong>

<span>Modelo: ${pieza.modelo}</span>

<span>${pieza.nota||"Sin nota"}</span>

`;

boton.onclick=function(){

piezaSeleccionada=index;

if(titulo==="SEGREGAR PIEZA"){

abrirSegregacion();

}

else{

abrirEdicion();

}

};

lista.appendChild(boton);

});

mostrar(
document.getElementById("seleccionarPieza")
);

}


/* ========================================= */
/* SEGREGACION */
/* ========================================= */

function abrirSegregacion(){

const pieza=
palletActual[piezaSeleccionada];

document
.getElementById("serieSegregar")
.textContent=pieza.serie;

document
.getElementById("modeloSegregar")
.textContent=pieza.modelo;

document
.getElementById("motivoSegregacion")
.value="";

mostrar(
document.getElementById("segregar")
);

}


document
.getElementById("confirmarSegregacion")
.addEventListener("click",function(){

const motivo=
document
.getElementById("motivoSegregacion")
.value.trim();

if(!motivo){

alert("Escribe el motivo.");

return;

}

palletActual.splice(
piezaSeleccionada,
1
);

piezaSeleccionada=null;

actualizarConsulta();

alert(
"La pieza fue segregada.\n\nGenera el QR actualizado."
);

mostrar(
document.getElementById("consultar")
);

});


/* ========================================= */
/* EDITAR NOTA */
/* ========================================= */

document
.getElementById("editarNota")
.addEventListener("click",function(){

abrirSeleccionPieza("MODIFICAR NOTA");

});


function abrirEdicion(){

const pieza=
palletActual[piezaSeleccionada];

document
.getElementById("serieEditar")
.textContent=pieza.serie;

document
.getElementById("modeloEditar")
.textContent=pieza.modelo;

document
.getElementById("nuevaNota")
.value=pieza.nota||"";

mostrar(
document.getElementById("editar")
);

}


document
.getElementById("guardarNota")
.addEventListener("click",function(){

palletActual[
piezaSeleccionada
].nota=
document
.getElementById("nuevaNota")
.value.trim();

piezaSeleccionada=null;

actualizarConsulta();

alert(
"Nota actualizada.\n\nGenera el QR actualizado."
);

mostrar(
document.getElementById("consultar")
);

});


/* ========================================= */
/* QR ACTUALIZADO PALLET */
/* ========================================= */

document
.getElementById("generarQRActualizado")
.addEventListener("click",function(){

const id=
document
.getElementById("consultaNumero")
.textContent;

generarQRPallet(
id,
palletActual
);

});


/* ========================================= */
/* CREAR RACK */
/* ========================================= */

document
.getElementById("nuevoRack")
.addEventListener("click",function(){

rackActual=[];

document
.getElementById("rackNumero")
.value="RACK-A01";

actualizarRackLista();

mostrar(
document.getElementById("crearRack")
);

});


/* ========================================= */
/* AGREGAR PALLET AL RACK */
/* ========================================= */

document
.getElementById("agregarPalletRack")
.addEventListener("click",function(){

mostrar(
document.getElementById(
"agregarPalletRackPantalla"
)
);

iniciarScannerPalletRack();

});


function iniciarScannerPalletRack(){

if(escaneandoPalletRack)return;

scannerPalletRack=
new Html5Qrcode("readerPalletRack");

scannerPalletRack.start(

{facingMode:"environment"},

{

fps:10,

qrbox:{
width:250,
height:250
}

},

function(codigo){

try{

const datos=JSON.parse(codigo);

document
.getElementById("rackPalletNumero")
.textContent=
datos.pallet;

const total=datos.piezas.length;

const modelo27=
datos.piezas.filter(
p=>p.modelo==="2.7"
).length;

const modelo30=
datos.piezas.filter(
p=>p.modelo==="3.0"
).length;

document
.getElementById("rackPalletResumen")
.innerHTML=`

<p><strong>${total} piezas</strong></p>

<p>2.7: ${modelo27}</p>

<p>3.0: ${modelo30}</p>

`;

window.palletTemporalRack=datos;

document
.getElementById("palletDetectadoRack")
.classList.remove("oculto");

detenerScannerPalletRack();

}

catch{

alert("QR de pallet inválido.");

}

},

function(){}

)

.then(function(){

escaneandoPalletRack=true;

})

.catch(function(error){

console.error(error);

alert("No se pudo abrir la cámara.");

});

}


/* ========================================= */
/* CONFIRMAR PALLET EN RACK */
/* ========================================= */

document
.getElementById("confirmarPalletRack")
.addEventListener("click",function(){

const pallet=
window.palletTemporalRack;

if(!pallet)return;

if(
rackActual.some(
p=>p.pallet===pallet.pallet
)
){

alert("Este pallet ya está en el rack.");

return;

}

rackActual.push(pallet);

actualizarRackLista();

mostrar(
document.getElementById("crearRack")
);

});


/* ========================================= */
/* ACTUALIZAR RACK */
/* ========================================= */

function actualizarRackLista(){

const lista=
document.getElementById(
"listaPalletsRack"
);

lista.innerHTML="";

document
.getElementById(
"contadorPalletsRack"
)
.textContent=
rackActual.length;

if(rackActual.length===0){

lista.innerHTML=
"<p style='color:#777'>No hay pallets todavía.</p>";

return;

}

rackActual.forEach(function(pallet){

const total=pallet.piezas.length;

const m27=
pallet.piezas.filter(
p=>p.modelo==="2.7"
).length;

const m30=
pallet.piezas.filter(
p=>p.modelo==="3.0"
).length;

const div=
document.createElement("div");

div.className="palletRack";

div.innerHTML=`

<strong>${pallet.pallet}</strong>

<span>Total: ${total} piezas</span>

<span>2.7: ${m27}</span>

<span>3.0: ${m30}</span>

`;

lista.appendChild(div);

});

}


/* ========================================= */
/* FINALIZAR RACK */
/* ========================================= */

document
.getElementById("finalizarRack")
.addEventListener("click",function(){

const id=
document
.getElementById("rackNumero")
.value.trim();

if(!id){

alert("Escribe el identificador del rack.");

return;

}

if(rackActual.length===0){

alert("Agrega al menos un pallet.");

return;

}

generarQRRack(
id,
rackActual
);

});


/* ========================================= */
/* GENERAR QR RACK */
/* ========================================= */

function generarQRRack(id,pallets){

const datos={

rack:id,

pallets:pallets

};

const contenedor=
document.getElementById("codigoQRRack");

contenedor.innerHTML="";

document
.getElementById("qrRackNumero")
.textContent=id;

new QRCode(

contenedor,

{

text:JSON.stringify(datos),

width:240,

height:240,

correctLevel:QRCode.CorrectLevel.L

}

);

mostrar(
document.getElementById("qrRack")
);

}


/* ========================================= */
/* CONSULTAR RACK */
/* ========================================= */

document
.getElementById("consultarRack")
.addEventListener("click",function(){

document
.getElementById("informacionRack")
.classList.add("oculto");

mostrar(
document.getElementById(
"consultarRackPantalla"
)
);

iniciarScannerRack();

});


function iniciarScannerRack(){

if(escaneandoRack)return;

scannerRack=
new Html5Qrcode("readerRack");

scannerRack.start(

{facingMode:"environment"},

{

fps:10,

qrbox:{
width:250,
height:250
}

},

function(codigo){

try{

const datos=JSON.parse(codigo);

rackActual=datos.pallets;

document
.getElementById("consultaRackNumero")
.textContent=
datos.rack;

mostrarInformacionRack();

detenerScannerRack();

}

catch{

alert("QR de rack inválido.");

}

},

function(){}

)

.then(function(){

escaneandoRack=true;

})

.catch(function(error){

console.error(error);

alert("No se pudo abrir la cámara.");

});

}


/* ========================================= */
/* INFORMACIÓN RACK */
/* ========================================= */

function mostrarInformacionRack(){

let totalPiezas=0;

let total27=0;

let total30=0;

rackActual.forEach(function(pallet){

totalPiezas+=pallet.piezas.length;

pallet.piezas.forEach(function(pieza){

if(pieza.modelo==="2.7")total27++;

if(pieza.modelo==="3.0")total30++;

});

});

document
.getElementById("resumenRack")
.innerHTML=`

<strong>
${rackActual.length} pallets /
${totalPiezas} piezas
</strong>

<br><br>

2.7: ${total27}

<br>

3.0: ${total30}

`;

const contenedor=
document.getElementById(
"palletsRackConsulta"
);

contenedor.innerHTML="";

rackActual.forEach(function(pallet){

const div=
document.createElement("div");

div.className="palletRack";

const total=pallet.piezas.length;

const m27=
pallet.piezas.filter(
p=>p.modelo==="2.7"
).length;

const m30=
pallet.piezas.filter(
p=>p.modelo==="3.0"
).length;

div.innerHTML=`

<strong>${pallet.pallet}</strong>

<span>${total} piezas</span>

<span>2.7: ${m27}</span>

<span>3.0: ${m30}</span>

`;

contenedor.appendChild(div);

});

document
.getElementById("informacionRack")
.classList.remove("oculto");

}


/* ========================================= */
/* RETIRAR PALLET */
/* ========================================= */

document
.getElementById("retirarPalletRack")
.addEventListener("click",function(){

if(rackActual.length===0){

alert("No hay pallets.");

return;

}

const lista=
document.getElementById(
"listaPalletsSeleccion"
);

lista.innerHTML="";

rackActual.forEach(function(pallet,index){

const boton=
document.createElement("button");

boton.className="palletSeleccion";

boton.innerHTML=`

<strong>${pallet.pallet}</strong>

<span>
${pallet.piezas.length} piezas
</span>

`;

boton.onclick=function(){

rackActual.splice(index,1);

mostrarInformacionRack();

alert(
"El pallet fue retirado.\n\nGenera el QR actualizado del rack."
);

mostrar(
document.getElementById(
"consultarRackPantalla"
)
);

};

lista.appendChild(boton);

});

mostrar(
document.getElementById(
"seleccionarPalletRack"
)
);

});


/* ========================================= */
/* QR RACK ACTUALIZADO */
/* ========================================= */

document
.getElementById("generarRackActualizado")
.addEventListener("click",function(){

const id=
document
.getElementById(
"consultaRackNumero"
)
.textContent;

if(rackActual.length===0){

alert("El rack ya no tiene pallets.");

return;

}

generarQRRack(
id,
rackActual
);

});


/* ========================================= */
/* DETENER SCANNERS */
/* ========================================= */

function detenerScannerPieza(){

if(
scannerPieza &&
escaneandoPieza
){

scannerPieza.stop()
.catch(()=>{});

escaneandoPieza=false;

}

}


function detenerScannerPallet(){

if(
scannerPallet &&
escaneandoPallet
){

scannerPallet.stop()
.catch(()=>{});

escaneandoPallet=false;

}

}


function detenerScannerConsultaPieza(){

if(
scannerConsultaPieza &&
escaneandoConsultaPieza
){

scannerConsultaPieza.stop()
.catch(()=>{});

escaneandoConsultaPieza=false;

}

}


function detenerScannerPalletRack(){

if(
scannerPalletRack &&
escaneandoPalletRack
){

scannerPalletRack.stop()
.catch(()=>{});

escaneandoPalletRack=false;

}

}


function detenerScannerRack(){

if(
scannerRack &&
escaneandoRack
){

scannerRack.stop()
.catch(()=>{});

escaneandoRack=false;

}

}


/* ========================================= */
/* BOTONES VOLVER */
/* ========================================= */

document
.getElementById("cancelarMetodo")
.onclick=function(){

mostrar(
document.getElementById("crear")
);

};


document
.getElementById("cancelarEscaneo")
.onclick=function(){

detenerScannerPieza();

mostrar(
document.getElementById("crear")
);

};


document
.getElementById("cancelarManual")
.onclick=function(){

mostrar(
document.getElementById("crear")
);

};


document
.getElementById("cancelarConsultaPieza")
.onclick=function(){

detenerScannerConsultaPieza();

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("cancelarConsulta")
.onclick=function(){

detenerScannerPallet();

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("cancelarSeleccion")
.onclick=function(){

mostrar(
document.getElementById("consultar")
);

};


document
.getElementById("cancelarSegregacion")
.onclick=function(){

mostrar(
document.getElementById("consultar")
);

};


document
.getElementById("cancelarEditar")
.onclick=function(){

mostrar(
document.getElementById("consultar")
);

};


document
.getElementById("volverMenu")
.onclick=function(){

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("nuevoQR")
.onclick=function(){

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("volverQR")
.onclick=function(){

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("cancelarRack")
.onclick=function(){

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("cancelarAgregarPalletRack")
.onclick=function(){

detenerScannerPalletRack();

mostrar(
document.getElementById("crearRack")
);

};


document
.getElementById("nuevoRackQR")
.onclick=function(){

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("volverRackQR")
.onclick=function(){

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("cancelarConsultaRack")
.onclick=function(){

detenerScannerRack();

mostrar(
document.getElementById("menu")
);

};


document
.getElementById("cancelarSeleccionPallet")
.onclick=function(){

mostrar(
document.getElementById(
"consultarRackPantalla"
)
);

};


/* ========================================= */
/* INICIO */
/* ========================================= */

mostrar(
document.getElementById("menu")
);
/* =========================================================
   NANO QR V1.1 — HISTORIAL LOCAL + REPORTES
   Sin base de datos
   ========================================================= */

(function(){
"use strict";

const NANO_STORAGE={
    pallets:"NANO_QR_PALLETS_V1",
    racks:"NANO_QR_RACKS_V1"
};

function nanoStorageRead(key){
    try{
        const raw=localStorage.getItem(key);
        const data=raw?JSON.parse(raw):[];
        return Array.isArray(data)?data:[];
    }catch(e){
        console.error("NANO QR almacenamiento:",e);
        return [];
    }
}

function nanoStorageWrite(key,data){
    localStorage.setItem(key,JSON.stringify(data));
}

function nanoGuardarPalletLocal(id,piezas){
    if(!id || !Array.isArray(piezas) || piezas.length===0)return;

    const items=
        nanoStorageRead(
            NANO_STORAGE.pallets
        );

    const registro={
        id:String(id),
        piezas:JSON.parse(
            JSON.stringify(piezas)
        ),
        fecha:new Date().toISOString()
    };

    const i=
        items.findIndex(
            x=>x.id===registro.id
        );

    if(i>=0){
        items[i]=registro;
    }else{
        items.unshift(registro);
    }

    nanoStorageWrite(
        NANO_STORAGE.pallets,
        items
    );
}

function nanoGuardarRackLocal(id,pallets){
    if(!id || !Array.isArray(pallets) || pallets.length===0)return;

    const items=
        nanoStorageRead(
            NANO_STORAGE.racks
        );

    const registro={
        id:String(id),
        pallets:JSON.parse(
            JSON.stringify(pallets)
        ),
        fecha:new Date().toISOString()
    };

    const i=
        items.findIndex(
            x=>x.id===registro.id
        );

    if(i>=0){
        items[i]=registro;
    }else{
        items.unshift(registro);
    }

    nanoStorageWrite(
        NANO_STORAGE.racks,
        items
    );
}

function nanoFecha(iso){
    try{
        return new Date(
            iso
        ).toLocaleString(
            "es-MX"
        );
    }catch(e){
        return "";
    }
}

function nanoCrearReportePallet(
    id,
    piezas,
    fecha
){
    piezas=
        Array.isArray(piezas)
            ? piezas
            : [];

    const c27=
        piezas.filter(
            p=>p.modelo==="2.7"
        ).length;

    const c30=
        piezas.filter(
            p=>p.modelo==="3.0"
        ).length;

    let r=
        "NANO QR — REPORTE DE TRAZABILIDAD\n\n";

    r+=
        `PALLET: ${
            id ||
            "SIN IDENTIFICADOR"
        }\n`;

    r+=
        `FECHA: ${
            fecha ||
            new Date().toLocaleString("es-MX")
        }\n\n`;

    r+="RESUMEN\n";

    r+="----------------------------\n";

    r+=
        `Total de piezas: ${
            piezas.length
        } / 18\n`;

    r+=
        `Modelo 2.7: ${
            c27
        }\n`;

    r+=
        `Modelo 3.0: ${
            c30
        }\n\n`;

    r+="DETALLE DE PIEZAS\n";

    r+="----------------------------\n\n";

    piezas.forEach(
        (p,i)=>{

            r+=
                `${
                    String(i+1)
                    .padStart(2,"0")
                } | ${
                    p.serie ||
                    "SIN SERIE"
                }\n`;

            r+=
                `    Modelo: ${
                    p.modelo ||
                    "NO IDENTIFICADO"
                }\n`;

            r+=
                `    Código: ${
                    p.codigo ||
                    "NO IDENTIFICADO"
                }\n`;

            r+=
                `    Nota: ${
                    p.nota ||
                    "Sin nota"
                }\n\n`;
        }
    );

    r+="----------------------------\n";

    r+="Generado por NANO QR";

    return r;
}

function nanoCrearReporteRack(
    id,
    pallets,
    fecha
){
    pallets=
        Array.isArray(pallets)
            ? pallets
            : [];

    let total=0;
    let c27=0;
    let c30=0;

    let r=
        "NANO QR — REPORTE DE RACK\n\n";

    r+=
        `RACK: ${
            id ||
            "SIN IDENTIFICADOR"
        }\n`;

    r+=
        `FECHA: ${
            fecha ||
            new Date().toLocaleString("es-MX")
        }\n\n`;

    pallets.forEach(
        p=>{

            const piezas=
                Array.isArray(
                    p.piezas
                )
                    ? p.piezas
                    : [];

            total+=
                piezas.length;

            c27+=
                piezas.filter(
                    x=>x.modelo==="2.7"
                ).length;

            c30+=
                piezas.filter(
                    x=>x.modelo==="3.0"
                ).length;
        }
    );

    r+="RESUMEN\n";

    r+="----------------------------\n";

    r+=
        `Pallets: ${
            pallets.length
        }\n`;

    r+=
        `Piezas: ${
            total
        }\n`;

    r+=
        `Modelo 2.7: ${
            c27
        }\n`;

    r+=
        `Modelo 3.0: ${
            c30
        }\n\n`;

    r+="PALLETS\n";

    r+="----------------------------\n\n";

    pallets.forEach(
        (p,i)=>{

            const piezas=
                Array.isArray(
                    p.piezas
                )
                    ? p.piezas
                    : [];

            r+=
                `${
                    String(i+1)
                    .padStart(2,"0")
                } | ${
                    p.pallet ||
                    "SIN IDENTIFICADOR"
                }\n`;

            r+=
                `    Piezas: ${
                    piezas.length
                }\n`;

            r+=
                `    2.7: ${
                    piezas.filter(
                        x=>x.modelo==="2.7"
                    ).length
                }\n`;

            r+=
                `    3.0: ${
                    piezas.filter(
                        x=>x.modelo==="3.0"
                    ).length
                }\n\n`;
        }
    );

    r+="----------------------------\n";

    r+="Generado por NANO QR";

    return r;
}

async function nanoCopiar(texto){
    try{

        await navigator.clipboard.writeText(
            texto
        );

        alert(
            "✅ Reporte copiado. Ya puedes pegarlo en WhatsApp, correo, Teams o Word."
        );

    }catch(e){

        const ta=
            document.createElement(
                "textarea"
            );

        ta.value=
            texto;

        ta.style.position=
            "fixed";

        ta.style.left=
            "-9999px";

        document.body.appendChild(
            ta
        );

        ta.select();

        try{
            document.execCommand(
                "copy"
            );
        }catch(_){}

        ta.remove();

        alert(
            "✅ Reporte copiado."
        );
    }
}

function nanoCompartir(texto){

    if(
        navigator.share
    ){

        navigator.share({
            title:
                "Reporte NANO QR",
            text:
                texto
        })
        .catch(()=>{});

    }else{

        nanoCopiar(
            texto
        );

    }
}

function nanoPiezaActualSnapshot(){

    return JSON.parse(
        JSON.stringify(
            Array.isArray(
                palletActual
            )
                ? palletActual
                : []
        )
    );

}

function nanoCrearPantallaHistorial(){

    if(
        document.getElementById(
            "historial"
        )
    ){
        return;
    }

    const app=
        document.querySelector(
            ".app"
        );

    const div=
        document.createElement(
            "div"
        );

    div.id=
        "historial";

    div.className=
        "oculto";

    div.innerHTML=`

        <h2>📚 HISTORIAL LOCAL</h2>

        <p class="ayuda">
            Información guardada en este dispositivo.
        </p>

        <input
            id="buscarHistorial"
            placeholder="Buscar pallet o rack..."
        >

        <div id="listaHistorial"></div>

        <button
            id="limpiarHistorial"
            class="peligro"
        >
            🗑️ BORRAR HISTORIAL
        </button>

        <button
            id="cancelarHistorial"
            class="secundario"
        >
            ← MENÚ
        </button>

    `;

    app.appendChild(
        div
    );
}

function nanoCrearPantallaReporte(){

    if(
        document.getElementById(
            "reporteNano"
        )
    ){
        return;
    }

    const app=
        document.querySelector(
            ".app"
        );

    const div=
        document.createElement(
            "div"
        );

    div.id=
        "reporteNano";

    div.className=
        "oculto";

    div.innerHTML=`

        <h2>📋 REPORTE</h2>

        <p class="ayuda">
            Listo para copiar o compartir.
        </p>

        <textarea
            id="textoReporteNano"
            readonly
            style="
                width:100%;
                min-height:420px;
                padding:15px;
                border:1px solid #ccc;
                border-radius:10px;
                font-family:Arial,sans-serif;
                font-size:14px;
                line-height:1.45;
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
            id="volverReporteNano"
            class="secundario"
        >
            ← VOLVER
        </button>

    `;

    app.appendChild(
        div
    );

    div
        .querySelector(
            "#copiarReporteNano"
        )
        .onclick=
        ()=>{
            nanoCopiar(
                div
                    .querySelector(
                        "#textoReporteNano"
                    )
                    .value
            );
        };

    div
        .querySelector(
            "#compartirReporteNano"
        )
        .onclick=
        ()=>{
            nanoCompartir(
                div
                    .querySelector(
                        "#textoReporteNano"
                    )
                    .value
            );
        };

    div
        .querySelector(
            "#volverReporteNano"
        )
        .onclick=
        ()=>{
            mostrar(
                document.getElementById(
                    "menu"
                )
            );
        };

}

function nanoMostrarReportePallet(
    id,
    piezas
){

    nanoCrearPantallaReporte();

    const texto=
        nanoCrearReportePallet(
            id,
            piezas,
            new Date().toLocaleString(
                "es-MX"
            )
        );

    document.getElementById(
        "textoReporteNano"
    ).value=
        texto;

    mostrar(
        document.getElementById(
            "reporteNano"
        )
    );

    try{

        localStorage.setItem(
            "NANO_QR_ULTIMO_REPORTE",
            JSON.stringify({

                tipo:
                    "pallet",

                id:
                    id,

                texto:
                    texto,

                fecha:
                    new Date().toISOString()

            })
        );

    }catch(e){}

}

function nanoMostrarReporteRack(
    id,
    pallets
){

    nanoCrearPantallaReporte();

    const texto=
        nanoCrearReporteRack(
            id,
            pallets,
            new Date().toLocaleString(
                "es-MX"
            )
        );

    document.getElementById(
        "textoReporteNano"
    ).value=
        texto;

    mostrar(
        document.getElementById(
            "reporteNano"
        )
    );

}

function nanoRenderHistorial(
    filtro=""
){

    nanoCrearPantallaHistorial();

    const lista=
        document.getElementById(
            "listaHistorial"
        );

    lista.innerHTML=
        "";

    const q=
        filtro.toLowerCase();

    const pallets=
        nanoStorageRead(
            NANO_STORAGE.pallets
        )
        .filter(
            x =>
                x.id
                    .toLowerCase()
                    .includes(q)
        );

    const racks=
        nanoStorageRead(
            NANO_STORAGE.racks
        )
        .filter(
            x =>
                x.id
                    .toLowerCase()
                    .includes(q)
        );


    if(
        !pallets.length &&
        !racks.length
    ){

        lista.innerHTML=
            "<p style='color:#777'>No hay registros guardados.</p>";

        return;
    }


    if(
        pallets.length
    ){

        const h=
            document.createElement(
                "h3"
            );

        h.textContent=
            "📦 PALLETS";

        lista.appendChild(
            h
        );


        pallets.forEach(
            reg=>{

                const box=
                    document.createElement(
                        "div"
                    );

                box.className=
                    "pieza";

                box.innerHTML=`

                    <strong>
                        ${reg.id}
                    </strong>

                    <span>
                        ${reg.piezas.length}
                        piezas
                    </span>

                    <span>
                        ${nanoFecha(reg.fecha)}
                    </span>

                `;


                const abrir=
                    document.createElement(
                        "button"
                    );

                abrir.textContent=
                    "📋 ABRIR REPORTE";

                abrir.onclick=
                    ()=>{
                        nanoMostrarReportePallet(
                            reg.id,
                            reg.piezas
                        );
                    };


                const eliminar=
                    document.createElement(
                        "button"
                    );

                eliminar.className=
                    "peligro";

                eliminar.textContent=
                    "🗑️ ELIMINAR";

                eliminar.onclick=
                    ()=>{

                        if(
                            !confirm(
                                "¿Eliminar el pallet " +
                                reg.id +
                                " del historial?"
                            )
                        ){
                            return;
                        }

                        const nuevos=
                            nanoStorageRead(
                                NANO_STORAGE.pallets
                            )
                            .filter(
                                x =>
                                    x.id !==
                                    reg.id
                            );

                        nanoStorageWrite(
                            NANO_STORAGE.pallets,
                            nuevos
                        );

                        nanoRenderHistorial(
                            document.getElementById(
                                "buscarHistorial"
                            ).value
                        );

                    };


                box.appendChild(
                    abrir
                );

                box.appendChild(
                    eliminar
                );

                lista.appendChild(
                    box
                );

            }
        );

    }


    if(
        racks.length
    ){

        const h=
            document.createElement(
                "h3"
            );

        h.textContent=
            "🗄️ RACKS";

        lista.appendChild(
            h
        );


        racks.forEach(
            reg=>{

                const box=
                    document.createElement(
                        "div"
                    );

                box.className=
                    "pieza";

                box.innerHTML=`

                    <strong>
                        ${reg.id}
                    </strong>

                    <span>
                        ${reg.pallets.length}
                        pallets
                    </span>

                    <span>
                        ${nanoFecha(reg.fecha)}
                    </span>

                `;


                const abrir=
                    document.createElement(
                        "button"
                    );

                abrir.textContent=
                    "📋 ABRIR REPORTE";

                abrir.onclick=
                    ()=>{
                        nanoMostrarReporteRack(
                            reg.id,
                            reg.pallets
                        );
                    };


                const eliminar=
                    document.createElement(
                        "button"
                    );

                eliminar.className=
                    "peligro";

                eliminar.textContent=
                    "🗑️ ELIMINAR";

                eliminar.onclick=
                    ()=>{

                        if(
                            !confirm(
                                "¿Eliminar el rack " +
                                reg.id +
                                " del historial?"
                            )
                        ){
                            return;
                        }

                        const nuevos=
                            nanoStorageRead(
                                NANO_STORAGE.racks
                            )
                            .filter(
                                x =>
                                    x.id !==
                                    reg.id
                            );

                        nanoStorageWrite(
                            NANO_STORAGE.racks,
                            nuevos
                        );

                        nanoRenderHistorial(
                            document.getElementById(
                                "buscarHistorial"
                            ).value
                        );

                    };


                box.appendChild(
                    abrir
                );

                box.appendChild(
                    eliminar
                );

                lista.appendChild(
                    box
                );

            }
        );

    }

}

function nanoHookHistorial(){

    const boton=
        document.getElementById(
            "abrirHistorial"
        );

    if(
        boton &&
        !boton.dataset.nanoHook
    ){

        boton.dataset.nanoHook=
            "1";

        boton.onclick=
            ()=>{
                nanoRenderHistorial();

                mostrar(
                    document.getElementById(
                        "historial"
                    )
                );
            };

    }


    const cancelar=
        document.getElementById(
            "cancelarHistorial"
        );

    if(
        cancelar &&
        !cancelar.dataset.nanoHook
    ){

        cancelar.dataset.nanoHook=
            "1";

        cancelar.onclick=
            ()=>{
                mostrar(
                    document.getElementById(
                        "menu"
                    )
                );
            };

    }


    const buscar=
        document.getElementById(
            "buscarHistorial"
        );

    if(
        buscar &&
        !buscar.dataset.nanoHook
    ){

        buscar.dataset.nanoHook=
            "1";

        buscar.addEventListener(
            "input",
            ()=>{
                nanoRenderHistorial(
                    buscar.value
                );
            }
        );

    }


    const limpiar=
        document.getElementById(
            "limpiarHistorial"
        );

    if(
        limpiar &&
        !limpiar.dataset.nanoHook
    ){

        limpiar.dataset.nanoHook=
            "1";

        limpiar.onclick=
            ()=>{

                if(
                    !confirm(
                        "¿Borrar todo el historial guardado en este dispositivo?"
                    )
                ){
                    return;
                }

                localStorage.removeItem(
                    NANO_STORAGE.pallets
                );

                localStorage.removeItem(
                    NANO_STORAGE.racks
                );

                nanoRenderHistorial();

            };

    }

}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

window.addEventListener(
    "load",
    function(){

        setTimeout(
            function(){

                nanoHookHistorial();

                const finalizar=
                    document.getElementById(
                        "finalizarPallet"
                    );

                if(
                    finalizar &&
                    !finalizar.dataset.nanoV11
                ){

                    finalizar.dataset.nanoV11=
                        "1";

                    finalizar.addEventListener(
                        "click",
                        function(){

                            setTimeout(
                                function(){

                                    try{

                                        const id=
                                            document
                                                .getElementById(
                                                    "palletNumero"
                                                )
                                                ?.value
                                                .trim();

                                        const piezas=
                                            nanoPiezaActualSnapshot();

                                        nanoGuardarPalletLocal(
                                            id,
                                            piezas
                                        );

                                        nanoMostrarReportePallet(
                                            id,
                                            piezas
                                        );

                                    }catch(error){

                                        console.error(
                                            "NANO QR V1.1:",
                                            error
                                        );

                                    }

                                },
                                150
                            );

                        }
                    );

                }


                const finalizarRack=
                    document.getElementById(
                        "finalizarRack"
                    );

                if(
                    finalizarRack &&
                    !finalizarRack.dataset.nanoV11
                ){

                    finalizarRack.dataset.nanoV11=
                        "1";

                    finalizarRack.addEventListener(
                        "click",
                        function(){

                            setTimeout(
                                function(){

                                    try{

                                        const id=
                                            document
                                                .getElementById(
                                                    "rackNumero"
                                                )
                                                ?.value
                                                .trim();

                                        const pallets=
                                            JSON.parse(
                                                JSON.stringify(
                                                    Array.isArray(
                                                        rackActual
                                                    )
                                                        ? rackActual
                                                        : []
                                                )
                                            );

                                        nanoGuardarRackLocal(
                                            id,
                                            pallets
                                        );

                                    }catch(error){

                                        console.error(
                                            "NANO QR V1.1 rack:",
                                            error
                                        );

                                    }

                                },
                                150
                            );

                        }
                    );

                }

            },
            500
        );

    }
);


})();
/* =========================================================
   NANO QR V1.1
   HISTORIAL LOCAL + REPORTES
   ========================================================= */

(function(){

"use strict";


const NANO_PALLET_KEY =
    "NANO_QR_PALLETS_V11";

const NANO_RACK_KEY =
    "NANO_QR_RACKS_V11";


/* =====================================================
   UTILIDADES
   ===================================================== */

function nanoLeer(
    clave
){

    try{

        const datos =
            localStorage.getItem(
                clave
            );

        if(!datos){

            return [];

        }

        const resultado =
            JSON.parse(
                datos
            );

        return Array.isArray(
            resultado
        )
            ? resultado
            : [];

    }

    catch(error){

        console.error(
            "NANO QR:",
            error
        );

        return [];

    }

}


function nanoGuardar(
    clave,
    datos
){

    localStorage.setItem(

        clave,

        JSON.stringify(
            datos
        )

    );

}


function nanoFecha(){

    return new Date()
        .toLocaleString(
            "es-MX"
        );

}


/* =====================================================
   GUARDAR PALLET
   ===================================================== */

function nanoGuardarPallet(){

    const id =
        document
            .getElementById(
                "palletNumero"
            )
            ?.value
            .trim();


    const piezas =
        Array.isArray(
            palletActual
        )
            ? JSON.parse(
                JSON.stringify(
                    palletActual
                )
            )
            : [];


    if(
        !id ||
        piezas.length === 0
    ){

        return;

    }


    const pallets =
        nanoLeer(
            NANO_PALLET_KEY
        );


    const registro = {

        id:
            id,

        piezas:
            piezas,

        fecha:
            nanoFecha()

    };


    const posicion =
        pallets.findIndex(
            function(p){

                return p.id === id;

            }
        );


    if(
        posicion >= 0
    ){

        pallets[
            posicion
        ] =
            registro;

    }

    else{

        pallets.unshift(
            registro
        );

    }


    nanoGuardar(

        NANO_PALLET_KEY,

        pallets

    );

}


/* =====================================================
   GUARDAR RACK
   ===================================================== */

function nanoGuardarRack(){

    const id =
        document
            .getElementById(
                "rackNumero"
            )
            ?.value
            .trim();


    const pallets =
        Array.isArray(
            rackActual
        )
            ? JSON.parse(
                JSON.stringify(
                    rackActual
                )
            )
            : [];


    if(
        !id ||
        pallets.length === 0
    ){

        return;

    }


    const racks =
        nanoLeer(
            NANO_RACK_KEY
        );


    const registro = {

        id:
            id,

        pallets:
            pallets,

        fecha:
            nanoFecha()

    };


    const posicion =
        racks.findIndex(
            function(r){

                return r.id === id;

            }
        );


    if(
        posicion >= 0
    ){

        racks[
            posicion
        ] =
            registro;

    }

    else{

        racks.unshift(
            registro
        );

    }


    nanoGuardar(

        NANO_RACK_KEY,

        racks

    );

}


/* =====================================================
   REPORTE PALLET
   ===================================================== */

function nanoReportePallet(

    id,

    piezas,

    fecha

){

    piezas =
        Array.isArray(
            piezas
        )
            ? piezas
            : [];


    const modelo27 =
        piezas.filter(
            function(p){

                return p.modelo === "2.7";

            }
        ).length;


    const modelo30 =
        piezas.filter(
            function(p){

                return p.modelo === "3.0";

            }
        ).length;


    let texto =

        "NANO QR — REPORTE DE TRAZABILIDAD\n\n";


    texto +=

        "PALLET: " +
        (
            id ||
            "SIN IDENTIFICADOR"
        ) +
        "\n";


    texto +=

        "FECHA: " +
        (
            fecha ||
            nanoFecha()
        ) +
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
        modelo27 +
        "\n";


    texto +=

        "Modelo 3.0: " +
        modelo30 +
        "\n\n";


    texto +=

        "DETALLE DE PIEZAS\n";


    texto +=

        "----------------------------\n\n";


    piezas.forEach(

        function(

            pieza,

            indice

        ){

            texto +=

                String(
                    indice + 1
                ).padStart(
                    2,
                    "0"
                ) +

                " | " +

                (
                    pieza.serie ||
                    "SIN SERIE"
                ) +

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


/* =====================================================
   REPORTE RACK
   ===================================================== */

function nanoReporteRack(

    id,

    pallets,

    fecha

){

    pallets =
        Array.isArray(
            pallets
        )
            ? pallets
            : [];


    let total =
        0;

    let total27 =
        0;

    let total30 =
        0;


    pallets.forEach(

        function(
            pallet
        ){

            const piezas =
                Array.isArray(
                    pallet.piezas
                )
                    ? pallet.piezas
                    : [];


            total +=
                piezas.length;


            total27 +=
                piezas.filter(
                    function(p){

                        return p.modelo === "2.7";

                    }
                ).length;


            total30 +=
                piezas.filter(
                    function(p){

                        return p.modelo === "3.0";

                    }
                ).length;

        }

    );


    let texto =

        "NANO QR — REPORTE DE RACK\n\n";


    texto +=

        "RACK: " +
        (
            id ||
            "SIN IDENTIFICADOR"
        ) +
        "\n";


    texto +=

        "FECHA: " +
        (
            fecha ||
            nanoFecha()
        ) +
        "\n\n";


    texto +=

        "RESUMEN\n";


    texto +=

        "----------------------------\n";


    texto +=

        "Pallets: " +
        pallets.length +
        "\n";


    texto +=

        "Piezas: " +
        total +
        "\n";


    texto +=

        "Modelo 2.7: " +
        total27 +
        "\n";


    texto +=

        "Modelo 3.0: " +
        total30 +
        "\n\n";


    texto +=

        "PALLETS\n";


    texto +=

        "----------------------------\n\n";


    pallets.forEach(

        function(

            pallet,

            indice

        ){

            const piezas =
                Array.isArray(
                    pallet.piezas
                )
                    ? pallet.piezas
                    : [];


            texto +=

                String(
                    indice + 1
                ).padStart(
                    2,
                    "0"
                ) +

                " | " +

                (
                    pallet.pallet ||
                    "SIN IDENTIFICADOR"
                ) +

                "\n";


            texto +=

                "    Piezas: " +
                piezas.length +
                "\n";


            texto +=

                "    2.7: " +
                piezas.filter(
                    p => p.modelo === "2.7"
                ).length +
                "\n";


            texto +=

                "    3.0: " +
                piezas.filter(
                    p => p.modelo === "3.0"
                ).length +
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
   PANTALLA REPORTE
   ===================================================== */

function nanoCrearPantallaReporte(){

    if(
        document.getElementById(
            "reporteNano"
        )
    ){

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
        "reporteNano";


    pantalla.className =
        "oculto";


    pantalla.innerHTML = `

        <h2>📋 REPORTE</h2>

        <p class="ayuda">
            Información lista para copiar o compartir.
        </p>

        <textarea
            id="textoReporteNano"
            readonly
        ></textarea>

        <button id="copiarReporteNano">
            📋 COPIAR REPORTE
        </button>

        <button id="compartirReporteNano">
            📤 COMPARTIR REPORTE
        </button>

        <button
            id="volverReporteNano"
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
            "copiarReporteNano"
        )
        .onclick =
        async function(){

            const texto =
                document
                    .getElementById(
                        "textoReporteNano"
                    )
                    .value;


            try{

                await navigator
                    .clipboard
                    .writeText(
                        texto
                    );

                alert(
                    "✅ Reporte copiado."
                );

            }

            catch(error){

                const area =
                    document
                        .getElementById(
                            "textoReporteNano"
                        );

                area.select();

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
            "compartirReporteNano"
        )
        .onclick =
        async function(){

            const texto =
                document
                    .getElementById(
                        "textoReporteNano"
                    )
                    .value;


            if(
                navigator.share
            ){

                try{

                    await navigator.share({

                        title:
                            "Reporte NANO QR",

                        text:
                            texto

                    });

                }

                catch(error){}

            }

            else{

                await navigator
                    .clipboard
                    .writeText(
                        texto
                    );

                alert(
                    "✅ Reporte copiado."
                );

            }

        };


    document
        .getElementById(
            "volverReporteNano"
        )
        .onclick =
        function(){

            mostrar(
                document.getElementById(
                    "menu"
                )
            );

        };

}


/* =====================================================
   MOSTRAR REPORTE
   ===================================================== */

function nanoMostrarReportePallet(

    id,

    piezas,

    fecha

){

    nanoCrearPantallaReporte();


    document
        .getElementById(
            "textoReporteNano"
        )
        .value =

        nanoReportePallet(
            id,
            piezas,
            fecha
        );


    mostrar(
        document.getElementById(
            "reporteNano"
        )
    );

}


/* =====================================================
   HISTORIAL
   ===================================================== */

function nanoCrearHistorial(){

    if(
        document.getElementById(
            "historial"
        )
    ){

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
        "historial";


    pantalla.className =
        "oculto";


    pantalla.innerHTML = `

        <h2>📚 HISTORIAL LOCAL</h2>

        <p class="ayuda">
            Registros guardados en este dispositivo.
        </p>

        <input
            id="buscarHistorial"
            placeholder="Buscar pallet o rack..."
        >

        <div id="listaHistorial"></div>

        <button
            id="limpiarHistorial"
            class="peligro"
        >
            🗑️ BORRAR HISTORIAL
        </button>

        <button
            id="cancelarHistorial"
            class="secundario"
        >
            ← MENÚ
        </button>

    `;


    app.appendChild(
        pantalla
    );


    document
        .getElementById(
            "buscarHistorial"
        )
        .addEventListener(
            "input",
            function(){

                nanoRenderHistorial(
                    this.value
                );

            }
        );


    document
        .getElementById(
            "limpiarHistorial"
        )
        .onclick =
        function(){

            if(
                !confirm(
                    "¿Borrar todo el historial de este dispositivo?"
                )
            ){

                return;

            }


            localStorage.removeItem(
                NANO_PALLET_KEY
            );


            localStorage.removeItem(
                NANO_RACK_KEY
            );


            nanoRenderHistorial();

        };


    document
        .getElementById(
            "cancelarHistorial"
        )
        .onclick =
        function(){

            mostrar(
                document.getElementById(
                    "menu"
                )
            );

        };

}


function nanoRenderHistorial(
    filtro
){

    nanoCrearHistorial();


    const lista =
        document.getElementById(
            "listaHistorial"
        );


    lista.innerHTML =
        "";


    const busqueda =
        String(
            filtro || ""
        )
        .toLowerCase()
        .trim();


    const pallets =
        nanoLeer(
            NANO_PALLET_KEY
        )
        .filter(
            function(registro){

                return registro.id
                    .toLowerCase()
                    .includes(
                        busqueda
                    );

            }
        );


    const racks =
        nanoLeer(
            NANO_RACK_KEY
        )
        .filter(
            function(registro){

                return registro.id
                    .toLowerCase()
                    .includes(
                        busqueda
                    );

            }
        );


    if(
        pallets.length === 0 &&
        racks.length === 0
    ){

        lista.innerHTML =
            "<p style='color:#777'>No hay registros guardados.</p>";

        return;

    }


    if(
        pallets.length
    ){

        const titulo =
            document.createElement(
                "h3"
            );


        titulo.textContent =
            "📦 PALLETS";


        lista.appendChild(
            titulo
        );


        pallets.forEach(
            function(
                registro
            ){

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
                    "📋 ABRIR REPORTE";


                ver.onclick =
                    function(){

                        nanoMostrarReportePallet(

                            registro.id,

                            registro.piezas,

                            registro.fecha

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
                    function(){

                        if(
                            !confirm(
                                "¿Eliminar " +
                                registro.id +
                                "?"
                            )
                        ){

                            return;

                        }


                        const restantes =
                            nanoLeer(
                                NANO_PALLET_KEY
                            )
                            .filter(
                                function(x){

                                    return x.id !==
                                        registro.id;

                                }
                            );


                        nanoGuardar(

                            NANO_PALLET_KEY,

                            restantes

                        );


                        nanoRenderHistorial(
                            document
                                .getElementById(
                                    "buscarHistorial"
                                )
                                .value
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

    }


    if(
        racks.length
    ){

        const titulo =
            document.createElement(
                "h3"
            );


        titulo.textContent =
            "🗄️ RACKS";


        lista.appendChild(
            titulo
        );


        racks.forEach(
            function(
                registro
            ){

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
                        ${registro.pallets.length}
                        pallets
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
                    "📋 ABRIR REPORTE";


                ver.onclick =
                    function(){

                        nanoCrearPantallaReporte();


                        document
                            .getElementById(
                                "textoReporteNano"
                            )
                            .value =

                            nanoReporteRack(

                                registro.id,

                                registro.pallets,

                                registro.fecha

                            );


                        mostrar(
                            document.getElementById(
                                "reporteNano"
                            )
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
                    function(){

                        if(
                            !confirm(
                                "¿Eliminar " +
                                registro.id +
                                "?"
                            )
                        ){

                            return;

                        }


                        const restantes =
                            nanoLeer(
                                NANO_RACK_KEY
                            )
                            .filter(
                                function(x){

                                    return x.id !==
                                        registro.id;

                                }
                            );


                        nanoGuardar(

                            NANO_RACK_KEY,

                            restantes

                        );


                        nanoRenderHistorial(
                            document
                                .getElementById(
                                    "buscarHistorial"
                                )
                                .value
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

    }

}


/* =====================================================
   BOTÓN HISTORIAL
   ===================================================== */

function nanoInstalarBotonHistorial(){

    if(
        document.getElementById(
            "abrirHistorial"
        )
    ){

        return;

    }


    const menu =
        document.getElementById(
            "menu"
        );


    if(!menu){

        return;

    }


    const boton =
        document.createElement(
            "button"
        );


    boton.id =
        "abrirHistorial";


    boton.textContent =
        "📚 HISTORIAL LOCAL";


    boton.onclick =
        function(){

            nanoCrearHistorial();

            nanoRenderHistorial();

            mostrar(
                document.getElementById(
                    "historial"
                )
            );

        };


    menu.appendChild(
        boton
    );

}


/* =====================================================
   GUARDAR DESPUÉS DE FINALIZAR PALLET
   ===================================================== */

function nanoConectarFinalizar(){

    const boton =
        document.getElementById(
            "finalizarPallet"
        );


    if(
        !boton ||
        boton.dataset.nanoV11
    ){

        return;

    }


    boton.dataset.nanoV11 =
        "1";


    boton.addEventListener(

        "click",

        function(){

            setTimeout(

                function(){

                    nanoGuardarPallet();

                },

                100

            );

        },

        false

    );

}


/* =====================================================
   GUARDAR DESPUÉS DE FINALIZAR RACK
   ===================================================== */

function nanoConectarFinalizarRack(){

    const boton =
        document.getElementById(
            "finalizarRack"
        );


    if(
        !boton ||
        boton.dataset.nanoV11
    ){

        return;

    }


    boton.dataset.nanoV11 =
        "1";


    boton.addEventListener(

        "click",

        function(){

            setTimeout(

                function(){

                    nanoGuardarRack();

                },

                100

            );

        },

        false

    );

}


/* =====================================================
   INICIO
   ===================================================== */

window.addEventListener(

    "load",

    function(){

        setTimeout(

            function(){

                nanoCrearHistorial();

                nanoCrearPantallaReporte();

                nanoInstalarBotonHistorial();

                nanoConectarFinalizar();

                nanoConectarFinalizarRack();

            },

            300

        );

    }

);


console.log(
    "✅ NANO QR V1.1: historial local activado."
);

})();
/* =========================================================
   NANO QR — REPARAR BOTONES DEL REPORTE
   ========================================================= */

(function () {

    function obtenerTextoReporte() {

        const campo =
            document.getElementById(
                "textoReporteNano"
            );

        if (!campo) {
            return "";
        }

        return campo.value || campo.textContent || "";

    }


    async function copiarReporte() {

        const texto =
            obtenerTextoReporte();


        if (!texto) {

            alert(
                "No hay ningún reporte para copiar."
            );

            return;

        }


        try {

            await navigator.clipboard.writeText(
                texto
            );

            alert(
                "✅ REPORTE COPIADO\n\nPuedes pegarlo en WhatsApp, correo, Teams o Word."
            );

        }

        catch (error) {

            const area =
                document.getElementById(
                    "textoReporteNano"
                );


            if (area) {

                area.focus();

                area.select();

                document.execCommand(
                    "copy"
                );

                alert(
                    "✅ REPORTE COPIADO"
                );

            }

        }

    }


    async function compartirReporte() {

        const texto =
            obtenerTextoReporte();


        if (!texto) {

            alert(
                "No hay ningún reporte para compartir."
            );

            return;

        }


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

            catch (error) {

                /*
                 * El usuario puede cancelar
                 * la ventana de compartir.
                 */

            }

        }

        else {

            await copiarReporte();

        }

    }


    function volverReporte() {

        /*
         * Regresar siempre al menú principal.
         */

        if (
            typeof mostrar === "function"
        ) {

            mostrar(
                document.getElementById(
                    "menu"
                )
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


            const menu =
                document.getElementById(
                    "menu"
                );

            if (menu) {

                menu.classList.remove(
                    "oculto"
                );

            }

        }

    }


    /*
     * EVENT DELEGATION
     *
     * Funciona aunque los botones se creen
     * dinámicamente después de cargar la página.
     */

    document.addEventListener(
        "click",
        function (evento) {

            const elemento =
                evento.target.closest(
                    "#copiarReporteNano, #compartirReporteNano, #volverReporteNano"
                );


            if (!elemento) {

                return;

            }


            if (
                elemento.id ===
                "copiarReporteNano"
            ) {

                evento.preventDefault();

                copiarReporte();

            }


            else if (
                elemento.id ===
                "compartirReporteNano"
            ) {

                evento.preventDefault();

                compartirReporte();

            }


            else if (
                elemento.id ===
                "volverReporteNano"
            ) {

                evento.preventDefault();

                volverReporte();

            }

        }
    );


    console.log(
        "✅ NANO QR: botones del reporte reparados."
    );

})();
/* =========================================================
   NANO QR - BOTONES DEL REPORTE
   ========================================================= */

document.addEventListener("click", async function (evento) {

    const boton = evento.target.closest("button");

    if (!boton) {
        return;
    }


    /* ================================
       COPIAR REPORTE
       ================================ */

    if (boton.id === "copiarReporteNano") {

        evento.preventDefault();

        const campo =
            document.getElementById(
                "textoReporteNano"
            );

        if (!campo) {

            alert(
                "No se encontró el reporte."
            );

            return;

        }

        const texto =
            campo.value || campo.textContent || "";

        if (!texto.trim()) {

            alert(
                "El reporte está vacío."
            );

            return;

        }


        try {

            await navigator.clipboard.writeText(
                texto
            );

            alert(
                "✅ REPORTE COPIADO\n\nPuedes pegarlo en WhatsApp, correo o Word."
            );

        }

        catch (error) {

            campo.focus();

            campo.select();

            try {

                document.execCommand(
                    "copy"
                );

                alert(
                    "✅ REPORTE COPIADO"
                );

            }

            catch {

                alert(
                    "No se pudo copiar el reporte."
                );

            }

        }

        return;

    }


    /* ================================
       COMPARTIR REPORTE
       ================================ */

    if (boton.id === "compartirReporteNano") {

        evento.preventDefault();

        const campo =
            document.getElementById(
                "textoReporteNano"
            );

        if (!campo) {

            alert(
                "No se encontró el reporte."
            );

            return;

        }

        const texto =
            campo.value || campo.textContent || "";

        if (!texto.trim()) {

            alert(
                "El reporte está vacío."
            );

            return;

        }


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

            catch (error) {

                /*
                 * Si el usuario cancela,
                 * no hacemos nada.
                 */

            }

        }

        else {

            try {

                await navigator.clipboard.writeText(
                    texto
                );

                alert(
                    "✅ El reporte fue copiado porque este dispositivo no permite compartir directamente."
                );

            }

            catch {

                alert(
                    "No se pudo compartir el reporte."
                );

            }

        }

        return;

    }


    /* ================================
       VOLVER
       ================================ */

    if (boton.id === "volverReporteNano") {

        evento.preventDefault();

        document
            .querySelectorAll(
                ".app > div"
            )
            .forEach(
                function (pantalla) {

                    pantalla.classList.add(
                        "oculto"
                    );

                }
            );


        const menu =
            document.getElementById(
                "menu"
            );

        if (menu) {

            menu.classList.remove(
                "oculto"
            );

        }

    }

});
