//Código Javascript del Front-End

import Web3 from "web3"; //importamos la librería web3
import AlquilerPisos from "../../build/contracts/AlquilerPisos.json";

//url de la blockchain local
const url = "http://127.0.0.1:7545";
const dir_contrato = "0xbD02FCc08A28d6550D3BA1F66369CDd756078939";

//Ahora coge la dirección del inquilino desde metamask utomáticamente
//const mi_direccion = "0x820AAC8fDd517471e41223aEf7090A244b415ced"; // Dirección manual

//ponemos let en vez de const porque los valores se van a reasignar
let web3, contrato; //definimos fuera de la función de verificación   
const abi = AlquilerPisos.abi;
console.log("abi del contrato:", abi);
var desplegarLista = true;      //variable para recoger los pisos en la lista 
                                // desplegable solo una vez la primera vez que se conecta
//llamar a una función que conecte nuestra blockchain y compruebe que la conexión sea correcta
// conectarWeb3(url,abi,dir_contrato);
   

//crear variables para los botones
const btConectar = document.getElementById('btn_Conectar');
const btAlquilar =  document.getElementById('btn_Alquilar');
const btDevolver =  document.getElementById('btn_Devolver');
const listado =  document.getElementById('lista');
const monedero = document.getElementById('cuentaMonedero');


//creamos un evento listener de la ventana
window.addEventListener('load', async () => {
    //esperamos a que web3 y el contrato estén listos

    //llamar a una función que conecte nuestra blockchain y compruebe que la conexión sea correcta
await conectarWeb3(url,abi,dir_contrato);

    //Vamos a cargar los datos de la tabla desde la blockchain
    try {
        const tabla = document.getElementById('tablaPisos');
        const numPisos = await contrato.methods.getTotalPisos().call();
        for (let i=1 ; i<= numPisos; i++){
            //vamos añadiendo cada fila de los pisos desde la blockchain
               const nombre = await contrato.methods.consultarNombrePiso(i).call();
               const estado = await contrato.methods.consultarEstadoPiso(i).call();
               const inquilino = await contrato.methods.consultarInquilinoPiso(i).call();

               const fila = `<tr>   
               <td id="NombrePiso${i}"> ${nombre}  </td> 
               <td id='estadoPiso${i}'> ${estado == 0 ? "Disponible" : 'Alquilado'} </td> 
               <td id="inquilino${i}"> ${inquilino === '0x0000000000000000000000000000000000000000' ? ' ' : inquilino}  </td> 
               </tr>` ;
               //usa la coma invertida llamada template literal
               tabla.innerHTML += fila;
               console.log("nombre:",nombre)
               console.log("estado:",estado)
        }

    } catch (error) {
        console.error("Error al cargar los datos en la tabla desde la Blockchain:", error.message);
    }

    
})

//crear un evento listener para darle interactividad al botón conectar
//función que al hacer click en el botón se activa una funcion asincrona
//se crea un evento que está escuchando en nuestra interfaz
btConectar.addEventListener('click', async () => {

    //vamos a conectarnos a metamask comprobando si existe el objeto Ethereum
    if (window.ethereum){

        //para conectar a la cuenta de metamask (nuestra wallet) a la web
        const cuentas = await window.ethereum.request({
            "method": "eth_requestAccounts",
            "params": [],
           }); //en la variable cuentas está el listado de cuentas de metamask

    //al hacer click se leen las siguientes instrucciones:
    //activar elementos eliminando el atributo disabled
    btAlquilar.removeAttribute("disabled");
    btDevolver.removeAttribute("disabled");
    listado.removeAttribute("disabled");
    monedero.textContent = cuentas[0];

        //cuando se pulsa el botón conectar se cargan tambien en la lista los pisos

       if (desplegarLista){//para que solo despliegue la lista una vez, al principio
        desplegarLista = false;
        console.log("DesplegarLista: ", desplegarLista);
        const numPisos = await contrato.methods.getTotalPisos().call();
        for (let i=1;i<=numPisos;i++){
            var opt = document.createElement('option');
            opt.value = i;
            console.log("indice:",opt.value);
            //obtenemos el valor del campo piso de la tabla
            opt.textContent = document.getElementById("NombrePiso"+i).textContent;
            //le asigna el valor a la lista
            listado.appendChild(opt);
        }
       } 
    }
    else{
        alert("Debes instalar el monedero de Metamask en tu navegador");
    }
})

//Método para alquilar un piso
//que el evento se active cuando damos click en el botón

//vamos a deshabilitar los botones mientras se hace una transacción 
//para que no haya varias llamadas a la metamask

let transaccionEnCurso = false;

btAlquilar.addEventListener('click', async () => {

if (transaccionEnCurso){
    alert("Hay una transacción en curso. Tienes que esperar a que se termine");
    return;
}

try {
        //desabilitamos los botones mientras sucede la transacción
        transaccionEnCurso = true;
        btAlquilar.disabled = true;
        btDevolver.diabled = true;
        listado.disabled = true;

    //en una variable almacenamos el valor elegido en la lista desplegable
    const numeroPiso = document.getElementById("lista").value;
    console.log("numeroPiso :", numeroPiso);

    if (numeroPiso != "") { //en la lista empiezan por el valor 1 de numeroPiso
       
        //para conectar la wallet a la web
        const cuentas = await window.ethereum.request({"method": "eth_requestAccounts"});

         //accedemos al estado del piso a través del núm del piso
        
        var celdaEstado = document.getElementById("estadoPiso"+numeroPiso);

        var inquilinoAlquilado = document.getElementById("inquilino"+numeroPiso);
        
        console.log("valor de celdaEstado", celdaEstado.textContent);

         //comprobamos si el piso está disponible
         if (celdaEstado.textContent.trim() === "Disponible") {

             //creamos parámetros para la transacción
             const transactionParameters = {
                from: cuentas[0], // la cuenta del usuario conectado a Metamask (profesoe)
                to: contrato.options.address, // dirección del contrato inteligente
                gas: '21000', //limite del gas
                value: "0x1bc16d674ec80000", //Coste transacción 2 Ether
                data: contrato.methods.alquilarPiso(numeroPiso).encodeABI(), //datos a enviar
                //los datos deben estar codificados en abi
             }
             //enviamos y firmamos nuestra transacción con Metamask
             const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters]
            })

             //actualizamos los campos de la tabla
             celdaEstado.textContent = "Alquilado";
             inquilinoAlquilado.textContent = cuentas[0];
            }
            else{
                alert ("El piso no se puede alquilar en estos momentos");
            }
    }
    else {
        alert("Por favor, seleccione un piso de la lista.")
    }


    }//fin try


    catch(err){

        console.error("Error en la transacción:", err);
        alert("Error al realizar el alquiler del piso. Verifica Metamask.");
    }
    finally{
        transaccionEnCurso = false;
        btAlquilar.disabled = false;
        btDevolver.diabled = false;
        listado.disabled = false;
    }
})

btDevolver.addEventListener('click', async () => {


    if (transaccionEnCurso){
        alert("Hay una transacción en curso. Tienes que esperar a que se termine");
        return;
    }

    try{

         //desabilitamos los botones mientras sucede la transacción
         transaccionEnCurso = true;
         btAlquilar.disabled = true;
         btDevolver.diabled = true;
         listado.disabled = true;

    //en una variable almacenamos el valor elegido en la lista desplegable
    const numeroPiso = document.getElementById("lista").value;
    console.log("numeroPiso :", numeroPiso);

    if (numeroPiso != "") {
        
        //para conectar la wallet a la web
        const cuentas = await window.ethereum.request({"method": "eth_requestAccounts"}); 

         //accedemos al estado del piso a través del núm del piso
        var celdaEstado = document.getElementById("estadoPiso"+numeroPiso);

        var inquilinoAlquilado = document.getElementById("inquilino"+numeroPiso);
        

         //comprobamos si el piso está Alquilado , para poderlo devolver
         if (celdaEstado.textContent.trim() === "Alquilado") {
             

              //creamos parámetros para la transacción
              const transactionParameters = {
                from: cuentas[0], // la cuenta del usuario conectado a Metamask (profesoe)
                to: contrato.options.address, // dirección del contrato inteligente
                gas: '21000', //limite del gas
                value: "0x1bc16d674ec80000",
                data: contrato.methods.devolverPiso(numeroPiso).encodeABI(), //datos a enviar
                //los datos deben estar codificados en abi
             }
             //enviamos y firmamos nuestra transacción con Metamask
             const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters]
            })

             celdaEstado.textContent = "Disponible";
             inquilinoAlquilado.textContent = '0x0000000000000000000000000000000000000000';
            }
            else{
                alert ("El piso no se puede devolver ya que está disponible.");
            }
    }
    else {
        alert("Por favor, seleccione un piso de la lista.")
    }

    } //fin del try
    catch(err){
        console.error("Error en la transacción:", err);
        alert("Error al realizar la devolución del piso. Verifica Metamask.");
    }
    finally{
        transaccionEnCurso = false;
        btAlquilar.disabled = false;
        btDevolver.diabled = false;
        listado.disabled = false;
    }

})

//definición de la función
async function conectarWeb3(url,abi,dir_contrato){

try {
     //creamos instancia de la api web3
    web3 = new Web3(url);
    const conectadaBlockchain = await web3.eth.net.isListening();
    if (!conectadaBlockchain){
       throw new Error("Fallo en la conexión a la blockchain");
   }

    //Creamos una instancia del contrato a partir de web3
   contrato = new web3.eth.Contract(abi,dir_contrato);
   console.log("Contrato cargado:", contrato); // mensaje de control para saber que se cargó bien

} catch (error) {
    //manejador de errores
    console.log ("Error al conectar con web3 o al cargar el contrato: ", error.message);
}

}

