
async function historico(tablaOrigen, tablaDestino, campoWhere , valorCampoWhere, idPersona, operacion, conexion){
    try {

        if(!tablaOrigen || !tablaDestino || !campoWhere || !valorCampoWhere || !idPersona || !operacion || !conexion){
            throw new Error('Todos los parámetros de la función son obligatorios');
          }


        if (!['INSERT', 'UPDATE', 'DELETE'].includes(operacion.toUpperCase())) {
            throw new Error('Operación no válida. Debe ser INSERT, UPDATE o DELETE.');
          }


        const sql = `
            INSERT INTO ${tablaDestino}
            SELECT ${tablaOrigen}.*, NOW(), ?, ?
            FROM ${tablaOrigen}
            WHERE ${campoWhere} = ?
            `;

        const [result] = await conexion.execute(sql, [idPersona, operacion, valorCampoWhere]);

        let ok;
        if (result.affectedRows > 0) {
            ok = true;
        } else {
            ok = false;
        }

          return ok;
        
        
    } catch (error) {

          throw new Error(error.message);
        
    }
}

module.exports={historico}