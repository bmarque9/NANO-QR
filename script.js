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
   ACCESO DE SUPABASE A LAS PIEZAS ACTUALES
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
