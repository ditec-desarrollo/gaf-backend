const {
  conectar_BD_Tribunal_De_Faltas_MySql,
  } = require("../config/dbEstadisticasMYSQL");


const obtenerMontos = async (req, res) => {
    let connection;
  try {

    connection = await conectar_BD_Tribunal_De_Faltas_MySql();
    const [montos] = await connection.query(
      "SELECT m.*, tm.estado as estadoTipoMOonto, tm.monto_det FROM monto m LEFT JOIN tipomonto tm ON tm.idTipoMonto = m.idTipoMonto");

    return res
    .status(200)
    .json({ message: "montos:", montos });

  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}; 

const obtenerMonto = async (req, res) => {
  let connection;
try {
  const {id} = req.query
  console.log(id);
  
  connection = await conectar_BD_Tribunal_De_Faltas_MySql();
  const [monto] = await connection.query(
    "SELECT precio FROM monto WHERE idMonto = ?",[id]);

  return res
  .status(200)
  .json({ message: "montos:", monto});

} catch (error) {
  return res
    .status(500)
    .json({ message: error.message || "Algo salió mal :(" });
}finally {
  // Cerrar la conexión a la base de datos
  if (connection) {
    await connection.end();
  }
}
}; 

const obtenerMontosTipo = async (req, res) => {
    let connection;
  try {

    connection = await conectar_BD_Tribunal_De_Faltas_MySql();
    const [tiposDeMontos] = await connection.query(
      "SELECT * FROM tipomonto");

    return res
    .status(200)
    .json({ message: "Tipos de montos:", tiposDeMontos });

  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}; 

const crearMonto = async (req, res) => {

  const connection = await conectar_BD_Tribunal_De_Faltas_MySql();
  const {precio, idTipoMonto} =req.body;
  console.log(req.body)
  try {
      await connection.execute('INSERT INTO monto (idTipoMonto,precio) VALUES (?, ?)', [idTipoMonto, precio]);

      return res
      .status(200)
      .json({ message: "monto ingresado con éxito"});

  } catch (error) {
      console.error('Error al ingresar el monto', error);
      res.status(500).json({ error: 'Error al ingresar el monto' });
  }finally {
      // Cerrar la conexión
      await connection.end();
  }
};

const deshabilitarMonto = async (req, res) => {

  const connection = await conectar_BD_Tribunal_De_Faltas_MySql();
  const { id } =req.body;
  try {
      
      await connection.execute('UPDATE monto SET estado = 0 WHERE idMonto = ?', [id]);

      return res
      .status(200)
      .json({ message: "Monto deshabilitada con éxito"});

  } catch (error) {
      console.error('Error al deshabilitar el monto', error);
      res.status(500).json({ error: 'Error al deshabilitar el monto' });
  }finally {
      // Cerrar la conexión
      await connection.end();
  }
};

const editarMonto = async (req, res) => {
  const connection = await conectar_BD_Tribunal_De_Faltas_MySql();
  const { precio, idTipoMonto, idMonto, estado} = req.body;
console.log(req.body);

  try {
      // Actualiza la institución existente
      const query = `
          UPDATE monto 
          SET idTipoMonto = ?, estado = ?, precio = ?
          WHERE idMonto = ?`;

      const [result] = await connection.execute(query, [idTipoMonto, estado, precio, idMonto]);

      if (result.affectedRows > 0) {
          return res.status(200).json({ message: "Monto actualizado con éxito" });
      } else {
          return res.status(404).json({ message: "Monto no encontrado" });
      }

  } catch (error) {
      console.error('Error al actualizar el monto:', error);
      return res.status(500).json({ error: 'Error al actualizar el monto' });
  } finally {
      // Cerrar la conexión
      await connection.end();
  }
};

module.exports = {
obtenerMontos,editarMonto,obtenerMontosTipo,deshabilitarMonto,crearMonto, obtenerMonto
  }