// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <=0.9.0;

contract AlquilerPisos {

    //Contrato Inteligente para realizar la gestión del alquiler de pisos y su devolución

    //Declaración de las variables del contrato
    address public owner;
    
    uint256 numeroPisos = 9;

    

    enum Estado {Disponible, Alquilado}

    struct Piso{
        string nombrePiso;
        Estado estadoPiso;
        address alquiladoA;
        string direccion;
        int256 nHabitaciones;
        int256 metrosCuadrados;
    }

    mapping (uint256 => Piso) public pisos;

    // Declaración del constructor de nuestro contrato

    constructor () {
        //Almacenamos la dirección de Ethereum del propietario que despliega el contrato en la Blockchain
        owner = msg.sender; 
       
        //Inicializamos algunos pisos y los metemos en la blockchain
        //empiezo por el índice 1 en vez de por el 0
        pisos[1] = Piso("Atico", Estado.Disponible, address(0), "cL Picasso 3, 12B", 2, 75);
        pisos[2] = Piso("Chalet", Estado.Disponible, address(0), "cL Santander 9", 26, 240);
        pisos[3] = Piso("Duplex", Estado.Disponible, address(0), "cL Dos pesas 7, 1B", 4, 100);
        pisos[4] = Piso("Adosado", Estado.Disponible, address(0), "cL Vega 3", 5, 155);
        pisos[5] = Piso("Loft", Estado.Disponible, address(0), "PlzL Mayor 2, 10B", 2, 52);
        pisos[6] = Piso("Bajocubierta", Estado.Disponible, address(0), "cL Salesas 8, 4A", 3, 70);
        pisos[7] = Piso("Apartamento", Estado.Disponible, address(0), unicode"cL Tordoño 2, 4D", 1,45);
        pisos[8] = Piso("Piso lujo", Estado.Disponible, address(0), "cL Pinto 6, 3D", 4, 212);
        pisos[9] = Piso("Casa molinera", Estado.Disponible, address(0), unicode"cL Piélagos 25", 6, 420);
    }

    //Función para alquilar los pisos

    function alquilarPiso(uint256 id) public payable{
        //Vamos a realizar una comprobación de que el piso esté disponible
        require(pisos[id].estadoPiso == Estado.Disponible, unicode"El piso no está disponible para alquilar");
        pisos[id].estadoPiso = Estado.Alquilado;
        pisos[id].alquiladoA = msg.sender; 
    }

    //Función para devolver el piso desalojado

    function devolverPiso(uint256 id) public payable{
        //Vamos a realizar una comprobación de que el piso está alquilado
        require(pisos[id].estadoPiso == Estado.Alquilado, unicode"El piso no está alquilado y se puede solicitar");
        //Indicar que únicamente sea el usuario que ha alquilado el piso , el que lo devuelva
        require(pisos[id].alquiladoA == msg.sender, unicode"Sólo el usuario que alquiló la casa, puede devolverla");

        pisos[id].estadoPiso = Estado.Disponible;
        pisos[id].alquiladoA = address(0); 
    }

    //Función para comprobar el estado del Piso
    function consultarEstadoPiso (uint256 id) public view returns (Estado){
        return pisos[id].estadoPiso;
    }

     //Función para consultar el nombre de la casa
    function consultarNombrePiso(uint256 id) public view returns (string memory){
        return pisos[id].nombrePiso;
    }

     //Función para comprobar la dirección  del monedero del inquilino
    function consultarInquilinoPiso (uint256 id) public view returns (address){
        return pisos[id].alquiladoA;
    }

    //función que nos devuelva el número de todos los pisos
    function getTotalPisos() public view returns (uint256){
        return numeroPisos;
    }

    modifier soloOwner(){
        require(msg.sender == owner, unicode"Sólo el propietario del smart contract puede realizar esta acción de añadir pisos");
        _;
    }

    //Función para añadir pisos 
    function agregarPiso (uint256 id, string memory nomPiso, string memory direcc, int256 nHab, int256 mCuad) public soloOwner {
         // Verificar que el id no está repetido
          require(bytes(pisos[id].nombrePiso).length == 0, unicode"El ID ya está en uso");
        pisos[id] = Piso(nomPiso,Estado.Disponible,address(0),direcc,nHab,mCuad);
    }
}