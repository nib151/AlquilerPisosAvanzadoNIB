const AlquilerPisos = artifacts.require("AlquilerPisos");

contract ("Banco de pruebas para el Smart Contract AlquilerPisos", () => {

    it ("Prueba unitaria para ver el propietario del Smart Contract", async () => {

        const miContrato = await AlquilerPisos.deployed();
        const propietario = await miContrato.owner();

        assert.equal (propietario,"0xda226Dc9f43Be1C88fFEA5450F3cBc5DbC489096", "Esta direccion no es la prppietaria");

    } )
        //2ª prueba unitaria para la función prestar_portatil
    it ("Prueba unitaria para ver si se presta correctamente un piso", async () => {

        const miContrato = await AlquilerPisos.deployed();
        const direccion_alquiler = "0xda226Dc9f43Be1C88fFEA5450F3cBc5DbC489096" 
        await miContrato.alquilarPiso(1);
        const piso = await miContrato.pisos(1);

        assert.equal (piso.alquiladoA,"0xda226Dc9f43Be1C88fFEA5450F3cBc5DbC489096", "Este piso no se encuentra alquilado");

    } )
            //3ª prueba unitaria para la función devolver_piso
    it ("Prueba unitaria para ver si se devuelve correctamente un piso", async () => {

        const miContrato = await AlquilerPisos.deployed();
        const direccion_alquiler = "0xda226Dc9f43Be1C88fFEA5450F3cBc5DbC489096" 
        await miContrato.devolverPiso(1);
        const piso = await miContrato.pisos(1);

        assert.equal (piso.estadoPiso, 0, "Este piso no se encuentra disponible");

    } )
    
})