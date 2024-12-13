async function insertarLOG(operacion, id, sentencia, valores, tabla, connection) {

    try {

        if (!id || !sentencia || !valores || !tabla || !connection || !operacion) {
            throw new Error('Todos los parámetros de la función son obligatorios');
        }


        if (!['INSERT', 'UPDATE', 'DELETE'].includes(operacion.toUpperCase())) {
            throw new Error('Operación no válida. Debe ser INSERT, UPDATE o DELETE.');
        }

        const [result1] = await connection.execute(
            sentencia,
            valores
        );

        if (result1.affectedRows > 0) {

            // Escapar y formatear los valores
            const valoresFormateados = valores.map((valor) => {
                if (typeof valor === 'string') {
                    return `'${valor.replace(/'/g, "''")}'`; // Escapar comillas simples
                }
                if (valor === null || valor === undefined) {
                    return 'NULL';
                }
                return valor;
            });

            // Reemplazar los placeholders (?) con los valores
            let sentenciaCompleta = sentencia;
            valoresFormateados.forEach((valor) => {
                sentenciaCompleta = sentenciaCompleta.replace('?', valor);
            });

            const [result] = await connection.execute(
                'CALL sp_insertlog(?,?,?)',
                [sentenciaCompleta, tabla, id]
            );

            if (result.affectedRows > 0) {

                return { ...result1, log: true };
            } else {

                return { ...result1, log: false };
            }

        }
        let response = { affectedRows: 0, log: false }
        return response;


    } catch (error) {

        throw new Error(error.message);
    }

}
module.exports = { insertarLOG }
