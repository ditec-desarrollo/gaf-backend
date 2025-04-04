const { conectar_BD_GAF_MySql } = require("../config/dbEstadisticasMYSQL");
const { sequelize } = require("../config/sequelize");
const DetMovimiento = require("../models/Financiera/DetMovimiento");
const Movimiento = require("../models/Financiera/Movimiento");
const Expediente = require("../models/Financiera/Expediente");
const { obtenerFechaEnFormatoDate } = require("../utils/helpers");
const DetMovimientoNomenclador = require("../models/Financiera/DetMovimientoNomenclador");
const { obtenerFechaDelServidor } = require("../utils/obtenerInfoDelServidor");
const { funcionMulterGAF } = require("../middlewares/multerArchivosGAF");
const fs = require('fs');
const path = require('path');
const { insertarLOG } = require("../utils/insertarLog");
const { historico } = require("../utils/insertarEnTablaEspejo");
const CustomError = require("../utils/customError");


const listarAnexos = async (req, res) => {
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Verifica si hay un término de búsqueda en los parámetros de la solicitud
      const searchTerm = req.query.searchTerm || '';

      let sqlQuery = 'SELECT * FROM anexo';

      // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
      if (searchTerm) {
          // sqlQuery += ' WHERE anexo_codigo LIKE ? OR anexo_det LIKE ?';
          sqlQuery += ' WHERE LOWER(anexo_codigo) LIKE LOWER(?) OR LOWER(anexo_det) LIKE LOWER(?)';
      }

      const [anexos] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);

      //  await connection.end();
      res.status(200).json({ anexos });
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const agregarAnexo =async(req,res)=>{
  let connection;
    try {
        const {codigo, descripcion} = req.body;
         connection = await conectar_BD_GAF_MySql();

        const [anexo] = await connection.execute(
            "SELECT * FROM anexo WHERE anexo_codigo = ?",
            [codigo]
          );
      
            if(anexo.length > 0){
                res
                .status(400)
                .json({
                  message: "anexo ya existente",
                  Anexo: anexo[0].anexo_det,
                });
            }else {
         
                const result = await insertarLOG("INSERT", req.id, 'INSERT INTO anexo (anexo_codigo,anexo_det) VALUES (?,?)', [codigo, descripcion], "anexo", connection);
                if(result.affectedRows > 0){
                  res.status(200).json({ message: "Anexo creado con éxito", id: result.insertId })
                }
            }
    } catch (error) {
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
}

const editarAnexo = async (req,res) =>{
  let connection;
    try {
        const { codigo, descripcion } = req.body;
        const anexoId = req.params.id;
    
         connection = await conectar_BD_GAF_MySql();
        const [anexo] = await connection.execute(
          "SELECT * FROM anexo WHERE anexo_codigo = ? ",
          [codigo]
        );

        if (anexo.length == 0 || anexo[0].anexo_id == anexoId) {

          const result = await insertarLOG("UPDATE", req.id, "UPDATE anexo SET anexo_codigo = ?, anexo_det = ? WHERE anexo_id = ?", [codigo, descripcion, anexoId], "anexo", connection);

          if(result.affectedRows > 0){
            res
              .status(200)
              .json({ message: "anexo modificado con exito", result });
          }else{

            res
              .status(400)
              .json({ message: "anexo no existente", anexoId: anexoId });
          }

        } else {
          res
            .status(400)
            .json({
              message: "Código de anexo ya existente",
              Anexo: anexo,
            });
        }
      } catch (error) {
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
      }finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
          await connection.end();
        }
      }
}

const borrarAnexo = async (req, res) => {
    const { id } = req.body;

    let connection;
  
    try {
       connection = await conectar_BD_GAF_MySql();
     
      const result = await insertarLOG("DELETE", req.id, "DELETE FROM anexo WHERE anexo_id = ?", [id], "anexo", connection);

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Anexo eliminado con éxito"});
      } else {
        res.status(400).json({ message: "Anexo no encontrado"});
      }
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

// const listarEjercicios = async (req, res) => {
//   const connection = await conectar_BD_GAF_MySql();
//   try {
//       // Verifica si hay un término de búsqueda en los parámetros de la solicitud
//       const searchTerm = req.query.searchTerm || '';

//       let sqlQuery = 'SELECT * FROM ejercicio';

//       // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
//       if (searchTerm) {
//           // sqlQuery += ' WHERE anexo_codigo LIKE ? OR anexo_det LIKE ?';
//           sqlQuery += ' WHERE LOWER(ejercicio_anio) LIKE LOWER(?) OR LOWER(ejercicio_det) LIKE LOWER(?)';
//       }

//       const [ejercicios] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);

//        await connection.end();
//       res.status(200).json({ ejercicios });
//   } catch (error) {
//       res.status(500).json({ message: error.message || "Algo salió mal :(" });
//   }
// };

const agregarEjercicio =async(req,res)=>{
  let connection;
    try {
        const {anio, descripcion} = req.body;
         connection = await conectar_BD_GAF_MySql();

        const [ejercicio] = await connection.execute(
            "SELECT * FROM ejercicio WHERE (ejercicio_anio,ejercicio_det) = (?,?)",
            [anio,descripcion]
          );
          
            if(ejercicio.length > 0){
                res
                .status(400)
                .json({
                  message: "ejercicio ya existente",
                  Ejercicio: ejercicio[0].ejercicio_det,
                });
            }else {
          
                const result = await insertarLOG("INSERT", req.id, 'INSERT INTO ejercicio (ejercicio_anio,ejercicio_det) VALUES (?,?)', [codigo, descripcion], "ejercicio", connection);
                if(result.affectedRows > 0){
                  res.status(200).json({ message: "ejercicio creado con éxito", id: result.insertId })
                }
        
            }
    } catch (error) {
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
}

const editarEjercicio = async (req,res) =>{
  let connection;
    try {
        const { anio, descripcion } = req.body;
        const ejercicioId = req.params.id;
    
         connection = await conectar_BD_GAF_MySql();
        const [ejercicio] = await connection.execute(
          "SELECT * FROM ejercicio WHERE (ejercicio_anio,ejercicio_det) = (?,?)",
          [anio,descripcion]
        );
   
        if (ejercicio.length == 0 || ejercicio[0].ejercicio_id == ejercicioId) {
          const result = await insertarLOG("UPDATE", req.id,  "UPDATE ejercicio SET ejercicio_anio = ?, ejercicio_det = ? WHERE ejercicio_id = ?", [anio, descripcion, ejercicioId], "ejercicio", connection);

          if(result.affectedRows > 0){
            res
              .status(200)
              .json({ message: "ejercicio modificado con exito", result });
          }else{

            res
              .status(400)
              .json({ message: "ejercicio no existente", ejercicioId: ejercicioId });
          }
        } else {
          res
            .status(400)
            .json({
              message: "ejercicio ya existente",
              Ejercicio: ejercicio,
            });
        }
      } catch (error) {
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
      }finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
          await connection.end();
        }
      }
}

const borrarEjercicio = async (req, res) => {
    const { id } = req.body;
  

  let connection;
    try {
       connection = await conectar_BD_GAF_MySql();
       const result = await insertarLOG("DELETE", req.id, "DELETE FROM ejercicio WHERE ejercicio_id = ?", [id], "ejercicio", connection);
  
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Ejercicio eliminado con éxito"});
      } else {
        res.status(400).json({ message: "Ejercicio no encontrado"});
      }
    } catch (error) {
      console.error("Error al eliminar el ejercicio:", error);
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

const listarFinalidades = async (req, res) => {
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Verifica si hay un término de búsqueda en los parámetros de la solicitud
      const searchTerm = req.query.searchTerm || '';

      let sqlQuery = 'SELECT * FROM finalidad';

      // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
      if (searchTerm) {
          // sqlQuery += ' WHERE anexo_codigo LIKE ? OR anexo_det LIKE ?';
          sqlQuery += ' WHERE LOWER(finalidad_codigo) LIKE LOWER(?) OR LOWER(finalidad_det) LIKE LOWER(?)';
      }

      const [finalidades] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);

      //  await connection.end();
      res.status(200).json({ finalidades });
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const agregarFinalidad =async(req,res)=>{
  let connection;
    try {
        const { descripcion,codigo} = req.body;
         connection = await conectar_BD_GAF_MySql();
         await connection.beginTransaction();

        const [finalidad] = await connection.execute(
            "SELECT * FROM finalidad WHERE finalidad_codigo = ?",
            [codigo]
          );
          
            if(finalidad.length > 0){
                res
                .status(400)
                .json({
                  message: "finalidad ya existente",
                  finalidad: finalidad[0].finalidad_det,
                });
            } else {

              const result = await insertarLOG("INSERT", req.id, 'INSERT INTO finalidad (finalidad_codigo,finalidad_det) VALUES (?,?)', [codigo, descripcion], "finalidad", connection);

              if(result.affectedRows > 0){
                await connection.commit();
                res.status(200).json({ message: "finalidad creada con éxito", id: result.insertId })
              }
        
            }
    } catch (error) {
      if(connection){
        await connection.rollback();
      }
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
}

const editarFinalidad = async (req, res) => {
  let connection;
  try {
    const { codigo, descripcion } = req.body;
    const finalidadId = req.params.id;

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

    const [finalidad] = await connection.execute(
      "SELECT * FROM finalidad WHERE finalidad_codigo = ? ",
      [codigo]
    );

    if (finalidad.length == 0 || finalidad[0].finalidad_id == finalidadId) {

      const result = await insertarLOG("UPDATE", req.id, "UPDATE finalidad SET finalidad_codigo = ?, finalidad_det = ? WHERE finalidad_id = ?", [codigo, descripcion, finalidadId], "finalidad", connection);

      if (result.affectedRows > 0) {
        await connection.commit();
        res
          .status(200)
          .json({ message: "finalidad modificada con éxito", result });
      } else {

        res
          .status(400)
          .json({ message: "finalidad no existente", finalidadID: finalidadId });
      }

    } else {
      res
        .status(400)
        .json({
          message: "Código de finalidad ya existente",
          Finalidad: finalidad,
        });
    }
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(error.code || 500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const borrarFinalidad = async (req, res) => {
    const { id } = req.body;
  
  let connection;
    try {
       connection = await conectar_BD_GAF_MySql();
       await connection.beginTransaction();
      
      const result = await insertarLOG("DELETE", req.id, "DELETE FROM finalidad WHERE finalidad_id = ?", [id], "finalidad", connection);
  
      if (result.affectedRows > 0) {
     
        await connection.commit();
        res.status(200).json({ message: "finalidad eliminada con éxito"});
      } else {
        res.status(400).json({ message: "finalidad no encontrada"});
      }


    } catch (error) {
      if(connection){
        await connection.rollback();
      }
      console.error("Error al eliminar la finalidad:", error);
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  }

const listarFunciones = async (req, res) => {
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Verifica si hay un término de búsqueda en los parámetros de la solicitud
      const searchTerm = req.query.searchTerm || '';

      let sqlQuery = 'SELECT funcion.*, finalidad_det FROM funcion LEFT JOIN finalidad ON funcion.finalidad_id = finalidad.finalidad_id';

      // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
      if (searchTerm) {
          
          sqlQuery += ' WHERE LOWER(funcion_codigo) LIKE LOWER(?) OR LOWER(funcion_det) LIKE LOWER(?)';
      }
      const [funciones] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
      console.log(funciones);
//  await connection.end();
      res.status(200).json({ funciones });
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const agregarFuncion =async(req,res)=>{
  let connection
  try {
      const { descripcion,codigo,finalidad_id} = req.body;

       connection = await conectar_BD_GAF_MySql();

      const [funcion] = await connection.execute(
          "SELECT * FROM funcion WHERE funcion_codigo = ?",
          [codigo]
        );
        
          if(funcion.length > 0){
              res
              .status(400)
              .json({
                message: "funcion ya existente",
                funcion: funcion[0].funcion_det,
              });
          }else {
              
              const result = await insertarLOG("INSERT", req.id, 'INSERT INTO funcion (funcion_det,funcion_codigo,finalidad_id) VALUES (?,?,?)', [descripcion,codigo,finalidad_id], "funcion", connection);

              if(result.affectedRows > 0){
                res.status(200).json({ message: "funcion creada con éxito", id: result.insertId })
              }
          }
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const editarFuncion = async (req,res) =>{
  let connection
  try {
    const { codigo, descripcion, finalidad_id } = req.body;
    const funcionId = req.params.id;

     connection = await conectar_BD_GAF_MySql();
    const [funcion] = await connection.execute(
      "SELECT * FROM funcion WHERE funcion_codigo = ? ",
      [codigo]
    );
 
    if (funcion.length == 0 || funcion[0].funcion_id == funcionId) {

        const result = await insertarLOG("UPDATE", req.id, "UPDATE funcion SET funcion_codigo = ?, funcion_det = ?, finalidad_id = ? WHERE funcion_id = ?", [codigo, descripcion,finalidad_id, funcionId], "funcion", connection);

        if (result.affectedRows > 0) {
          res
          .status(200)
          .json({ message: "función modificada con éxito", result });
        } else {
  
          res
            .status(400)
            .json({ message: "funcion no existente", funcionId: funcionId });
        }

    } else {
      res
        .status(400)
        .json({
          message: "función ya existente",
          Funcion: funcion
        });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const borrarFuncion = async (req, res) => {
  const { id } = req.body;

let connection;
  try {
     connection = await conectar_BD_GAF_MySql();

     const result = await insertarLOG("DELETE", req.id, "DELETE FROM funcion WHERE funcion_id = ?", [id], "funcion", connection);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "funcion eliminada con éxito"});
    } else {
      res.status(400).json({ message: "funcion no encontrada"});
    }  

  } catch (error) {
    console.error("Error al eliminar la funcion:", error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const listarItems = async (req, res) => {
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Verifica si hay un término de búsqueda en los parámetros de la solicitud
      const searchTerm = req.query.searchTerm || '';

      let sqlQuery =  'SELECT item.*, anexo_det, finalidad_det, funcion_det, organismo_det FROM item ' +
      'LEFT JOIN anexo ON item.anexo_id = anexo.anexo_id ' +
      'LEFT JOIN finalidad ON item.finalidad_id = finalidad.finalidad_id ' +
      'LEFT JOIN funcion ON item.funcion_id = funcion.funcion_id ' +
      'LEFT JOIN organismo ON item.organismo_id = organismo.organismo_id' +
      ' WHERE item.item_fechafin IS NULL'

      // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
      if (searchTerm) {
          
          sqlQuery += ' AND (LOWER(item_codigo) LIKE LOWER(?) OR LOWER(item_det) LIKE LOWER(?))';
      } 
      const [items] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
      // await connection.end();
      res.status(200).json({ items });
  } catch (error) {
    console.log(error);
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const listarItemsSinPartidas = async (req, res) => {
  let connection;
  const { presupuesto_id } = req.params; // Desestructurar el ID del presupuesto

  try {
    connection = await conectar_BD_GAF_MySql();
    
    // Verifica si hay un término de búsqueda en los parámetros de la solicitud
    const searchTerm = req.query.searchTerm || '';

    // Consulta base
    let sqlQuery = `
      SELECT item_codigo, item_det, item_id 
      FROM item 
      WHERE (SELECT COUNT(partida_id) 
             FROM detpresupuesto 
             WHERE detpresupuesto.presupuesto_id = ? 
               AND detpresupuesto.item_id = item.item_id) = 0
    `;

    // Si hay búsqueda, agregar condición
    const params = [presupuesto_id];
    if (searchTerm) {
      sqlQuery += ` AND (LOWER(item_codigo) LIKE LOWER(?) OR LOWER(item_det) LIKE LOWER(?))`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Ejecutar la consulta
    const [items] = await connection.execute(sqlQuery, params);

    // Enviar la respuesta
    res.status(200).json({ items });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const listarItemsFiltrado = async (req, res) => {
  const cuil=req.params.cuil
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Verifica si hay un término de búsqueda en los parámetros de la solicitud
      const searchTerm = req.query.searchTerm || '';

      let sqlQuery =  `CALL sp_items(${cuil})`

      // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
      if (searchTerm) {
          
          sqlQuery += ' WHERE LOWER(item_codigo) LIKE LOWER(?) OR LOWER(item_det) LIKE LOWER(?)';
      } 
      const [items] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
      await connection.end();
      res.status(200).json({ items });
  } catch (error) {
    console.log(error);
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const agregarItem =async(req,res)=>{
  let connection;
  try {
      const {codigo, descripcion,anexo_id,finalidad_id,funcion_id,fechaInicio,fechaFin,organismo_id} = req.body;
       connection = await conectar_BD_GAF_MySql();
console.log(req.body);
      const [item] = await connection.execute(
          "SELECT * FROM item WHERE item_codigo = ?",
          [codigo]
        );
         
          if(item.length > 0){
              res
              .status(400)
              .json({
                message: "item ya existente",
                Item: item[0].item_det,
              });
          }else {

              const result = await insertarLOG("INSERT", req.id,  'INSERT INTO item (item_codigo,item_det,anexo_id,finalidad_id,funcion_id,organismo_id) VALUES (?,?,?,?,?,?)', [codigo, descripcion,anexo_id,finalidad_id,funcion_id,organismo_id], "item", connection);

              if(result.affectedRows > 0){
                res.status(200).json({  message: "Item creado con éxito", id: result.insertId })
              }
          }
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const editarItem = async (req,res) =>{
  let connection;
  try {
      const { codigo, descripcion,anexo_id,finalidad_id,funcion_id,fechaInicio,fechaFin, organismo_id ,item_observaciones} = req.body;
      const itemId = req.params.id;
  
       connection = await conectar_BD_GAF_MySql();
      const [item] = await connection.execute(
        "SELECT * FROM item WHERE item_codigo = ? ",
        [codigo]
      );

      if (item.length == 0 || item[0].item_id == itemId) {

          const result = await insertarLOG("UPDATE", req.id, "UPDATE item SET item_codigo = ?, item_det = ?, anexo_id = ?, finalidad_id = ?, funcion_id = ?, organismo_id = ?,item_observaciones = ? WHERE item_id = ?", [codigo, descripcion,anexo_id,finalidad_id,funcion_id,organismo_id,item_observaciones, itemId], "item", connection);

          if (result.affectedRows > 0) {
            res
            .status(200)
            .json({ message: "item modificado con exito", result });
          } else {
    
            res
              .status(400)
              .json({ message: "item no existente", itemId: itemId });
          }

      } else {
        res
          .status(400)
          .json({
            message: "Item ya existente",
            Item: item[0].item_det,
          });
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
}

const borrarItem = async (req, res) => {
  const { id } = req.body;

  let connection;

  try {
     connection = await conectar_BD_GAF_MySql();

    const result = await insertarLOG("DELETE", req.id, "DELETE FROM item WHERE item_id = ?", [id], "item", connection);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Item eliminado con éxito"});
    } else {
      res.status(400).json({ message: "item no encontrado"});
    }  

  } catch (error) {
    console.error("Error al eliminar el item:", error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const listarPartidas =async(req,res)=>{
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Verifica si hay un término de búsqueda en los parámetros de la solicitud
      const searchTerm = req.query.searchTerm || '';

      let sqlQuery =  'SELECT * FROM partidas ORDER BY partida_codigo'

      // Agrega la cláusula WHERE para la búsqueda si hay un término de búsqueda
      if (searchTerm) {
          
          sqlQuery += ' WHERE LOWER(partida_codigo) LIKE LOWER(?) OR LOWER(partida_det) LIKE LOWER(?)';
      }
      const [partidas] = await connection.execute(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
      // await connection.end();
      res.status(200).json({ partidas });
  
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const listarPartidasConCodigo =async(req,res)=>{
  let connection;
  try {
  
       connection = await conectar_BD_GAF_MySql();
      const gastoOCredito = req.query.gastoOCredito;

      const [partidas] = await connection.execute(
         `SELECT partida_id,CONCAT(partida_codigo, ' _ ', partida_det) AS partida FROM partidas WHERE ${gastoOCredito == "gasto"? "partida_gasto = 1":"partida_credito = 1" } ORDER BY partida_codigo`
      );
      console.log(partidas); 
      // await connection.end();
      res.status(200).json({partidas})
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const listarPartidasConCodigoGasto =async(req,res)=>{
  let connection;
  try {
  
       connection = await conectar_BD_GAF_MySql();
    

      const [partidas] = await connection.execute(
         `SELECT partida_id,CONCAT(partida_codigo, ' _ ', partida_det) AS partida FROM partidas WHERE partida_gasto = 1 ORDER BY partida_codigo`
      );
      console.log(partidas); 
      // await connection.end();
      res.status(200).json({partidas})
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


const agregarPartida = async (req, res) => {
  let connection;
  try {
    const {
      id,
      seccion,
      sector,
      principal,
      parcial,
      subparcial,
      codigo,
      descripcion,
      partidapadre_id,
      gasto,
      credito,
      creditoanteproyecto
    } = req.body;
     connection = await conectar_BD_GAF_MySql();

    const [result] = await connection.execute(
      "SELECT sp_insertpartidas(?,?,?,?,?,?,?,?,?,?)",
      [
        seccion,
        sector,
        principal,
        parcial,
        subparcial,
        descripcion.toUpperCase() ,
        partidapadre_id,
        gasto,
        credito,
        creditoanteproyecto
      ]
    );
    console.log(result);
    // await connection.end();
    if (result[0]["sp_insertpartidas(?,?,?,?,?,?,?,?,?,?)"] === 0) {
      res.status(400).json({
        message: "partida ya existente",
        Item: result[0].partida_det,
      });
    } else {
      res.status(200).json({ message: "Partida creada con éxito" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

  const editarPartida = async (req, res) => {
    let connection;
    try {
      const { id, seccion, sector, principal, parcial, subparcial, codigo, descripcion, partidapadre_id, gasto, credito ,creditoanteproyecto} = req.body;
      const partidaId = req.params.id;

      connection = await conectar_BD_GAF_MySql();


      const [result] = await connection.execute(
        'SELECT sp_updatepartidas(?,?,?,?,?,?,?,?,?,?,?)',
        [partidaId, seccion, sector, principal, parcial, subparcial, descripcion, partidapadre_id, gasto, credito,creditoanteproyecto]
      );
      //  await connection.end();
      if (result[0]['sp_updatepartidas(?,?,?,?,?,?,?,?,?,?,?)'] === 0) {
        res
          .status(400)
          .json({
            message: "Una partida ya existente con ese código",
            Item: result[0].partida_det,
          });
      }


      else {

        res.status(200).json({ message: "Partida modificada con éxito" })
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    } finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  }

const borrarPartida = async (req, res) => {
  const{ id }= req.body;

  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();

    const result = await insertarLOG("DELETE", req.id, "DELETE FROM partidas WHERE partida_id = ?", [id], "partidas", connection);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "partida eliminada con éxito"});
    } else {
      res.status(400).json({ message: "partida no encontrada"});
    }  

  } catch (error) {
    console.error("Error al eliminar la partida:", error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const listarTiposDeMovimientos =async(req,res)=>{
  let connection;
  try {
  
       connection = await conectar_BD_GAF_MySql();

      const [tiposDeMovimientos] = await connection.execute(
          'SELECT * FROM tipomovimiento'
      ); 
      // await connection.end();
      res.status(200).json({tiposDeMovimientos})
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const listarOrganismos =async(req,res)=>{
  let connection;
  try {
  
       connection = await conectar_BD_GAF_MySql();

      const [organismos] = await connection.execute(
          'SELECT * FROM organismo'
      ); 
      // await connection.end();
      res.status(200).json({organismos})
  } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const agregarExpediente = async (req, res) => {
  let connection;
  try {
    const { anio, numero, causante, asunto, fecha, organismo_id } = req.body;
    
     connection = await conectar_BD_GAF_MySql();

    const [expediente] = await connection.execute(
      "SELECT * FROM expediente WHERE expediente_numero = ?",
      [numero]
    );

    if (expediente.length > 0) {
      res.status(400).json({
        message: "expediente ya existente",
        expediente: expediente[0].expediente_numero,
      });
    } else {
 

      const result = await insertarLOG("INSERT", req.id, "INSERT INTO expediente (organismo_id,expediente_numero,expediente_anio,expediente_causante,expediente_asunto, expediente_fecha) VALUES (?,?,?,?,?,?)",  [organismo_id, numero, anio, causante, asunto, fecha], "expediente", connection);
      if(result.affectedRows > 0){
        res
        .status(200)
        .json({
          message: "expediente creado con éxito",
          id: result.insertId,
          numero: numero,
          causante: causante,
          asunto: asunto,
          organismo_id: organismo_id
        });
      }

     
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerDetPresupuestoPorItemYpartida = async (req,res) =>{
  let connection;
  try {
    const item = req.query.item;
    const partida = req.query.partida;
   connection = await conectar_BD_GAF_MySql();


    const [detPresupuesto] = await connection.execute(
        "SELECT dm.detmovimiento_id, dp.detpresupuesto_id FROM detmovimiento dm JOIN detpresupuesto dp ON dm.detpresupuesto_id = dp.detpresupuesto_id  WHERE dp.item_id = ? AND dp.partida_id = ?",
        [item,partida]
      );

//  await connection.end();
      res.status(200).json({detPresupuesto})
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const editarDetalleMovimiento = async (req,res) =>{
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();

    const {detmovimiento_id,item,partida,importe} = req.body;

    const [detPresupuesto] = await connection.execute(
      "SELECT dm.detmovimiento_id, dp.detpresupuesto_id FROM detmovimiento dm JOIN detpresupuesto dp ON dm.detpresupuesto_id = dp.detpresupuesto_id  WHERE dp.item_id = ? AND dp.partida_id = ?",
      [item,partida]
    );

    if(detPresupuesto.length > 0){

        const result = await insertarLOG("UPDATE", req.id, "UPDATE detmovimiento dm JOIN detpresupuesto dp ON dm.detpresupuesto_id = dp.detpresupuesto_id SET dm.detmovimiento_importe = ?, dp.partida_id = ? WHERE dm.detmovimiento_id = ?", [importe,partida,detmovimiento_id], "detmovimiento", connection);

        if (result.affectedRows > 0) {
          res
          .status(200)
          .json({ message: "detmovimiento modificado con éxito", result });
        } else {
  
          res
            .status(400)
            .json({ message: "detmovimiento no existente", detmovimiento_id: detmovimiento_id });
        }
    }

    // await connection.end();
    return res.status(200).json({detPresupuesto})
    
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const listarPartidasCONCAT = async (req, res) => {
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `SELECT partida_id, CONCAT(partida_codigo, ' - ', partida_det) AS partida_concatenada FROM partidas ORDER BY partida_codigo`;

    const [partidas] = await connection.execute(sqlQuery);
//  await connection.end();
    res.status(200).json({ partidas });

  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const partidaExistente = async (req, res) => {
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
    const{id}=req.body
    let sqlQuery = `SELECT COUNT(detpresupuesto_id) FROM detpresupuesto WHERE partida_id=?`;
    let value=[id]
    const [result] = await connection.execute(sqlQuery,value);
    console.log(result);
    if (result[0]["COUNT(detpresupuesto_id)"]===1) {
      res.status(200).json({ message: "No se puede editar ni eliminar esta partida",ok:false});
    } else {
      res.status(200).json({ message: "Esta partida se puede editar y eliminar",ok:true});
    }
    // await connection.end();
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

// const agregarMovimiento = async (req, res) => {
//   let transaction;
//   let connection;
//   try {
//     const { movimiento, detMovimiento,expediente, presupuesto, items, encuadreLegal, tipoDeCompra } = req.body;
//     console.log(items);

//     transaction = await sequelize.transaction();

//     let expedienteObj = {
//       expediente_anio:expediente.anio,
//       expediente_fecha:expediente.fecha,
//       expediente_asunto:expediente.asunto,
//       expediente_causante:expediente.causante,
//       expediente_numero: expediente.numero,
//       expediente_detalle: expediente.detalle,
//       item_id:expediente.item
//     }
//     const nuevoExpediente = await Expediente.create(expedienteObj,{
//       transaction
//     });

//     const {fecha_actual} =  await obtenerFechaDelServidor()
    
//     const movimientoObj = {
//       // movimiento_fecha: movimiento.fecha,
//       movimiento_fecha: fecha_actual,
//       expediente_id: nuevoExpediente.expediente_id,
//       tipomovimiento_id: movimiento.tipomovimiento_id,
//       tipoinstrumento_id: expediente.tipoDeInstrumento,
//       instrumento_nro: expediente.numeroInstrumento,
//       presupuesto_id: presupuesto,
//       encuadrelegal_id: encuadreLegal,
//       tipocompra_id: tipoDeCompra
//     };

//     const nuevoMovimiento = await Movimiento.create(movimientoObj, {
//       transaction,
//     });

//     // const movimientoId = result.insertId;
//     const movimientoId = nuevoMovimiento.movimiento_id;
    

//     for (const detalle of detMovimiento) {
//       await DetMovimiento.create(
//         {
//           movimiento_id: movimientoId,
//           detpresupuesto_id: detalle.detPresupuesto_id,
//           detmovimiento_importe: detalle.importe,
//         },
//         { transaction }
//       );
//     }

//     for (const item of items) {
//       await DetMovimientoNomenclador.create(
//         {
//           movimiento_id: movimientoId,
//           nomenclador_id:item.nomenclador_id,
//           descripcion: item.descripcion,
//           cantidad: item.cantidad,
//           precio: item.precio,
//           total: item.total,
//           detPresupuesto_id: item.detPresupuesto_id
//         },
//         { transaction }
//       );
//     }
    
//     await transaction.commit();

//     if(movimiento.tipomovimiento_id == 1){
//       connection = await conectar_BD_GAF_MySql();
  
//       const [result] = await connection.execute(
//         'CALL sp_docreserva(?)',
//         [movimientoId]
//       );
//     }
//     // else if(movimiento.tipomovimiento_id == 4){
//     //   connection = await conectar_BD_GAF_MySql();
  
//     //   const [result] = await connection.execute(
//     //     'CALL sp_doccompromiso(?)',
//     //     [movimientoId]
//     //   );
//     // }

//     res.status(200).json({ message: "Movimiento creado con éxito", idMovi: movimientoId });
//   } catch (error) {

//     if (transaction) {
//       await transaction.rollback();
//     }
 
//     if(error.name == "SequelizeUniqueConstraintError"){
//       res.status(500).json({ message: "El número de expediente ingresado ya existe"});
//     }else{

//       res.status(500).json({ message: error.message || "Algo salió mal :(" });
//     }
//   }finally {
//     // Cerrar la conexión a la base de datos
//     if (connection) {
//       await connection.end();
//     }
//   }
// };

const agregarMovimiento = async (req, res) => {
 
  let connection;
  try {
    const { movimiento, detMovimiento,expediente, presupuesto, items, encuadreLegal, tipoDeCompra } = req.body;
    console.log(items);

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

    let sqlQueryExp = `SELECT * FROM expediente WHERE expediente_numero = ? AND expediente_anio = ?`;
    const [expedienteExiste] = await connection.execute(sqlQueryExp, [expediente.numero, expediente.anio])
    
    if (expedienteExiste?.length > 0) {
      
      let sqlQueryMovi = `SELECT * FROM movimiento WHERE movimiento.expediente_id = ? AND movimiento.movimiento_id2 = 0`;
      const [movimientoExiste] = await connection.execute(sqlQueryMovi, [expedienteExiste[0].expediente_id])

      if (movimientoExiste.length > 0) {
        
        
        const resultMovi = await insertarLOG("UPDATE", req.id, "UPDATE movimiento SET tipoInstrumento_id = ? , instrumento_nro = ?, encuadrelegal_id = ?, tipocompra_id = ? WHERE movimiento_id = ?", [expediente.tipoDeInstrumento, expediente.numeroInstrumento, encuadreLegal, tipoDeCompra, movimiento.id], "movimiento", connection);
        
        
        if (resultMovi.affectedRows == 0) {
          throw new Error('Error al actualizar movimiento');
        }
        
        const movimientoId = movimientoExiste[0].movimiento_id;
        const tablaEspejo = await historico("movimiento", "movimiento_h", "movimiento_id", movimientoId, req.id, "UPDATE", connection);
        
        if (!tablaEspejo) {
          throw new Error('Error al insertar histórico');
        }
        
        const result = await insertarLOG("DELETE", req.id, "DELETE FROM detmovimiento WHERE movimiento_id = ?", [movimientoId], "detmovimiento", connection);
        if (result.affectedRows == 0) {
          throw new Error('Error al eliminar detmovimiento');
        } 
        
        for (const detalle of detMovimiento) {
          
          const log = await insertarLOG("INSERT",req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)",  [movimientoId, detalle?.detPresupuesto_id?? detalle?.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);
          
          if(log.affectedRows == 0){
            throw new Error('Error al insertar detmovimiento');
          }
          
        }
        
        const resultNomen = await insertarLOG("DELETE", req.id, "DELETE FROM detmovimiento_nomenclador WHERE movimiento_id = ?", [movimientoId], "detmovimiento_nomenclador", connection);
        if (resultNomen.affectedRows == 0) {
          throw new Error('Error al eliminar detmovimiento_nomenclador');
        } 
        
        for (const [index, item] of items.entries()) {
          
          const log = await insertarLOG("INSERT",req.id,'INSERT INTO detmovimiento_nomenclador (movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id, orden ) VALUES (?,?,?,?,?,?,?,?)', [movimientoId, item.nomenclador_id,item.descripcion, item.cantidad, item.precio, item.total, item?.detPresupuesto_id?? item?.detpresupuesto_id, index + 1], "detmovimiento_nomenclador", connection);
          
          if(log.affectedRows == 0){
            throw new Error('Error al insertar detmovimiento_nomenclador');
          }
          
        }
        
        console.log("eee");
        if(movimiento.tipomovimiento_id == 1){
          
          const [result] = await connection.execute(
            'CALL sp_docreserva(?)',
            [movimientoId]
          );
        }

        await connection.commit();
        res.status(200).json({ message: "Movimiento actualizado con éxito", idMovi: movimientoId });
      }else{

        throw new Error("Movimiento no encontrado o no disponible para modificación");
      }

      
    }else{

      const result = await insertarLOG("INSERT",req.id, "INSERT INTO expediente (expediente_numero,expediente_anio,expediente_causante,expediente_asunto, expediente_fecha,expediente_detalle,item_id) VALUES (?,?,?,?,?,?,?)", [expediente.numero, expediente.anio, expediente.causante, expediente.asunto,  expediente.fecha, expediente.detalle, expediente.item], "expediente", connection);
  
      if(result.affectedRows == 0){
        throw new Error('Error al insertar expediente');
      }
  
      const nuevoExpediente = result.insertId;
  
      const {fecha_actual} =  await obtenerFechaDelServidor()
  
      const resultMovi = await insertarLOG("INSERT",req.id, "INSERT INTO movimiento (movimiento_fecha,expediente_id,tipomovimiento_id,tipoinstrumento_id, instrumento_nro,presupuesto_id,encuadrelegal_id, tipocompra_id) VALUES (?,?,?,?,?,?,?,?)", [fecha_actual,nuevoExpediente, movimiento.tipomovimiento_id, expediente.tipoDeInstrumento, expediente.numeroInstrumento, presupuesto, encuadreLegal, tipoDeCompra], "movimiento", connection);
  
      
      if(resultMovi.affectedRows == 0){
        throw new Error('Error al insertar movimiento');
      }
  
      const movimientoId = resultMovi.insertId;
      const tablaEspejo = await historico("movimiento","movimiento_h","movimiento_id",movimientoId, req.id, "INSERT",connection); //auditoria
  
      if(!tablaEspejo){
        throw new Error('Error al insertar histórico');
      }
  
  
      for (const detalle of detMovimiento) {
        const log = await insertarLOG("INSERT", req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)", [movimientoId, detalle?.detPresupuesto_id ?? detalle?.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);

        if (log.affectedRows == 0) {
          throw new Error('Error al insertar detmovimiento');
        }

      }

      for (const [index, item] of items.entries()) {
        const log = await insertarLOG("INSERT", req.id, 'INSERT INTO detmovimiento_nomenclador (movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id, orden ) VALUES (?,?,?,?,?,?,?,?)', [movimientoId, item.nomenclador_id, item.descripcion, item.cantidad, item.precio, item.total, item?.detPresupuesto_id ?? item?.detpresupuesto_id, index + 1], "detmovimiento_nomenclador", connection);

        if (log.affectedRows == 0) {
          throw new Error('Error al insertar detmovimiento_nomenclador');
        }

      }
      
      if(movimiento.tipomovimiento_id == 1){
    
        const [result] = await connection.execute(
          'CALL sp_docreserva(?)',
          [movimientoId]
        );
      }
  
      await connection.commit();
   
  
      res.status(200).json({ message: "Movimiento creado con éxito", idMovi: movimientoId });
    }

  } catch (error) {
    if(connection){
      await connection.rollback();
    }

      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

//con sequelize
// const agregarMovimientoDefinitivaPreventiva = async (req, res) => {
//   let transaction;
//   let connection;
//   try {
//     const { movimiento, detMovimiento, expediente, presupuesto, proveedor, items, encuadreLegal, tipoDeCompra, item_id, libramiento_anio } = req.body;
//     console.log(req.body);

//     transaction = await sequelize.transaction();

//     const movimientoObj = {
//       movimiento_fecha: movimiento.fecha,
//       expediente_id: expediente.id,
//       tipomovimiento_id: movimiento.tipomovimiento_id,
//       movimiento_id2: movimiento.id,
//       presupuesto_id: presupuesto,
//       tipoinstrumento_id: expediente.tipoDeInstrumento ? expediente.tipoDeInstrumento : null,
//       instrumento_nro: expediente.numeroInstrumento ? expediente.numeroInstrumento : null,
//       proveedor_id: proveedor.id,
//       encuadrelegal_id: encuadreLegal,
//       tipocompra_id: tipoDeCompra
//     };

//     const nuevoMovimiento = await Movimiento.create(movimientoObj, {
//       transaction,
//     });

//     // const movimientoId = result.insertId;
//     const movimientoId = nuevoMovimiento.movimiento_id;

//     let totalImporte = 0;
//     for (const detalle of detMovimiento) {
//       await DetMovimiento.create(
//         {
//           movimiento_id: movimientoId,
//           detpresupuesto_id: detalle.detPresupuesto_id,
//           detmovimiento_importe: parseFloat(detalle.importe),
//         },
//         { transaction }
//       );
//       totalImporte += parseFloat(detalle.importe);
//     }

//     for (const item of items) {
//       await DetMovimientoNomenclador.create(
//         {
//           movimiento_id: movimientoId,
//           nomenclador_id: item.nomenclador_id,
//           descripcion: item.descripcion,
//           cantidad: item.cantidad,
//           precio: item.precio,
//           total: item.total,
//           detPresupuesto_id: item.detPresupuesto_id
//         },
//         { transaction }
//       );
//     }

//     if (movimiento.tipomovimiento_id == 5) {
//       connection = await conectar_BD_GAF_MySql();

//       const [result] = await connection.execute(
//         'SELECT sp_nrolibramiento(?)',
//         [libramiento_anio]
//       );

//       const nrolib = result[0]['sp_nrolibramiento(?)'];

//       const [result2] = await connection.execute(
//         'SELECT sp_nrolibramientoint(?,?)',
//         [libramiento_anio, item_id]
//       );

//       const nrolibint = result2[0]['sp_nrolibramientoint(?,?)'];
//       console.log(totalImporte);
//       console.log(typeof totalImporte);

//       const [result3] = await connection.execute(
//         "INSERT INTO libramiento (libramiento_numero,libramiento_numeroint,libramiento_anio, libramiento_fecha, movimiento_id, proveedor_id, expediente_id, item_id, libramiento_importe, libramiento_concepto, libramiento_factura, libramiento_observaciones) VALUES (?,?,?,?,?,?,?,?,?,?, ?, ?)",
//         [nrolib, nrolibint, libramiento_anio, movimiento.fecha, movimientoId, proveedor.id, expediente.id, item_id, totalImporte, expediente.asunto, movimiento.factura, expediente.observaciones]
//       );

//     }

//     await transaction.commit();

//     if (movimiento.tipomovimiento_id == 4) {
//       connection = await conectar_BD_GAF_MySql();

//       const [result] = await connection.execute(
//         'CALL sp_doccompromiso(?)',
//         [movimientoId]
//       );
//     }



//     res.status(200).json({ message: "Movimiento creado con éxito", idMovi: movimientoId });
//   } catch (error) {

//     if (transaction) {
//       await transaction.rollback();
//     }

//     res.status(500).json({ message: error.message || "Algo salió mal :(" });
//   } finally {
//     // Cerrar la conexión a la base de datos
//     if (connection) {
//       await connection.end();
//     }
//   }
// };


const agregarMovimientoDefinitivaPreventivaSinArchivo = async (req, res) => {
  let connection;
  try {
    const { movimiento, detMovimiento, expediente, presupuesto, proveedor, items, encuadreLegal, tipoDeCompra, item_id, libramiento_anio } = req.body;
    console.log(req.body);

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

    const resultMovi = await insertarLOG("INSERT",req.id, "INSERT INTO movimiento (movimiento_fecha,expediente_id,tipomovimiento_id,tipoinstrumento_id, instrumento_nro,presupuesto_id,encuadrelegal_id, tipocompra_id, proveedor_id, movimiento_id2) VALUES (?,?,?,?,?,?,?,?,?,?)", [movimiento.fecha,expediente.id, movimiento.tipomovimiento_id, expediente.tipoDeInstrumento ? expediente.tipoDeInstrumento : null, expediente.numeroInstrumento ? expediente.numeroInstrumento : null, presupuesto, encuadreLegal, tipoDeCompra, proveedor.id, movimiento.id], "movimiento", connection);

    
    if(resultMovi.affectedRows == 0){
      throw new Error('Error al insertar movimiento');
    }

    const movimientoId = resultMovi.insertId;

    // let totalImporte = 0;
    // for (const detalle of detMovimiento) {
    
    //   const log = await insertarLOG("INSERT",req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)",  [movimientoId, detalle.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);

    //   if(log.affectedRows == 0){
    //     throw new Error('Error al insertar detmovimiento');
    //   }

    //   totalImporte += parseFloat(detalle.importe);
    // }

    // for (const item of items) {

    //   const log = await insertarLOG("INSERT",req.id,'INSERT INTO detmovimiento_nomenclador (movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id ) VALUES (?,?,?,?,?,?,?)', [movimientoId, item.nomenclador_id,item.descripcion, item.cantidad, item.precio, item.total, item?.detPresupuesto_id?? item?.detpresupuesto_id], "detmovimiento_nomenclador", connection);

    //   if(log.affectedRows == 0){
    //     throw new Error('Error al insertar detmovimiento_nomenclador');
    //   }

    // }

    for (const detalle of detMovimiento) {
      const log = await insertarLOG("INSERT", req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)", [movimientoId, detalle?.detPresupuesto_id ?? detalle?.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);

      if (log.affectedRows == 0) {
        throw new Error('Error al insertar detmovimiento');
      }

    }

    for (const [index, item] of items.entries()) {
      const log = await insertarLOG("INSERT", req.id, 'INSERT INTO detmovimiento_nomenclador (proveedor_id,movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id, orden ) VALUES (?,?,?,?,?,?,?,?,?)', [item?.proveedor_id?? item?.proveedor.id, movimientoId, item.nomenclador_id, item.descripcion, item.cantidad, item.precio, item.total, item?.detPresupuesto_id ?? item?.detpresupuesto_id, index + 1], "detmovimiento_nomenclador", connection);

      if (log.affectedRows == 0) {
        throw new Error('Error al insertar detmovimiento_nomenclador');
      }

    }

    if (movimiento.tipomovimiento_id == 6) {
      connection = await conectar_BD_GAF_MySql();

      const [result] = await connection.execute(
        'SELECT sp_nrolibramiento(?)',
        [libramiento_anio]
      );

      const nrolib = result[0]['sp_nrolibramiento(?)'];

      const [result2] = await connection.execute(
        'SELECT sp_nrolibramientoint(?,?)',
        [libramiento_anio, item_id]
      );

      const nrolibint = result2[0]['sp_nrolibramientoint(?,?)'];

      const libramiento = await insertarLOG("INSERT",req.id, "INSERT INTO libramiento (libramiento_numero,libramiento_numeroint,libramiento_anio, libramiento_fecha, movimiento_id, proveedor_id, expediente_id, item_id, libramiento_importe, libramiento_concepto, libramiento_factura, libramiento_observaciones) VALUES (?,?,?,?,?,?,?,?,?,?, ?, ?)",  [nrolib, nrolibint, libramiento_anio, movimiento.fecha, movimientoId, proveedor.id, expediente.id, item_id, totalImporte, expediente.asunto, movimiento.factura, expediente.observaciones], "libramiento", connection);

      if(libramiento.affectedRows == 0){
        throw new Error('Error al insertar libramiento');
      }

    }

    if (movimiento.tipomovimiento_id == 4) {

      const [result] = await connection.execute(
        'CALL sp_doccompromiso(?)',
        [movimientoId]
      );
    }

    await connection.commit();

    res.status(200).json({ message: "Movimiento creado con éxito", idMovi: movimientoId });

  } catch (error) {
    if(connection){
      await connection.rollback();
    }

      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

//compromiso
const agregarMovimientoCompromiso = async (req, res) => {
  let connection;
  try {
    const { movimiento, detMovimiento, expediente, presupuesto, proveedor, items, encuadreLegal, tipoDeCompra, item_id, libramiento_anio } = req.body;
    console.log(req.body);

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

    const resultMovi = await insertarLOG("INSERT",req.id, "INSERT INTO movimiento (movimiento_fecha,expediente_id,tipomovimiento_id,tipoinstrumento_id, instrumento_nro,presupuesto_id,encuadrelegal_id, tipocompra_id, proveedor_id, movimiento_id2) VALUES (?,?,?,?,?,?,?,?,?,?)", [movimiento.fecha,expediente.id, movimiento.tipomovimiento_id, expediente.tipoDeInstrumento ? expediente.tipoDeInstrumento : null, expediente.numeroInstrumento ? expediente.numeroInstrumento : null, presupuesto, encuadreLegal, tipoDeCompra, proveedor.id, movimiento.id], "movimiento", connection);

    
    if(resultMovi.affectedRows == 0){
      throw new Error('Error al insertar movimiento');
    }

    const movimientoId = resultMovi.insertId;

    let totalImporte = 0;
    for (const detalle of detMovimiento) {
    
      const log = await insertarLOG("INSERT",req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)",  [movimientoId, detalle.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);

      if(log.affectedRows == 0){
        throw new Error('Error al insertar detmovimiento');
      }

      totalImporte += parseFloat(detalle.importe);
    }

    for (const item of items) {

      const log = await insertarLOG("INSERT",req.id,'INSERT INTO detmovimiento_nomenclador (movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id ) VALUES (?,?,?,?,?,?,?)', [movimientoId, item.nomenclador_id,item.descripcion, item.cantidad, item.precio, item.total, item.detpresupuesto_id], "detmovimiento_nomenclador", connection);

      if(log.affectedRows == 0){
        throw new Error('Error al insertar detmovimiento_nomenclador');
      }

    }

    if (movimiento.tipomovimiento_id == 6) {
      connection = await conectar_BD_GAF_MySql();

      const [result] = await connection.execute(
        'SELECT sp_nrolibramiento(?)',
        [libramiento_anio]
      );

      const nrolib = result[0]['sp_nrolibramiento(?)'];

      const [result2] = await connection.execute(
        'SELECT sp_nrolibramientoint(?,?)',
        [libramiento_anio, item_id]
      );

      const nrolibint = result2[0]['sp_nrolibramientoint(?,?)'];

      const libramiento = await insertarLOG("INSERT",req.id, "INSERT INTO libramiento (libramiento_numero,libramiento_numeroint,libramiento_anio, libramiento_fecha, movimiento_id, proveedor_id, expediente_id, item_id, libramiento_importe, libramiento_concepto, libramiento_factura, libramiento_observaciones) VALUES (?,?,?,?,?,?,?,?,?,?, ?, ?)",  [nrolib, nrolibint, libramiento_anio, movimiento.fecha, movimientoId, proveedor.id, expediente.id, item_id, totalImporte, expediente.asunto, movimiento.factura, expediente.observaciones], "libramiento", connection);

      if(libramiento.affectedRows == 0){
        throw new Error('Error al insertar libramiento');
      }

    }

    if (movimiento.tipomovimiento_id == 4) {

      const [result] = await connection.execute(
        'CALL sp_doccompromiso(?)',
        [movimientoId]
      );
    }

    await connection.commit();

    res.status(200).json({ message: "Movimiento creado con éxito", idMovi: movimientoId });

  } catch (error) {
    if(connection){
      await connection.rollback();
    }

      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

//con archivos
const agregarMovimientoDefinitivaPreventiva = async (req, res) => {
  let connection;
  try {
    const { movimiento, detMovimiento, expediente, presupuesto, proveedor, items, encuadreLegal, tipoDeCompra, item_id, libramiento_anio } = JSON.parse(req.body.requestData);
    console.log(JSON.parse(req.body.requestData));

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

       // Ver los archivos subidos
       let obj;
       try {
         const requestDataString = req.body.requestData; // Accede al string JSON
         obj = JSON.parse(requestDataString); // Intenta convertir el string en un objeto
         console.log(obj); // Imprime el objeto
       } catch (error) {
         console.error('Error al parsear el JSON:', error);
         // Maneja el error, por ejemplo, enviando una respuesta de error al cliente
         return res.status(400).json({ message: 'Error al procesar los datos' });
       }
   
       // Carpeta de destino
       const destino = `mnt/gaf/movimientos/${obj.movimiento.id}/${obj.movimiento.tipomovimiento_id}`;  // Ruta de destino
      //  const destino = `C:\\Users\\usuario\\Downloads\\${obj.movimiento.id}\\${obj.movimiento.tipomovimiento_id}`;  // Ruta de destino
   
       // Asegúrate de que la carpeta destino exista, si no, crea una
       if (!fs.existsSync(destino)) {
         fs.mkdirSync(destino, { recursive: true });  // Crea la carpeta si no existe
       }
   
       // Mover cada archivo subido a la carpeta de destino
       const archivosMovidos = await Promise.all(
         Object.values(req.files).map(async (archivos) => {
           // Mover cada archivo
           return await Promise.all(
             archivos.map(async (archivo) => {
               const archivoDestino = await moverArchivos(archivo, destino);
              //  console.log(`Archivo movido: ${archivoDestino}`);
               return archivoDestino;
             })
           );
         })
       );

    const resultMovi = await insertarLOG("INSERT",req.id, "INSERT INTO movimiento (movimiento_fecha,expediente_id,tipomovimiento_id,tipoinstrumento_id, instrumento_nro,presupuesto_id,encuadrelegal_id, tipocompra_id, proveedor_id, movimiento_id2) VALUES (?,?,?,?,?,?,?,?,?,?)", [movimiento.fecha,expediente.id, movimiento.tipomovimiento_id, expediente.tipoDeInstrumento ? expediente.tipoDeInstrumento : null, expediente.numeroInstrumento ? expediente.numeroInstrumento : null, presupuesto, encuadreLegal, tipoDeCompra, proveedor.id, movimiento.id], "movimiento", connection);

    
    if(resultMovi.affectedRows == 0){
      throw new Error('Error al insertar movimiento');
    }

    const movimientoId = resultMovi.insertId;

    let totalImporte = 0;
    for (const detalle of detMovimiento) {
    
      const log = await insertarLOG("INSERT",req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)",  [movimientoId, detalle?.detPresupuesto_id?? detalle?.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);

      if(log.affectedRows == 0){
        throw new Error('Error al insertar detmovimiento');
      }

      totalImporte += parseFloat(detalle.importe);
    }

    for (const item of items) {

      const log = await insertarLOG("INSERT",req.id,'INSERT INTO detmovimiento_nomenclador (movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id ) VALUES (?,?,?,?,?,?,?)', [movimientoId, item.nomenclador_id,item.descripcion, item.cantidad, item.precio, item.total, item?.detPresupuesto_id?? item?.detpresupuesto_id], "detmovimiento_nomenclador", connection);

      if(log.affectedRows == 0){
        throw new Error('Error al insertar detmovimiento_nomenclador');
      }

    }

    // if (movimiento.tipomovimiento_id == 6) {
    //   connection = await conectar_BD_GAF_MySql();

    //   const [result] = await connection.execute(
    //     'SELECT sp_nrolibramiento(?)',
    //     [libramiento_anio]
    //   );

    //   const nrolib = result[0]['sp_nrolibramiento(?)'];

    //   const [result2] = await connection.execute(
    //     'SELECT sp_nrolibramientoint(?,?)',
    //     [libramiento_anio, item_id]
    //   );

    //   const nrolibint = result2[0]['sp_nrolibramientoint(?,?)'];

    //   const libramiento = await insertarLOG("INSERT",req.id, "INSERT INTO libramiento (libramiento_numero,libramiento_numeroint,libramiento_anio, libramiento_fecha, movimiento_id, proveedor_id, expediente_id, item_id, libramiento_importe, libramiento_concepto, libramiento_factura, libramiento_observaciones) VALUES (?,?,?,?,?,?,?,?,?,?, ?, ?)",  [nrolib, nrolibint, libramiento_anio, movimiento.fecha, movimientoId, proveedor.id, expediente.id, item_id, totalImporte, expediente.asunto, movimiento.factura, expediente.observaciones], "libramiento", connection);

    //   if(libramiento.affectedRows == 0){
    //     throw new Error('Error al insertar libramiento');
    //   }

    // }

    if (movimiento.tipomovimiento_id == 4) {

      const [result] = await connection.execute(
        'CALL sp_doccompromiso(?)',
        [movimientoId]
      );
    }

    await connection.commit();

    res.status(200).json({ message: "Movimiento creado con éxito", idMovi: movimientoId });

  } catch (error) {
    if(connection){
      await connection.rollback();
    }

      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

// const agregarMovimientoPorTransferenciaDePartidas = async (req, res) => {
//   let transaction;
//   try {
//     const { movimiento, detMovimiento,expediente, presupuesto } = req.body;

//     transaction = await sequelize.transaction();

//     let expedienteObj = {
//       expediente_anio:expediente.anio,
//       expediente_fecha:expediente.fecha,
//       expediente_asunto:expediente.asunto,
//       expediente_causante:expediente.causante,
//       expediente_numero: expediente.numero,
//       expediente_detalle: expediente.detalle,
//       item_id:expediente.itemCausante
//     }
//     const nuevoExpediente = await Expediente.create(expedienteObj,{
//       transaction
//     });

//     const movimientoObj = {
//       movimiento_fecha: movimiento.fecha,
//       expediente_id: nuevoExpediente.expediente_id,
//       tipomovimiento_id: movimiento.tipomovimiento_id,
//       tipoinstrumento_id: expediente.tipoDeInstrumento,
//       instrumento_nro: expediente.numeroInstrumento,
//       presupuesto_id: presupuesto
//     };

//     const nuevoMovimiento = await Movimiento.create(movimientoObj, {
//       transaction,
//     });

//     // const movimientoId = result.insertId;
//     const movimientoId = nuevoMovimiento.movimiento_id;

//     for (const detalle of detMovimiento) {
//       await DetMovimiento.create(
//         {
//           movimiento_id: movimientoId,
//           detpresupuesto_id: detalle.detPresupuesto_id,
//           detpresupuesto_id2: detalle.detPresupuesto_id_destino,
//           detmovimiento_importe: detalle.importe,
//         },
//         { transaction }
//       );
//     }
//     await transaction.commit();

//     res.status(200).json({ message: "Movimiento creado con éxito" });
//   } catch (error) {

//     if (transaction) {
//       await transaction.rollback();
//     }
 
//     if(error.name == "SequelizeUniqueConstraintError"){
//       res.status(500).json({ message: "El número de expediente ingresado ya existe"});
//     }else{

//       res.status(500).json({ message: error.message || "Algo salió mal :(" });
//     }
//   }
// };

const agregarMovimientoPorTransferenciaDePartidas = async (req, res) => {
  let connection;
  try {
    const { movimiento, detMovimiento,expediente, presupuesto } = req.body;

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

    const nuevoExpediente = await insertarLOG("INSERT",req.id, "INSERT INTO expediente (expediente_numero,expediente_anio,expediente_causante,expediente_asunto, expediente_fecha,expediente_detalle,item_id) VALUES (?,?,?,?,?,?,?)", [expediente.numero, expediente.anio, expediente.causante, expediente.asunto,  expediente.fecha, expediente.detalle, expediente.itemCausante], "expediente", connection);

    if(nuevoExpediente.affectedRows == 0){
      throw new Error('Error al insertar expediente');
    }

    
    const nuevoMovimiento = await insertarLOG("INSERT",req.id, "INSERT INTO movimiento (movimiento_fecha,expediente_id,tipomovimiento_id,tipoinstrumento_id, instrumento_nro,presupuesto_id) VALUES (?,?,?,?,?,?)", [ movimiento.fecha,nuevoExpediente.insertId, movimiento.tipomovimiento_id, expediente.tipoDeInstrumento, expediente.numeroInstrumento, presupuesto], "movimiento", connection);
    
    
    if(nuevoMovimiento.affectedRows == 0){
      throw new Error('Error al insertar movimiento');
    }

    const movimientoId = nuevoMovimiento.insertId;

    for (const detalle of detMovimiento) {

      const log = await insertarLOG("INSERT",req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detpresupuesto_id2,detmovimiento_importe) VALUES (?,?,?,?)",  [movimientoId, detalle.detPresupuesto_id,detalle.detPresupuesto_id_destino, parseFloat(detalle.importe)], "detmovimiento", connection);

      if(log.affectedRows == 0){
        throw new Error('Error al insertar detmovimiento');
      }

    }
    await connection.commit();

    res.status(200).json({ message: "Movimiento creado con éxito" });
  } catch (error) {

    if (connection) {
      await connection.rollback();
    }

      res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

// const modificarMovimientoParaTransferenciaEntrePartidas = async (req, res) => {
//   const {  movimiento, detMovimiento } = req.body;

//   let connection;
//   try {
//      connection = await conectar_BD_GAF_MySql();
//     await connection.beginTransaction();
//       // Paso 1: Eliminar los detalles de movimiento existentes para el movimiento
//       await connection.query('DELETE FROM detmovimiento WHERE detmovimiento.movimiento_id = ?', [movimiento.id]);
//     console.log(detMovimiento);
//     console.log(movimiento);
    
    
//       // Paso 2: Insertar los nuevos detalles de movimiento
//       const insertPromises = detMovimiento.map(detalle => {
//           return connection.query('INSERT INTO detmovimiento (movimiento_id, detpresupuesto_id, detmovimiento_importe, detpresupuesto_id2) VALUES (?, ?, ?, ?)', 
//           [movimiento.id,detalle.detPresupuesto_id,detalle.importe, detalle.detPresupuesto_id_destino]);
//       });

  
//       await connection.query("UPDATE movimiento SET tipoInstrumento_id = ? , instrumento_nro = ? WHERE movimiento_id = ?",[movimiento.tipoinstrumento_id, movimiento.instrumento_nro, movimiento.id])

//       await Promise.all(insertPromises);

//       await connection.commit();
//       res.status(200).json({ message: 'Movimiento actualizado correctamente' });
//   } catch (error) {
//     console.log(error);
//       await connection.rollback();
//       res.status(500).json({ message: 'Error al actualizar los detalles de movimiento', error });
//   } finally {
//     // Cerrar la conexión a la base de datos
//     if (connection) {
//       await connection.end();
//     }
//   }
// };

const modificarMovimientoParaTransferenciaEntrePartidas = async (req, res) => {
  const {  movimiento, detMovimiento } = req.body;

  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();
      // Paso 1: Eliminar los detalles de movimiento existentes para el movimiento

      const result = await insertarLOG("DELETE", req.id, 'DELETE FROM detmovimiento WHERE detmovimiento.movimiento_id = ?', [movimiento.id], "detmovimiento", connection);

      if(result.affectedRows == 0){
        throw new Error('Error al eliminar detmovimiento');
      }
    
  
      const insertPromises = detMovimiento.map(detalle =>  {
        return insertarLOG("INSERT",req.id, 'INSERT INTO detmovimiento (movimiento_id, detpresupuesto_id, detmovimiento_importe, detpresupuesto_id2) VALUES (?, ?, ?, ?)', [movimiento.id,detalle.detPresupuesto_id,detalle.importe, detalle.detPresupuesto_id_destino], "detmovimiento", connection);
    });

      const resultUpdate = await insertarLOG("UPDATE", req.id, "UPDATE movimiento SET tipoInstrumento_id = ? , instrumento_nro = ? WHERE movimiento_id = ?", [movimiento.tipoinstrumento_id, movimiento.instrumento_nro, movimiento.id], "movimiento", connection);

      if(resultUpdate.affectedRows == 0){
        throw new Error('Error al actualizar movimiento');
      }

      await Promise.all(insertPromises);

      await connection.commit();
      res.status(200).json({ message: 'Movimiento actualizado correctamente' });
  } catch (error) {
   if(connection){
     await connection.rollback();
   }
      res.status(500).json({ message: 'Error al actualizar los detalles de movimiento', error });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerPresupuestosParaMovimientoPresupuestario = async (req, res) => {
  let connection;
  try {

    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = `SELECT * FROM presupuesto WHERE presupuesto.presupuesto_ejecucion IS NOT NULL AND presupuesto.presupuesto_finalizado IS NULL`;
    const [presupuestos] = await connection.execute(sqlQuery);
    res.status(200).json({ presupuestos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const obtenerMovimientoReserva = async (req, res) => {
  let connection;
  const idMovi = req.query.idMovi;
  try {

    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = "SELECT CONCAT(partida_codigo, '_', partida_det) AS Partidas, imputacion_credito AS `Crédito Autorizado`, imputacion_reserva AS `Monto Reserva Interna`, imputacion_compromiso AS Compromiso, imputacion_saldo AS `Saldo Presupuestario`, imputacion_nuevareserva AS `Nueva Reserva`, imputacion_nuevomontoreservado AS `Nuevo Monto Reservado` FROM movimiento_reserva WHERE movimiento_id = ? ORDER BY partida_codigo";
    const [tablaPorPartidas] = await connection.execute(sqlQuery,[idMovi]);

    res.status(200).json({ tablaPorPartidas });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const obtenerMovimientoCompromiso = async (req, res) => {
  let connection;
  const idMovi = req.query.idMovi;
  try {

    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = "SELECT CONCAT(partida_codigo, '_', partida_det) AS Partidas, imputacion_credito AS `Crédito Autorizado`, imputacion_saldo AS `Saldo Presupuestario`, imputacion_compromiso AS Compromiso, imputacion_nuevosaldo AS `Nuevo Saldo Presupuestario` FROM movimiento_compromiso WHERE movimiento_id = ? ORDER BY partida_codigo";
    const [tablaPorPartidas] = await connection.execute(sqlQuery,[idMovi]);

    res.status(200).json({ tablaPorPartidas });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const obtenerLibramiento = async (req, res) => {
  let connection;
  const idMovi = req.query.idMovi;
  try {

    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = "SELECT * FROM libramiento WHERE movimiento_id = ?";
    const [libramiento] = await connection.execute(sqlQuery,[idMovi]);

    res.status(200).json({ libramiento });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


// REVISARRRRRRRRR. no se esta usando por el momento
const modificarMovimiento = async (req, res) => {
  const {  movimiento, detMovimiento, proveedor, items, encuadreLegal,expediente,tipoDeInstrumento, tipoDeCompra } = req.body;

  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();
      // Paso 1: Eliminar los detalles de movimiento existentes para el movimiento
      await connection.query('DELETE FROM detmovimiento WHERE detmovimiento.movimiento_id = ?', [movimiento.id]);
      await connection.query('DELETE FROM detmovimiento_nomenclador WHERE detmovimiento_nomenclador.movimiento_id = ?', [movimiento.id]);

      // Paso 2: Insertar los nuevos detalles de movimiento
      const insertPromises = detMovimiento.map(detalle => {
          return connection.query('INSERT INTO detmovimiento (movimiento_id, detpresupuesto_id, detmovimiento_importe) VALUES (?, ?, ?)', 
          [movimiento.id,detalle.detPresupuesto_id,detalle.importe]);
      });

      const insertPromisesNomenclador = items.map(item => {
        return connection.query('INSERT INTO detmovimiento_nomenclador (movimiento_id, nomenclador_id, descripcion,cantidad,precio,total,detPresupuesto_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [movimiento.id,item.nomenclador_id,item.descripcion,item.cantidad,item.precio,item.total,item.detPresupuesto_id]);
    });
    
    await Promise.all([...insertPromises, ...insertPromisesNomenclador]);
    
    if(proveedor.id !== ""){
      await connection.query("UPDATE movimiento SET proveedor_id = ? WHERE movimiento_id = ?",[proveedor.id, movimiento.id])
    }

    if( tipoDeInstrumento!== "" && expediente.numeroInstrumento !==""){
      await connection.query("UPDATE movimiento SET tipoinstrumento_id = ?, instrumento_nro = ? WHERE movimiento_id = ?",[tipoDeInstrumento,expediente.numeroInstrumento,movimiento.id])
    }

    if(encuadreLegal != null && tipoDeCompra != null){
      await connection.query("UPDATE movimiento SET encuadrelegal_id = ?, tipocompra_id = ? WHERE movimiento_id = ?",[encuadreLegal,tipoDeCompra, movimiento.id])
    }

      await connection.commit();
      res.status(200).json({ message: 'Movimiento actualizado correctamente', idMovi: movimiento.id });
  } catch (error) {
    console.log(error);
      await connection.rollback();
      res.status(500).json({ message: 'Error al actualizar los detalles de movimiento', error });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const modificarAltaDeCompromiso= async (req,res) => {
const {encuadreLegal, tipoDeCompra, proveedor, movimiento, tipoDeInstrumento, numeroInstrumento, items,expediente, detMovimiento} =req.body
let connection;
console.log(req.body.items[0]);

try {
   connection = await conectar_BD_GAF_MySql();
   await connection.beginTransaction();

    let sqlQueryExp = `SELECT * FROM expediente WHERE expediente_numero = ? AND expediente_anio = ?`;
    const [expedienteExiste] = await connection.execute(sqlQueryExp, [expediente.numero, expediente.anio])
    
    if (expedienteExiste?.length > 0) {
      
      
      const resultMovi = await insertarLOG("UPDATE", req.id, "UPDATE movimiento SET proveedor_id = ?, tipoInstrumento_id = ? , instrumento_nro = ?, encuadrelegal_id = ?, tipocompra_id = ? WHERE movimiento_id = ?", [proveedor.id,tipoDeInstrumento, numeroInstrumento, encuadreLegal, tipoDeCompra, movimiento.id], "movimiento", connection);
      
      
      if (resultMovi.affectedRows == 0) {
        throw new Error('Error al actualizar movimiento');
      }
      
      const movimientoId = movimiento.id
      console.log(movimientoId);
      
      const tablaEspejo = await historico("movimiento", "movimiento_h", "movimiento_id", movimientoId, req.id, "UPDATE", connection);
      
      if (!tablaEspejo) {
        throw new Error('Error al insertar histórico');
      }
      
      const result = await insertarLOG("DELETE", req.id, "DELETE FROM detmovimiento WHERE movimiento_id = ?", [movimientoId], "detmovimiento", connection);
      if (result.affectedRows == 0) {
        throw new Error('Error al eliminar detmovimiento');
      } 
      
      for (const detalle of detMovimiento) {
        
        const log = await insertarLOG("INSERT",req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)",  [movimientoId, detalle?.detPresupuesto_id?? detalle?.detpresupuesto_id, parseFloat(detalle.importe)], "detmovimiento", connection);
        
        if(log.affectedRows == 0){
          throw new Error('Error al insertar detmovimiento');
        }
        
      }
      
      const resultNomen = await insertarLOG("DELETE", req.id, "DELETE FROM detmovimiento_nomenclador WHERE movimiento_id = ?", [movimientoId], "detmovimiento_nomenclador", connection);
      if (resultNomen.affectedRows == 0) {
        throw new Error('Error al eliminar detmovimiento_nomenclador');
      } 
      
      for (const [index, item] of items.entries()) {
        const proveedorId = item.proveedor_id || item.proveedor?.id;
        console.log(proveedorId);
        
        
        const log = await insertarLOG("INSERT",req.id,'INSERT INTO detmovimiento_nomenclador (proveedor_id,movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id, orden ) VALUES (?,?,?,?,?,?,?,?,?)', [proveedorId,movimientoId, item.nomenclador_id,item.descripcion, item.cantidad, item.precio, item.total, item?.detPresupuesto_id?? item?.detpresupuesto_id, index + 1], "detmovimiento_nomenclador", connection);
        
        if(log.affectedRows == 0){
          throw new Error('Error al insertar detmovimiento_nomenclador');
        }
        
      }

      if (movimiento.tipomovimiento_id == 4) {

        const [result] = await connection.execute(
          'CALL sp_doccompromiso(?)',
          [movimientoId]
        );
      }
  
      await connection.commit();

      res.status(200).json({ message: "Movimiento actualizado con éxito", idMovi: movimientoId });


  }else{

    throw new Error("Expediente no encontrado o no disponible para modificación");
  }

  } catch (error) {
    if(connection){
      await connection.rollback();
    }

      console.log(error);
      res.status(500).json({ message: 'Error al actualizar los detalles de movimiento', error });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const modificarDefinitiva= async (req,res) => {
  const {numeroInstrumento, idMovimiento} =req.body
  console.log(req.body);
  
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();

      const resultUpdate = await insertarLOG("UPDATE", req.id, "UPDATE movimiento SET instrumento_nro = ? WHERE movimiento_id = ?", [numeroInstrumento, idMovimiento], "movimiento", connection);

      if(resultUpdate.affectedRows == 0){
        throw new Error('Error al actualizar movimiento');
      }
    
      res.status(200).json({ message: 'Movimiento actualizado correctamente', idMovi:idMovimiento });
  
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al actualizar los detalles de movimiento', error });
    } finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  }

const anularMovimiento = async (req, res) => {

  let connection;
  try {
    const { movimiento, detMovimiento, expediente, presupuesto, items, encuadreLegal, tipoDeCompra } = req.body;
    console.log(items);

    connection = await conectar_BD_GAF_MySql();
    await connection.beginTransaction();

      const { fecha_actual } = await obtenerFechaDelServidor()

      const resultMovi = await insertarLOG("INSERT", req.id, "INSERT INTO movimiento (movimiento_fecha,expediente_id,tipomovimiento_id,tipoinstrumento_id, instrumento_nro,presupuesto_id,encuadrelegal_id, tipocompra_id) VALUES (?,?,?,?,?,?,?,?)", [fecha_actual, expediente.id, movimiento.tipomovimiento_id, expediente.tipoDeInstrumento, expediente.numeroInstrumento, presupuesto, encuadreLegal, tipoDeCompra], "movimiento", connection);


      if (resultMovi.affectedRows == 0) {
        throw new Error('Error al insertar movimiento');
      }

      const movimientoId = resultMovi.insertId;
      const tablaEspejo = await historico("movimiento", "movimiento_h", "movimiento_id", movimientoId, req.id, "INSERT", connection); //auditoria

      if (!tablaEspejo) {
        throw new Error('Error al insertar histórico');
      }


      for (const detalle of detMovimiento) {
        const log = await insertarLOG("INSERT", req.id, "INSERT INTO detmovimiento (movimiento_id,detpresupuesto_id,detmovimiento_importe) VALUES (?,?,?)", [movimientoId, detalle?.detPresupuesto_id ?? detalle?.detpresupuesto_id, parseFloat(detalle.importe) * (-1)], "detmovimiento", connection);

        if (log.affectedRows == 0) {
          throw new Error('Error al insertar detmovimiento');
        }

      }

      for (const [index, item] of items.entries()) {
        const log = await insertarLOG("INSERT", req.id, 'INSERT INTO detmovimiento_nomenclador (movimiento_id,nomenclador_id,descripcion, cantidad, precio, total,detPresupuesto_id, orden ) VALUES (?,?,?,?,?,?,?,?)', [movimientoId, item.nomenclador_id, item.descripcion, item.cantidad, item.precio, item.total * (-1), item?.detPresupuesto_id ?? item?.detpresupuesto_id, index + 1], "detmovimiento_nomenclador", connection);

        if (log.affectedRows == 0) {
          throw new Error('Error al insertar detmovimiento_nomenclador');
        }

      }

      // if (movimiento.tipomovimiento_id == 1) {

      //   const [result] = await connection.execute(
      //     'CALL sp_docreserva(?)',
      //     [movimientoId]
      //   );
      // }

      await connection.commit();


      res.status(200).json({ message: "Movimiento anulado con éxito", idMovi: movimientoId });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({ message: error.message || "Algo salió mal :(" });

  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

// const modificarMovimientoAltaDeCompromiso= async (expediente, tipoDeInstrumento, movimiento, connection) => {

//   try {

//     const resultUpdate = await insertarLOG("UPDATE", req.id, "UPDATE movimiento SET tipoinstrumento_id = ?, instrumento_nro = ?, movimiento_protocolo = ?, movimiento_actadm = ?,  movimiento_factura = ? WHERE movimiento_id = ?", [tipoDeInstrumento,expediente.numeroInstrumento, expediente.numeroProtocolo, expediente.numeroActa, expediente.numeroFactura, movimiento.id], "movimiento", connection);

//     if(resultUpdate.affectedRows == 0){
//       throw new Error('Error al actualizar movimiento');
//     }
  
//   } catch (error) {
//       console.log(error);
//       throw new Error('Error al actualizar el movimiento: ' + error.message);
//   }
// }

const modificarMovimientoAltaDeCompromiso= async (expediente, tipoDeInstrumento, movimiento, connection,req) => {

  try {

    const resultUpdate = await insertarLOG("UPDATE", req.id, "UPDATE movimiento SET tipoinstrumento_id = ?, instrumento_nro = ? WHERE movimiento_id = ?", [tipoDeInstrumento,expediente.numeroInstrumento, movimiento.id], "movimiento", connection);

    if(resultUpdate.affectedRows == 0){
      throw new Error('Error al actualizar movimiento');
    }
  
  } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar el movimiento: ' + error.message);
  }
}


// const moverArchivos = (file, destino) => {
//   return new Promise((resolve, reject) => {
//     const archivoOrigen = file.path;  // Ruta del archivo original en 'uploads'
//     console.log(file);
//     const extension = path.extname(file.originalname);

//     const archivoDestino = path.join(destino, `${file.fieldname}${extension}`);  // Ruta de destino completa

//     fs.rename(archivoOrigen, archivoDestino, (err) => {
//       if (err) {
//         reject(err);  // Si hay un error, lo rechazamos
//       } else {
//         resolve(archivoDestino);  // Si el archivo se movió con éxito
//       }
//     });
//   });
// };


const moverArchivos = (file, destino) => {
  return new Promise((resolve, reject) => {
    try {
      const archivoOrigen = file.path; // Ruta del archivo original en 'uploads'
      console.log(file);
      const extension = path.extname(file.originalname);

      const archivoDestino = path.join(destino, `${file.fieldname}${extension}`); // Ruta de destino completa

      // Copiar archivo al destino
      fs.copyFileSync(archivoOrigen, archivoDestino);

      // Eliminar el archivo original
      fs.unlinkSync(archivoOrigen);

      resolve(archivoDestino); // Devolver la nueva ruta del archivo
    } catch (err) {
      reject(err);
    }
  });
};

const registroCompromisoAlta = async (req, res) => {
  let connection;
  const { expediente, tipoDeInstrumento, movimiento } = req.body;
  try {
    // Ver los archivos subidos
    let obj;
    try {
      const requestDataString = req.body.requestData; // Accede al string JSON
      obj = JSON.parse(requestDataString); // Intenta convertir el string en un objeto
      console.log(obj); // Imprime el objeto
    } catch (error) {
      console.error('Error al parsear el JSON:', error);
      // Maneja el error, por ejemplo, enviando una respuesta de error al cliente
      return res.status(400).json({ message: 'Error al procesar los datos' });
    }

    connection = await conectar_BD_GAF_MySql();

    // Carpeta de destino
    const destino = `/mnt/gaf/movimientos/${obj.movimiento.id}/${obj.movimiento.tipomovimiento_id}`;  // Ruta de destino
    // const destino = `C:\\Users\\usuario\\Downloads\\${obj.movimiento.id}\\${obj.movimiento.tipomovimiento_id}`;  // Ruta de destino

    // Asegúrate de que la carpeta destino exista, si no, crea una
    if (!fs.existsSync(destino)) {
      fs.mkdirSync(destino, { recursive: true });  // Crea la carpeta si no existe
    }

    // Mover cada archivo subido a la carpeta de destino
    const archivosMovidos = await Promise.all(
      Object.values(req.files).map(async (archivos) => {
        // Mover cada archivo
        return await Promise.all(
          archivos.map(async (archivo) => {
            const archivoDestino = await moverArchivos(archivo, destino);
            console.log(`Archivo movido: ${archivoDestino}`);
            return archivoDestino;
          })
        );
      })
    );

    await modificarMovimientoAltaDeCompromiso(obj.expediente, obj.tipoDeInstrumento, obj.movimiento, connection,req);

    // Si todo fue bien, respondemos con un mensaje de éxito
    res.status(200).json({ message: 'Movimiento actualizado correctamente', archivos: archivosMovidos });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error en el proceso', error: error.message });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const registroCompromisoAltaSinArchivo = async (req, res) => {
  let connection;
  const { expediente, tipoDeInstrumento, movimiento } = req.body;
  try {
   
    connection = await conectar_BD_GAF_MySql();

    await modificarMovimientoAltaDeCompromiso(expediente, tipoDeInstrumento, movimiento, connection,req);

    // Si todo fue bien, respondemos con un mensaje de éxito
    res.status(200).json({ message: 'Movimiento actualizado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error en el proceso', error: error.message });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

// const obtenerArchivo = async (req, res) => {
//   try {
//     const { nombreArchivo } = req.params; // Nombre del archivo desde los parámetros de la URL
    
//     const ruta = decodeURIComponent(req.query.ruta); // Decodifica el parámetro
//     console.log(`Ruta recibida: ${ruta}`);
//     const rutaArchivo = path.join('C:/Users/usuario/Downloads/movimientos', ruta); // Ruta completa del archivo

//     // Verificar si el archivo existe
//     if (!fs.existsSync(rutaArchivo)) {
//       return res.status(404).json({ message: 'Archivo no encontrado' });
//     }

//     // Enviar el archivo como respuesta
//     res.sendFile(rutaArchivo);
//   } catch (error) {
//     console.error('Error al obtener el archivo:', error);
//     res.status(500).json({ message: 'Error al obtener el archivo', error: error.message });
//   }
// };

const buscarArchivoPorNombre = (directorio, nombreArchivo) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directorio, (err, archivos) => {
      if (err) {
        return reject(err);
      }

      // Buscar archivo que coincida con el nombre proporcionado
      const archivoEncontrado = archivos.find((archivo) => path.parse(archivo).name === nombreArchivo);

      if (!archivoEncontrado) {
        return reject(new Error(`Archivo con nombre "${nombreArchivo}" no encontrado en el directorio.`));
      }

      // Devolver la extensión del archivo encontrado
      resolve(archivoEncontrado);
    });
  });
};

const obtenerArchivo = async (req, res) => {
  try {
    const rutaQuery = decodeURIComponent(req.query.ruta); // Ruta proporcionada en la query
    console.log(`Ruta recibida: ${rutaQuery}`);

    // Extraer el directorio y el nombre del archivo de la ruta
    const rutaSinArchivo = path.dirname(rutaQuery); // Directorio base
    const nombreArchivo = path.basename(rutaQuery, path.extname(rutaQuery)); // Nombre del archivo sin extensión
    console.log(`Directorio: ${rutaSinArchivo}, Nombre del archivo: ${nombreArchivo}`);

    // const rutaDirectorio = path.join('C:/Users/usuario/Downloads', rutaSinArchivo);
    const rutaDirectorio = path.join('/mnt/gaf/movimientos', rutaSinArchivo);

    // Verificar si el directorio existe
    if (!fs.existsSync(rutaDirectorio)) {
      return res.status(404).json({ message: 'Directorio no encontrado' });
    }

    // Buscar el archivo por nombre y obtener su extensión
    const archivoEncontrado = await buscarArchivoPorNombre(rutaDirectorio, nombreArchivo);
    const extension = path.extname(archivoEncontrado);

    console.log(`Archivo encontrado: ${archivoEncontrado}, Extensión: ${extension}`);

    const rutaArchivoCompleta = path.join(rutaDirectorio, archivoEncontrado);

    // Verificar si el archivo encontrado existe en el sistema
    if (!fs.existsSync(rutaArchivoCompleta)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    // Enviar el archivo como respuesta
    res.sendFile(rutaArchivoCompleta);
  } catch (error) {
    console.error('Error al obtener el archivo:', error);
    res.status(500).json({ message: 'Error al obtener el archivo', error: error.message });
  }
};


const buscarExpediente = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();
    const numero = req.query.numero;
    const tipomovimiento_id = req.query.tipomovimiento_id;
    const anio = req.query.anio;

    // Primera consulta: Obtener los detalles del expediente
    const query1 = `
    SELECT e.*, m.presupuesto_id,m.movimiento_id,m.movimiento_fecha,m.tipomovimiento_id,m.movimiento_id2,m.tipoinstrumento_id,m.instrumento_nro,m.encuadrelegal_id, prov.*, d.detmovimiento_id,d.detpresupuesto_id,d.detmovimiento_importe, dp.partida_id,dp.presupuesto_anteproyecto,dp.presupuesto_aprobado,dp.presupuesto_credito,dp.presupuesto_ampliaciones,dp.presupuesto_disminuciones, i.item_det,i.item_codigo, i.anexo_id, i.finalidad_id, i.funcion_id, i.item_fechainicio,i.item_fechafin,i.organismo_id, el.tipocompra_id, pda.partida_det, pda.partida_codigo
    FROM expediente AS e
    LEFT JOIN movimiento AS m ON e.expediente_id = m.expediente_id
    LEFT JOIN encuadrelegal AS el ON m.encuadrelegal_id = el.encuadrelegal_id 
    LEFT JOIN proveedores AS prov ON m.proveedor_id = prov.proveedor_id
    LEFT JOIN detmovimiento AS d ON m.movimiento_id = d.movimiento_id
    LEFT JOIN detpresupuesto AS dp ON d.detpresupuesto_id = dp.detpresupuesto_id
    LEFT JOIN item AS i ON dp.item_id = i.item_id
    LEFT JOIN partidas AS pda ON dp.partida_id = pda.partida_id
    WHERE e.expediente_numero = ? 
    AND m.tipomovimiento_id = ? 
    AND e.expediente_anio = ? 
`;
    const [result1] = await connection.execute(query1, [numero, tipomovimiento_id == 6 ? 4 : tipomovimiento_id == 4 ? 1 : tipomovimiento_id, anio]);
    console.log(result1);

    // Obtener los `movimiento_id` para la segunda consulta
    const movimientoIds = result1.map(row => row.movimiento_id);
    // console.log(movimientoIds);

    if (movimientoIds.length > 0) {
      // Segunda consulta: Obtener los `movimiento_id` a excluir
      const query2 = `
        SELECT definitiva.movimiento_id2 
        FROM movimiento AS definitiva 
        WHERE definitiva.movimiento_id2 IN (${movimientoIds.join(', ')})
    `;
      // console.log(query2);
      const [result2] = await connection.execute(query2);
      console.log(result2);

      // Responder al cliente con los resultados de ambas consultas
      const response1 = result1; // Resultado de la primera consulta
      const response2 = result2; // Resultado de la segunda consulta

      // Ejemplo de cómo podrías estructurar la respuesta al cliente
      const response = {
        primeraConsulta: response1,
        segundaConsulta: response2,
      };

      // Enviar la respuesta al cliente
      // console.log(response);
      if (response.primeraConsulta.length > 0 && response.segundaConsulta.length > 0 && tipomovimiento_id == 6) {
        res.status(200).json(response.primeraConsulta);
      }
      else if (response.primeraConsulta.length > 0 && response.segundaConsulta.length == 0 && tipomovimiento_id == 6 && response.primeraConsulta[0]?.tipoinstrumento_id == 0) {
        throw new Error("Le falta registro de compromiso")
      }
      else if (response.primeraConsulta.length > 0 && response.segundaConsulta.length > 0 && tipomovimiento_id == 6) {
        throw new Error("Ya tiene compromiso")
      } else if (response.primeraConsulta.length > 0 && response.segundaConsulta.length > 0 && tipomovimiento_id == 4) {
        throw new Error("Ya tiene reserva")
      } else if (response.primeraConsulta.length > 0 && response.segundaConsulta.length == 0) {
        res.status(200).json(response.primeraConsulta);
      }

    } else {
      // Si no hay movimientoIds, solo responde con el resultado de la primera consulta
      // console.log(result1);

      if (result1.length > 0) {

        const response = {
          primeraConsulta: result1,
          segundaConsulta: [],
        };
        res.status(200).json(response.primeraConsulta);
      } else throw new Error("No existe el expediente")
    }


    // await connection.end();
    // res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const chequearSiElExpedienteExisteAntesDeIniciarUnaReservaNueva = async (req,res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    const numero = req.query.numero;
    const anio = req.query.anio;

    let sqlQuery = `SELECT * FROM expediente WHERE expediente.expediente_numero = ? AND expediente.expediente_anio = ?`;
    const [expediente] = await connection.execute(sqlQuery,[numero, anio]);

    if (expediente.length === 0) {
      return res.status(404).json({ message: 'expediente no encontrado' });
  }

  res.status(200).json(expediente[0]);

  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const obtenerProveedor = async (req,res) => {
  let connection;
  try {
    const cuit = req.query.cuit;
    connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `SELECT *  FROM proveedores WHERE proveedores.proveedor_cuit = ?`;
    const [proveedores] = await connection.execute(sqlQuery,[cuit]);

    if (proveedores.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
  }

  res.status(200).json(proveedores[0]);

  } catch (error) {

    res.status(500).json({ message: error.message || "Algo salió mal :(" });

  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


// const buscarExpedienteParaModificarDefinitiva = async (req, res) => {
//   let connection;
//   try {
//     connection = await conectar_BD_GAF_MySql();
//     const numero = req.query.numero;
//     const tipomovimiento_id = req.query.tipomovimiento_id;
//     const anio = req.query.anio;


//     const query = `SELECT e.expediente_id,e.item_id,e.expediente_numero,e.expediente_anio,e.expediente_causante,e.expediente_asunto,e.expediente_fecha,e.expediente_detalle , m.presupuesto_id,m.movimiento_id,m.encuadrelegal_id,m.movimiento_fecha,m.tipomovimiento_id,m.movimiento_id2,m.tipoinstrumento_id,m.instrumento_nro,prov.*,
// ti.tipoinstrumento_det, d.detmovimiento_id,d.detpresupuesto_id,d.detpresupuesto_id2,d.detmovimiento_importe,dp.partida_id,dp.presupuesto_anteproyecto,dp.presupuesto_aprobado,dp.presupuesto_credito,dp.presupuesto_ampliaciones,dp.presupuesto_disminuciones,
// i.item_det,i.item_codigo, i.anexo_id, i.finalidad_id, i.funcion_id, i.item_fechainicio,i.item_fechafin,i.organismo_id, el.tipocompra_id
// FROM expediente AS e 
// LEFT JOIN movimiento AS m ON e.expediente_id = m.expediente_id 
// LEFT JOIN encuadrelegal AS el ON m.encuadrelegal_id = el.encuadrelegal_id 
// LEFT JOIN proveedores AS prov ON m.proveedor_id = prov.proveedor_id
// LEFT JOIN tipoinstrumento AS ti ON m.tipoinstrumento_id = ti.tipoinstrumento_id 
// LEFT JOIN detmovimiento AS d ON m.movimiento_id = d.movimiento_id 
// LEFT JOIN detpresupuesto AS dp ON d.detpresupuesto_id = dp.detpresupuesto_id
// LEFT JOIN item AS i ON dp.item_id = i.item_id 
// LEFT JOIN partidas AS pda ON dp.partida_id=pda.partida_id  
// WHERE e.expediente_numero = ? AND m.tipomovimiento_id = ? AND e.expediente_anio = ?
//     `;


//     const [result] = await connection.execute(query, [numero, tipomovimiento_id, anio]);

//     console.log(result);

//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message || "Algo salió mal :(" });
//   } finally {
//     // Cerrar la conexión a la base de datos
//     if (connection) {
//       await connection.end();
//     }
//   }
// }

const buscarExpedienteParaModificarDefinitiva = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();
    const numero = req.query.numero;
    const tipomovimiento_id = req.query.tipomovimiento_id;
    const anio = req.query.anio;


    const query = `SELECT e.expediente_id,e.item_id,e.expediente_numero,e.expediente_anio,e.expediente_causante,e.expediente_asunto,e.expediente_fecha,e.expediente_detalle , m.presupuesto_id,m.movimiento_id,m.encuadrelegal_id,m.movimiento_fecha,m.tipomovimiento_id,m.movimiento_id2,m.tipoinstrumento_id,m.instrumento_nro,prov.*,
ti.tipoinstrumento_det, d.detmovimiento_id,d.detpresupuesto_id,d.detpresupuesto_id2,d.detmovimiento_importe,dp.partida_id,dp.presupuesto_anteproyecto,dp.presupuesto_aprobado,dp.presupuesto_credito,dp.presupuesto_ampliaciones,dp.presupuesto_disminuciones,
i.item_det,i.item_codigo, i.anexo_id, i.finalidad_id, i.funcion_id, i.item_fechainicio,i.item_fechafin,i.organismo_id, el.tipocompra_id, pda.partida_det, pda.partida_codigo
FROM expediente AS e 
LEFT JOIN movimiento AS m ON e.expediente_id = m.expediente_id 
LEFT JOIN encuadrelegal AS el ON m.encuadrelegal_id = el.encuadrelegal_id 
LEFT JOIN proveedores AS prov ON m.proveedor_id = prov.proveedor_id
LEFT JOIN tipoinstrumento AS ti ON m.tipoinstrumento_id = ti.tipoinstrumento_id 
LEFT JOIN detmovimiento AS d ON m.movimiento_id = d.movimiento_id 
LEFT JOIN detpresupuesto AS dp ON d.detpresupuesto_id = dp.detpresupuesto_id
LEFT JOIN item AS i ON dp.item_id = i.item_id 
LEFT JOIN partidas AS pda ON dp.partida_id=pda.partida_id  
WHERE e.expediente_numero = ? AND m.tipomovimiento_id = ? AND e.expediente_anio = ?
    `;


    const [result] = await connection.execute(query, [numero, tipomovimiento_id, anio]);

    console.log(result);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const buscarExpedienteAnulacion = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();
    const numero = req.query.numero;
    const tipomovimiento_id = req.query.tipomovimiento_id;
    const anio = req.query.anio;

    const query = `SELECT e.expediente_id, e.item_id, e.expediente_numero, e.expediente_anio, e.expediente_causante, 
       e.expediente_asunto, e.expediente_fecha, e.expediente_detalle, 
       m.presupuesto_id, m.movimiento_id, m.encuadrelegal_id, m.movimiento_fecha, 
       m.tipomovimiento_id, m.movimiento_id2, m.tipoinstrumento_id, m.instrumento_nro, m.tipomovimiento_id,
       prov.*, ti.tipoinstrumento_det, d.detmovimiento_id, d.detpresupuesto_id, 
       d.detpresupuesto_id2, d.detmovimiento_importe, dp.partida_id, 
       dp.presupuesto_anteproyecto, dp.presupuesto_aprobado, dp.presupuesto_credito, 
       dp.presupuesto_ampliaciones, dp.presupuesto_disminuciones, 
       i.item_det, i.item_codigo, i.anexo_id, i.finalidad_id, i.funcion_id, 
       i.item_fechainicio, i.item_fechafin, i.organismo_id, el.tipocompra_id, 
       pda.partida_det, pda.partida_codigo
FROM expediente AS e 
LEFT JOIN movimiento AS m ON e.expediente_id = m.expediente_id
LEFT JOIN encuadrelegal AS el ON m.encuadrelegal_id = el.encuadrelegal_id 
LEFT JOIN proveedores AS prov ON m.proveedor_id = prov.proveedor_id
LEFT JOIN tipoinstrumento AS ti ON m.tipoinstrumento_id = ti.tipoinstrumento_id 
LEFT JOIN detmovimiento AS d ON m.movimiento_id = d.movimiento_id 
LEFT JOIN detpresupuesto AS dp ON d.detpresupuesto_id = dp.detpresupuesto_id
LEFT JOIN item AS i ON dp.item_id = i.item_id 
LEFT JOIN partidas AS pda ON dp.partida_id=pda.partida_id  
WHERE e.expediente_numero = ? 
  AND e.expediente_anio = ? 
    AND NOT EXISTS (  
      SELECT 1  
      FROM movimiento AS m2  
      INNER JOIN expediente AS e2 ON m2.expediente_id = e2.expediente_id  
      WHERE e2.expediente_numero = e.expediente_numero  
        AND e2.expediente_anio = e.expediente_anio  
        AND m2.tipomovimiento_id = 9  
  )
  AND m.movimiento_id2 = (
      SELECT MAX(m2.movimiento_id2) 
      FROM movimiento AS m2
      INNER JOIN expediente AS e2 ON m2.expediente_id = e2.expediente_id
      WHERE e2.expediente_numero = e.expediente_numero 
        AND e2.expediente_anio = e.expediente_anio
  );
`;

    const [result] = await connection.execute(query, [numero, anio]);

    if(result.length === 0){
      throw new Error("Este movimiento ya fue anulado");
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const buscarExpedienteParaModificarNomenclador = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();
    const movimiento_id = req.query.movimiento_id;

    const query = `SELECT det.detmovimiento_nomenclador_id,det.movimiento_id,det.nomenclador_id,det.descripcion,det.cantidad,det.precio,det.total,det.detPresupuesto_id,det.detpresupuesto_id_anterior,det.orden, it.*, nom.*, p.partida_id,p.partida_codigo,p.partida_det, p.item_id AS partida_itemId, prov.* FROM detmovimiento_nomenclador AS det LEFT JOIN detpresupuesto AS dtp ON det.detPresupuesto_id = dtp.detpresupuesto_id LEFT JOIN item AS it ON dtp.item_id = it.item_id LEFT JOIN nomenclador AS nom ON det.nomenclador_id = nom.nomenclador_id LEFT JOIN partidas AS p ON nom.partida_id = p.partida_id LEFT JOIN proveedores AS prov ON det.proveedor_id = prov.proveedor_id WHERE det.movimiento_id = ? AND it.item_fechafin IS NULL ORDER BY det.orden`;

    const [result] = await connection.execute(query, [movimiento_id]);

    console.log(result);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const buscarExpedienteParaModificarPorTransferenciaEntrePartidas = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();
    const numero = req.query.numero;
    const tipomovimiento_id = req.query.tipomovimiento_id;
    const anio = req.query.anio;

// FALTA TRAER EL ITEM_ID DEL EXPEDIENTE
// DISTINGUIR ITEM_ID DE PARTIDA ORIGEN Y DESTINO

    const query = `SELECT 
    e.expediente_id, 
    e.item_id, 
    e.expediente_numero, 
    e.expediente_anio, 
    e.expediente_causante, 
    e.expediente_asunto, 
    e.expediente_fecha, 
    e.expediente_detalle, 
    m.presupuesto_id, 
    m.movimiento_id, 
    m.movimiento_fecha, 
    m.tipomovimiento_id, 
    m.movimiento_id2, 
    m.tipoinstrumento_id, 
    m.instrumento_nro, 
    prov.*, 
    ti.tipoinstrumento_det, 
    d.detmovimiento_id,
    d.detmovimiento_importe, 
    d.detpresupuesto_id,d.detpresupuesto_id2,
    dp1.partida_id AS partida_id,
    dp1.item_id AS item_id_origen,
    dp2.item_id AS item_id_destino, 
    dp2.partida_id AS partida_id_destino 
FROM expediente AS e LEFT JOIN movimiento AS m ON e.expediente_id = m.expediente_id 
LEFT JOIN proveedores AS prov ON m.proveedor_id = prov.proveedor_id
LEFT JOIN tipoinstrumento AS ti ON m.tipoinstrumento_id = ti.tipoinstrumento_id 
LEFT JOIN detmovimiento AS d ON m.movimiento_id = d.movimiento_id 
LEFT JOIN detpresupuesto AS dp1 ON d.detpresupuesto_id = dp1.detpresupuesto_id
LEFT JOIN detpresupuesto AS dp2 ON d.detpresupuesto_id2 = dp2.detpresupuesto_id
WHERE e.expediente_numero = ? 
AND m.tipomovimiento_id = ? 
AND e.expediente_anio = ?
`;


    const [result] = await connection.execute(query, [numero, tipomovimiento_id, anio]);

    console.log(result);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const listarEjercicio= async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();
    console.log(connection)
    let sqlQuery = `SELECT *  FROM presupuesto`;

    const [ejercicio] = await connection.execute(sqlQuery);
//  await connection.end();
    res.status(200).json({ ejercicio });

  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const listarAnteproyecto= async (req, res) => {
  const item=req.query.item;
  const ejercicio=req.query.ejercicio;
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `SELECT a.detpresupuesto_id,a.partida_id,b.partida_credito,b.partida_creditoanteproyecto,b.partida_codigo,b.partida_det,a.presupuesto_credito,a.presupuesto_anteproyecto,a.presupuesto_aprobado
    FROM detpresupuesto a inner JOIN partidas b
    ON a.partida_id=b.partida_id WHERE a.presupuesto_id=? AND a.item_id=?
    order by b.partida_codigo`;

    const [anteproyecto] = await connection.execute(sqlQuery, [ejercicio, item]);
//  await connection.end();
    res.status(200).json({ anteproyecto });

  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const actualizarPresupuestoAnteproyecto=async(req, res)=> {
  let connection;
  try {
    const { detpresupuesto_id, presupuesto_anteproyecto } = req.body;

    // Crear una conexión a la base de datos
     connection = await conectar_BD_GAF_MySql();

    // Iterar sobre cada elemento a actualizar
   
      

      // Consulta SQL para actualizar el presupuesto_anteproyecto
      const sqlQuery = 'UPDATE detpresupuesto SET presupuesto_anteproyecto = ? WHERE detpresupuesto_id = ?';

      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [result] = await connection.execute(sqlQuery, [presupuesto_anteproyecto, detpresupuesto_id]);

      // Verificar si se realizó la actualización correctamente
      if (result.affectedRows === 1) {
        console.log(`Se actualizó correctamente el presupuesto_anteproyecto para el detpresupuesto_id ${detpresupuesto_id}.`);
        res.status(200).send({mge:'Anteproyecto actualizado',ok:true});
      } 
     else if (result.affectedRows > 1) {
    
        res.status(404).send({mge:`problema en la base de datos . Hay mas de una fila con el mismo id`,ok:false});
      }else {
        res.status(404).send({mge:`No se encontró ningún registro con el detpresupuesto_id ${detpresupuesto_id}.`,ok:false});
      }
    

    // Cerrar la conexión a la base de datos
    // await connection.end();

    
  } catch (error) {
    console.error('Error al actualizar el presupuesto_anteproyecto:', error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


const actualizarCredito=async(req, res)=> {
  let connection;
  try {
    const { detpresupuesto_id, presupuesto_credito }= req.body;

    // Crear una conexión a la base de datos
     connection = await conectar_BD_GAF_MySql();

    // Iterar sobre cada elemento a actualizar
 
      

      // Consulta SQL para actualizar el presupuesto_anteproyecto
      const sqlQuery = 'UPDATE detpresupuesto SET presupuesto_credito = ? WHERE detpresupuesto_id = ?';

      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [result] = await connection.execute(sqlQuery, [presupuesto_credito, detpresupuesto_id]);

      // Verificar si se realizó la actualización correctamente
      if (result.affectedRows === 1) {
        console.log(`Se actualizó correctamente el presupuesto_credito para el detpresupuesto_id ${detpresupuesto_id}.`);
      } else {
        res.status(200).send({mge:`No se encontró ningún registro con el detpresupuesto_id ${detpresupuesto_id}.`,ok:false});
      }

    res.status(200).send({mge:'Credito actualizado',ok:true});
  } catch (error) {
    console.error('Error al actualizar el presupuesto_anteproyecto:', error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const actualizarCreditoCompleto=async(req, res)=> {
  let connection;
  try {
    const datosActualizar = req.body;

    // Crear una conexión a la base de datos
     connection = await conectar_BD_GAF_MySql();

    // Iterar sobre cada elemento a actualizar
    for (const elemento of datosActualizar) {
      const { detpresupuesto_id, presupuesto_credito } = elemento;

      // Consulta SQL para actualizar el presupuesto_anteproyecto
      const sqlQuery = 'UPDATE detpresupuesto SET presupuesto_credito = ? WHERE detpresupuesto_id = ?';

      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [result] = await connection.execute(sqlQuery, [presupuesto_credito, detpresupuesto_id]);

      // Verificar si se realizó la actualización correctamente
      if (result.affectedRows === 1) {
        console.log(`Se actualizó correctamente el presupuesto_credito para el detpresupuesto_id ${detpresupuesto_id}.`);
      } else {
        res.status(200).send({mge:`No se encontró ningún registro con el detpresupuesto_id ${detpresupuesto_id}.`,ok:false});
      }
    }

    // Cerrar la conexión a la base de datos
    // await connection.end();

    res.status(200).send({mge:'Credito actualizado',ok:true});
  } catch (error) {
    console.error('Error al actualizar el presupuesto_anteproyecto:', error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


const actualizarPresupuestoAprobado=async(req, res)=> {
  let connection;
  try {
    const { detpresupuesto_id, presupuesto_aprobado }  = req.body;

    // Crear una conexión a la base de datos
     connection = await conectar_BD_GAF_MySql();
    
      // Consulta SQL para actualizar el presupuesto_anteproyecto
      const sqlQuery = 'UPDATE detpresupuesto SET presupuesto_aprobado = ? WHERE detpresupuesto_id = ?';

      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [result] = await connection.execute(sqlQuery, [presupuesto_aprobado, detpresupuesto_id]);

      // Verificar si se realizó la actualización correctamente
      if (result.affectedRows === 1) {
        console.log(`Se actualizó correctamente el presupuesto_aprobado para el detpresupuesto_id ${detpresupuesto_id}.`);
      } else {
        res.status(200).send({mge:`No se encontró ningún registro con el detpresupuesto_id ${detpresupuesto_id}.`,ok:false});
      }

    res.status(200).send({mge:'Presupuesto aprobado actualizado',ok:true});
  } catch (error) {
    console.error('Error al actualizar el presupuesto_anteproyecto:', error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const actualizarPresupuestoAprobadoCompleto=async(req, res)=> {
  let connection;
  try {
    const datosActualizar = req.body;

    // Crear una conexión a la base de datos
     connection = await conectar_BD_GAF_MySql();

    // Iterar sobre cada elemento a actualizar
    for (const elemento of datosActualizar) {
      const { detpresupuesto_id, presupuesto_aprobado } = elemento;

      // Consulta SQL para actualizar el presupuesto_anteproyecto
      const sqlQuery = 'UPDATE detpresupuesto SET presupuesto_aprobado = ? WHERE detpresupuesto_id = ?';

      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [result] = await connection.execute(sqlQuery, [presupuesto_aprobado, detpresupuesto_id]);

      // Verificar si se realizó la actualización correctamente
      if (result.affectedRows === 1) {
        console.log(`Se actualizó correctamente el presupuesto_aprobado para el detpresupuesto_id ${detpresupuesto_id}.`);
      } else {
        res.status(200).send({mge:`No se encontró ningún registro con el detpresupuesto_id ${detpresupuesto_id}.`,ok:false});
      }
    }

    res.status(200).send({mge:'Presupuesto aprobado actualizado',ok:true});
  } catch (error) {
    console.error('Error al actualizar el presupuesto_anteproyecto:', error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const obtenerPartidasPorItemYMovimiento = async (req,res)=>{
  let connection;
  try {
    const itemId = req.query.item;
    const tipomovimiento_id = req.query.tipomovimiento_id
    const presupuesto = req.query.presupuesto;

    connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `CALL sp_partidas(?,?,?)`;
    const [results, fields] = await connection.execute(sqlQuery, [presupuesto,tipomovimiento_id, itemId]);

    // await connection.end();

    res.status(200).send({mge:'partidas:',results});

  } catch (error) {
    console.log(error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const obtenerSaldoPorDetPresupuestoID = async (req,res)=>{
  let connection;
  try {
    const detPresupuestoId = req.query.detPresupuestoId;
    console.log(detPresupuestoId);
    
    connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `SELECT sp_saldopartida(?)`;
    const [results, fields] = await connection.execute(sqlQuery, [detPresupuestoId]);
    // console.log(results[0]['sp_saldopartida(?)']);
    console.log(results);
    
    const saldo = results[0]['sp_saldopartida(?)'];
    res.status(200).send({mge:'saldo:',saldo});

  } catch (error) {
    console.log(error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


const acumular = async (req, res) => {
  let connection;
  try {
    const {campo, partida, item ,presupuesto_id} = req.body;

    // Verificar que partida e item están definidos
    if (!partida || !item) {
      return res.status(400).send({ mge: 'Datos inválidos', ok: false });
    }

    // Crear una conexión a la base de datos
     connection = await conectar_BD_GAF_MySql();

    // Consulta SQL para actualizar el presupuesto_anteproyecto
    const sqlQuery = "CALL sp_actualizaacumuladores(?,?, ?,?)";

    // Ejecutar la consulta SQL con los parámetros proporcionados
    const result = await connection.execute(sqlQuery, [campo,item, partida,presupuesto_id]);

    // Verificar si se realizó la actualización correctamente
    if (result)
     {
      console.log(`Se actualizó correctamente el presupuesto`);
      // await connection.end(); // Cerrar la conexión a la base de datos
      return res.status(200).send({ mge: 'Presupuesto actualizado', ok: true });
    }
     else {
      // await connection.end(); // Cerrar la conexión a la base de datos
      return res.status(200).send({ mge: 'Error en la actualización', ok: false });
    }
  } catch (error) {
    console.error('Error al actualizar el presupuesto_anteproyecto:', error);
    return res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerPerfilPorCuil = async (req, res) => {
  const { cuil } = req.params;
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql();
      // Obtener el perfil_id correspondiente al cuil
      const [usuarios] = await connection.execute(
          'SELECT perfil_id FROM usuarios WHERE cuil = ?',
          [cuil]
      );

      if (usuarios.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const perfilId = usuarios[0].perfil_id;

      // Obtener la fila completa del perfil correspondiente al perfil_id
      const [perfiles] = await connection.execute(
          'SELECT * FROM perfiles WHERE perfil_id = ?',
          [perfilId]
      );

      if (perfiles.length === 0) {
          return res.status(404).json({ message: 'Perfil no encontrado' });
      }

      res.status(200).json(perfiles[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Algo salió mal :(' });
  } finally {
    if(connection){
      await connection.end();
    }
  }
};

const obtenerTiposDeInstrumentos = async (req,res) =>{
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = `SELECT *  FROM tipoinstrumento`;
    const [tiposDeInstrumentos] = await connection.execute(sqlQuery);

    res.status(200).json({ tiposDeInstrumentos });

  } catch (error) {

    res.status(500).json({ message: error.message || "Algo salió mal :(" });

  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}


const crearEstructuraItem = async (req,res)=>{
  let connection;
  try {
    const itemId = req.body.item;
    const ejercicioId = req.body.ejercicio;


    connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `CALL sp_nuevoitem(?,?)`;
    const [result] = await connection.execute(sqlQuery, [ejercicioId, itemId]);

   if (result)
   {
    res.status(200).send({mge:'operacion exitosa',ok:true});
   }

   

  } catch (error) {
    console.log(error);
    res.status(500).send('Error en el servidor');
  }finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const transferirEstructuraItem = async (req, res) => {
  let connection;
  try {
    const { presupuesto_id, itemorigen_id, itemdestino_id } = req.body;

    if (!presupuesto_id || !itemorigen_id || !itemdestino_id) {
      return res.status(400).send({ mge: 'Faltan parámetros', ok: false });
    }

    connection = await conectar_BD_GAF_MySql();
    let sqlQuery = `SELECT sp_transferirestructuracompleta(?, ?, ?)`;
    const [result] = await connection.execute(sqlQuery, [presupuesto_id, itemorigen_id, itemdestino_id]);

    if (result && result.length > 0 && result[0][`sp_transferirestructuracompleta(?, ?, ?)`] === 1) {
      res.status(200).send({ mge: 'Operación exitosa', ok: true });
    } else {
      res.status(200).send({ mge: 'El item destino no tiene estructura creada', ok: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error en el servidor');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


/////////////////////// PROVEDORES ////////////////////////////////

const obtenerProveedores = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de que esta función esté definida y se conecte correctamente a tu base de datos.

    // Consulta para obtener todos los proveedores
    const sqlProveedores = `
      SELECT * FROM proveedores
    `;
    const [proveedores] = await connection.execute(sqlProveedores);

    // Consulta para obtener todos los rubros asociados a cada proveedor
    const sqlProveedoresRubros = `
      SELECT r.proveedor_id, r.rubroprv_id, rb.rubroprv_det
      FROM r_proveedores_rubroprv r
      LEFT JOIN rubroprv rb ON r.rubroprv_id = rb.rubroprv_id
    `;
    const [proveedoresRubros] = await connection.execute(sqlProveedoresRubros);

    // Enviar los resultados como respuesta
    res.status(200).json({ proveedores, proveedoresRubros });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const editarProveedor = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    // Datos recibidos desde el request
    const {
      proveedor_id,
      proveedor_razsocial,
      proveedor_cuit,
      proveedor_domicilio,
      proveedor_email,
      proveedor_iva,
      proveedor_nroreso,
      proveedor_anioreso,
      proveedor_telefono,
      proveedor_contacto,
      idRubro,
    } = req.body.proveedorEditado;

    const obj = req.body.selectedRubro;
    const ids = Object.values(obj); // Array de rubroprv_id

    // Iniciar una transacción
    await connection.beginTransaction();

    // Actualizar el proveedor
    const sqlUpdateProveedor = `
      UPDATE proveedores
      SET proveedor_razsocial = ?, proveedor_cuit = ?, proveedor_domicilio = ?, proveedor_email = ?, proveedor_iva = ?, proveedor_nroreso = ?, proveedor_anioreso = ?,proveedor_telefono=?,proveedor_contacto=?,proveedor_compras=?
      WHERE proveedor_id = ?
    `;

    const [result] = await connection.execute(sqlUpdateProveedor, [
      proveedor_razsocial.toUpperCase(),
      proveedor_cuit,
      proveedor_domicilio.toUpperCase(),
      proveedor_email,
      proveedor_iva,
      proveedor_nroreso,
      proveedor_anioreso,
      proveedor_telefono,
      proveedor_contacto,
      1,
      proveedor_id,
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      return res.status(404).json({ message: "Proveedor no encontrado", ok: false });
    }

    // Obtener los rubros actuales del proveedor
    const [existingRubros] = await connection.execute(
      `SELECT rubroprv_id FROM r_proveedores_rubroprv WHERE proveedor_id = ?`,
      [proveedor_id]
    );

    const existingRubrosArray = existingRubros.map(row => row.rubroprv_id);

    // Actualizar, eliminar o insertar filas en r_proveedores_rubroprv según sea necesario
    for (let i = 0; i < existingRubrosArray.length; i++) {
      if (i < ids.length) {
        // Actualizar la fila si el rubroprv_id ha cambiado
        if (existingRubrosArray[i] !== ids[i]) {
          await connection.execute(
            `UPDATE r_proveedores_rubroprv SET rubroprv_id = ? WHERE proveedor_id = ? AND rubroprv_id = ?`,
            [ids[i], proveedor_id, existingRubrosArray[i]]
          );
        }
      } else {
        // Eliminar fila extra si hay más filas en la base de datos que rubros enviados
        await connection.execute(
          `DELETE FROM r_proveedores_rubroprv WHERE proveedor_id = ? AND rubroprv_id = ?`,
          [proveedor_id, existingRubrosArray[i]]
        );
      }
    }

    // Insertar nuevas filas si hay más rubros enviados que filas existentes
    for (let i = existingRubrosArray.length; i < ids.length; i++) {
      await connection.execute(
        `INSERT INTO r_proveedores_rubroprv (proveedor_id, rubroprv_id) VALUES (?, ?)`,
        [proveedor_id, ids[i]]
      );
    }

    // Confirmar la transacción si todo fue exitoso
    await connection.commit();

    res.status(200).json({ message: "Proveedor y rubros actualizados correctamente", ok: true });
  } catch (error) {
    console.error('Error al actualizar el proveedor y los rubros:', error);
    if (connection) await connection.rollback(); // Deshacer la transacción en caso de error
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const agregarProveedor = async (req, res) => {
  let connection;
  console.log(req.body);
  try {
    connection = await conectar_BD_GAF_MySql();

    // Datos recibidos desde el request
    const { razonSocial, cuit, domicilio, email, iva, nroreso, anioreso,telefono,contacto } = req.body.nuevoProveedor;
    const obj = req.body.selectedRubro;
    const ids = Object.values(obj);

    // Iniciar una transacción
    await connection.beginTransaction();

    // Consulta para insertar un nuevo proveedor
    const sqlInsertProveedor = `
      INSERT INTO proveedores (proveedor_razsocial, proveedor_cuit, proveedor_domicilio, proveedor_email, proveedor_iva, proveedor_nroreso, proveedor_anioreso,proveedor_telefono,proveedor_contacto, proveedor_registro, proveedor_compras)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const {fecha_actual} =  await obtenerFechaDelServidor()
    const noRegistrado =  req.body.no_registrado
    
    // Ejecución de la consulta con los valores a insertar
    const [result] = await connection.execute(sqlInsertProveedor, [
      razonSocial.toUpperCase(),
      cuit,
      domicilio.toUpperCase(),
      email,
      iva,
      nroreso,
      anioreso,
      telefono,
      contacto,
      fecha_actual,
      noRegistrado ? 0 : 1
    ]);

    // Verificar si alguna fila fue afectada (es decir, si el proveedor fue insertado)
    if (result.affectedRows === 0) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      return res.status(400).json({ message: "No se pudo agregar el proveedor", ok: false });
    }

    // Obtener el ID del proveedor insertado
    const proveedorId = result.insertId;

    // Consulta para insertar en la tabla r_proveedores_rubroprv
    const sqlInsertRubroProveedor = `
      INSERT INTO r_proveedores_rubroprv (proveedor_id, rubroprv_id)
      VALUES (?, ?)
    `;

    // Ejecutar la consulta para cada rubroprv_id
    for (const idRubro of ids) {
      const [resultRubro] = await connection.execute(sqlInsertRubroProveedor, [proveedorId, idRubro]);

      // Verificar si la inserción en r_proveedores_rubroprv fue exitosa
      if (resultRubro.affectedRows === 0) {
        await connection.rollback(); // Deshacer la transacción en caso de error
        return res.status(400).json({ message: "No se pudo agregar el rubro al proveedor", ok: false });
      }
    }

    // Confirmar la transacción si todo fue exitoso
    await connection.commit();

    res.status(201).json({ message: "Proveedor y rubros agregados correctamente", ok: true, id: proveedorId });
  } catch (error) {
    console.error('Error al agregar el proveedor y los rubros:', error);
    if (connection) await connection.rollback(); // Deshacer la transacción en caso de error
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const eliminarProveedor = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conectar a la base de datos

    // Obtener el ID del proveedor a eliminar desde el request
    const proveedor_id = req.params.idEliminar;

    // Iniciar una transacción
    await connection.beginTransaction();

    // Consulta para eliminar las filas en r_proveedores_rubroprv que contengan el proveedor_id
    const sqlDeleteRubroProveedor = `
      DELETE FROM r_proveedores_rubroprv
      WHERE proveedor_id = ?
    `;
    await connection.execute(sqlDeleteRubroProveedor, [proveedor_id]);

    // Consulta para eliminar el proveedor
    const sqlDeleteProveedor = `
      DELETE FROM proveedores
      WHERE proveedor_id = ?
    `;

    // Ejecución de la consulta con el ID del proveedor
    const [result] = await connection.execute(sqlDeleteProveedor, [proveedor_id]);

    // Verificar si alguna fila fue afectada (es decir, si el proveedor fue eliminado)
    if (result.affectedRows === 0) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      return res.status(404).json({ message: "Proveedor no encontrado", ok: false });
    }

    // Confirmar la transacción si todo fue exitoso
    await connection.commit();

    res.status(200).json({ message: "Proveedor y rubros asociados eliminados correctamente", ok: true });
  } catch (error) {
    console.error('Error al eliminar el proveedor:', error);
    if (connection) await connection.rollback(); // Deshacer la transacción en caso de error
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const obtenerRubros = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de que esta función esté definida y se conecte correctamente a tu base de datos.

    // Consulta para obtener todos los proveedores
    const sqlQuery = `SELECT * FROM rubroprv`;
    const [rubros] = await connection.execute(sqlQuery);

    // Enviar los resultados como respuesta
    res.status(200).json({ rubros });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const agregarRubro = async (req, res) => {
  let connection;
 
  try {
    connection = await conectar_BD_GAF_MySql();

    // Datos recibidos desde el request
    const { rubro, codigo } = req.body;

    // Verificar si ya existe un rubro con el mismo código
    const sqlCheckCodigo = `SELECT COUNT(*) as count FROM rubroprv WHERE rubroprv_afip = ?`;
    const [rows] = await connection.execute(sqlCheckCodigo, [codigo]);

    // Si el código ya existe, retornamos un error
    if (rows[0].count > 0) {
      return res.status(200).json({ message: "El código ya existe, no se puede agregar el rubro", ok: false });
    }

    // Si el código no existe, procedemos con la inserción
    const sqlInsertRubro = `
      INSERT INTO rubroprv (rubroprv_det, rubroprv_afip) VALUES (?, ?)
    `;

    // Ejecución de la consulta con los valores a insertar
    const [result] = await connection.execute(sqlInsertRubro, [rubro.toUpperCase(), codigo]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo agregar el rubro", ok: false });
    }

    res.status(201).json({ message: "Rubro agregado correctamente", ok: true });
  } catch (error) {
    console.error('Error al agregar el rubro', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const buscarProveedorPorCuit = async (req, res) => {
  const { cuit } = req.params; // CUIT enviado como parámetro en la URL
  let connection;
  try {
     connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos
    // Consultar en la tabla proveedores si existe un proveedor con el cuit dado
    const [proveedores] = await connection.execute(
      'SELECT * FROM proveedores WHERE proveedor_cuit = ?',
      [cuit]
    );

    // Si no se encuentra ningún proveedor, devolver un error 404
    if (proveedores.length === 0) {
      return res.status(200).json({ message: 'Proveedor no encontrado',ok:false });
    }

    // Devolver la fila completa del proveedor encontrado
    res.status(200).json({proveedor:proveedores[0],ok:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Algo salió mal :(' });
  } finally {
    if (connection) {
      await connection.end(); // Cerrar la conexión a la base de datos
    }
  }
};


/////////////////////// NOMENCLADORES ////////////////////////////////

const obtenerNomencladores = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    // Consulta para obtener los nomencladores y realizar el JOIN con la tabla partidas
    const sqlNomencladores = `
      SELECT n.nomenclador_id, n.nomenclador_det, n.partida_id, 
             p.partida_codigo, p.partida_det
      FROM nomenclador n
      LEFT JOIN partidas p ON n.partida_id = p.partida_id
      ORDER BY n.nomenclador_det ASC
    `;

    // Ejecutar la consulta
    const [nomencladores] = await connection.execute(sqlNomencladores);

    // Enviar los resultados como respuesta
    res.status(200).json({ nomencladores });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al obtener los nomencladores:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerNomencladoresPorPartida = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos
    const partidaId  = req.query.partidaId;
    // Consulta para obtener los nomencladores y realizar el JOIN con la tabla partidas
    const sqlNomencladores = `
      SELECT *
      FROM nomenclador
      WHERE nomenclador.partida_id = ${partidaId}
      ORDER BY nomenclador.nomenclador_det ASC
    `;

    // Ejecutar la consulta
    const [nomencladores] = await connection.execute(sqlNomencladores);

    // Enviar los resultados como respuesta
    res.status(200).json({ nomencladores });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al obtener los nomencladores:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerEncuadres = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    // Consulta para obtener los nomencladores y realizar el JOIN con la tabla partidas
    const sqlEncuadres = `
      SELECT * FROM encuadrelegal`;

    // Ejecutar la consulta
    const [encuadres] = await connection.execute(sqlEncuadres);

    // Enviar los resultados como respuesta
    res.status(200).json({ encuadres });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al obtener los encuadres:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerTiposDeCompras = async (req,res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    // Consulta para obtener los nomencladores y realizar el JOIN con la tabla partidas
    const sqlEncuadres = `
      SELECT * FROM tipocompra`;

    // Ejecutar la consulta
    const [tiposDeCompras] = await connection.execute(sqlEncuadres);

    // Enviar los resultados como respuesta
    res.status(200).json({ tiposDeCompras });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al obtener los tipos de compra:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
}

const agregarNomenclador = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de que esta función se conecte correctamente a tu base de datos

    // Datos recibidos desde el request
    const { nomenclador_det, partida_id } = req.body;
console.log(req.body);
    // Verificar que los campos requeridos estén presentes
    if (!nomenclador_det || !partida_id) {
      return res.status(400).json({ message: "Todos los campos son requeridos", ok: false });
    }

    // Consulta para insertar un nuevo nomenclador
    const sqlInsertNomenclador = `
      INSERT INTO nomenclador (nomenclador_det, partida_id)
      VALUES (?, ?)
    `;

    // Ejecutar la consulta con los valores a insertar
    const [result] = await connection.execute(sqlInsertNomenclador, [nomenclador_det.toUpperCase(), partida_id]);

    // Verificar si la inserción fue exitosa
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo agregar el nomenclador", ok: false });
    }

    res.status(201).json({ message: "Nomenclador agregado correctamente", ok: true });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al agregar el nomenclador:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const editarNomenclador = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de tener esta función para conectar a la base de datos

    // Datos recibidos desde el request
    const { nomenclador_id, nomenclador_det, partida_id } = req.body;

    // Verificar que los campos requeridos estén presentes
    if (!nomenclador_id || !nomenclador_det || !partida_id) {
      return res.status(400).json({ message: "Todos los campos son requeridos", ok: false });
    }

    // Consulta para actualizar el nomenclador
    const sqlUpdateNomenclador = `
      UPDATE nomenclador
      SET nomenclador_det = ?, partida_id = ?
      WHERE nomenclador_id = ?
    `;

    // Ejecutar la consulta con los nuevos valores
    const [result] = await connection.execute(sqlUpdateNomenclador, [nomenclador_det.toUpperCase(), partida_id, nomenclador_id]);

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nomenclador no encontrado", ok: false });
    }

    res.status(200).json({ message: "Nomenclador actualizado correctamente", ok: true });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al actualizar el nomenclador:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const eliminarNomenclador = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de que esta función se conecte correctamente a tu base de datos

    // Obtener el nomenclador_id desde los parámetros de la URL
    const  nomenclador_id  = req.params.idEliminar;

    // Verificar que el nomenclador_id esté presente
    if (!nomenclador_id) {
      return res.status(400).json({ message: "El ID del nomenclador es requerido", ok: false });
    }

    // Consulta para eliminar el nomenclador por su ID
    const sqlEliminarNomenclador = `
      DELETE FROM nomenclador WHERE nomenclador_id = ?
    `;

    // Ejecutar la consulta para eliminar
    const [result] = await connection.execute(sqlEliminarNomenclador, [nomenclador_id]);

    // Verificar si la eliminación fue exitosa
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nomenclador no encontrado o no se pudo eliminar", ok: false });
    }

    res.status(200).json({ message: "Nomenclador eliminado correctamente", ok: true });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al eliminar el nomenclador:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


//////////////////////////ENCUADRE LEGAL ///////////////////////////////////////

const obtenerEncuadresLegales = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    const sqlEncuadresLegales = `SELECT * FROM encuadrelegal`;
    const [encuadres] = await connection.execute(sqlEncuadresLegales);

    if (encuadres.length > 0) {
      res.status(200).json({ encuadres });
    } else {
      res.status(204).json({ message: "No hay datos disponibles" });
    }
  } catch (error) {
    console.error('Error al obtener los encuadres legales:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerTiposCompra = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    const sqlTiposCompra = `SELECT * FROM tipocompra`;
    const [tiposCompra] = await connection.execute(sqlTiposCompra);

    if (tiposCompra.length > 0) {
      res.status(200).json({ tiposCompra });
    } else {
      res.status(204).json({ message: "No hay datos disponibles" });
    }
  } catch (error) {
    console.error('Error al obtener los tipos de compra:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const agregarEncuadreLegal = async (req, res) => { 
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    const { encuadrelegal_det, encuadrelegal_nombre, tipocompra_id, encuadrelegal_montodesde, encuadrelegal_montohasta } = req.body;

    // Validación de campos requeridos
    if (!encuadrelegal_det || !encuadrelegal_nombre || !tipocompra_id || encuadrelegal_montodesde == null || encuadrelegal_montohasta == null) {
      return res.status(400).json({ message: "Todos los campos son requeridos", ok: false });
    }

    const sqlInsertEncuadre = `
      INSERT INTO encuadrelegal (encuadrelegal_det, encuadrelegal_nombre, tipocompra_id, encuadrelegal_montodesde, encuadrelegal_montohasta)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(sqlInsertEncuadre, [
      encuadrelegal_det.toUpperCase(),
      encuadrelegal_nombre.toUpperCase(),
      tipocompra_id,
      encuadrelegal_montodesde,
      encuadrelegal_montohasta
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo agregar el encuadre legal", ok: false });
    }

    res.status(201).json({ message: "Encuadre legal agregado correctamente", ok: true });
  } catch (error) {
    console.error('Error al agregar el encuadre legal:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


const editarEncuadreLegal = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    const { encuadrelegal_id, encuadrelegal_det, encuadrelegal_nombre, tipocompra_id, encuadrelegal_montodesde, encuadrelegal_montohasta } = req.body;

    // Validación de campos requeridos
    if (!encuadrelegal_id || !encuadrelegal_det || !encuadrelegal_nombre || !tipocompra_id || encuadrelegal_montodesde == null || encuadrelegal_montohasta == null) {
      return res.status(400).json({ message: "Todos los campos son requeridos", ok: false });
    }

    const sqlUpdateEncuadre = `
      UPDATE encuadrelegal
      SET encuadrelegal_det = ?, encuadrelegal_nombre = ?, tipocompra_id = ?, encuadrelegal_montodesde = ?, encuadrelegal_montohasta = ?
      WHERE encuadrelegal_id = ?
    `;

    const [result] = await connection.execute(sqlUpdateEncuadre, [
      encuadrelegal_det.toUpperCase(),
      encuadrelegal_nombre.toUpperCase(),
      tipocompra_id,
      encuadrelegal_montodesde,
      encuadrelegal_montohasta,
      encuadrelegal_id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Encuadre legal no encontrado", ok: false });
    }

    res.status(200).json({ message: "Encuadre legal actualizado correctamente", ok: true });
  } catch (error) {
    console.error('Error al actualizar el encuadre legal:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


const eliminarEncuadreLegal = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    const { idEliminar } = req.params;

    if (!idEliminar) {
      return res.status(400).json({ message: "El ID del encuadre legal es requerido", ok: false });
    }

    const sqlEliminarEncuadre = `
      DELETE FROM encuadrelegal WHERE encuadrelegal_id = ?
    `;

    const [result] = await connection.execute(sqlEliminarEncuadre, [idEliminar]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Encuadre legal no encontrado", ok: false });
    }

    res.status(200).json({ message: "Encuadre legal eliminado correctamente", ok: true });
  } catch (error) {
    console.error('Error al eliminar el encuadre legal:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerDatosItem = async (req,res) =>{
  let connection;
  const itemId = req.query.itemId;
  console.log(itemId);
  
  try {
    connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos

    const sql = `SELECT * FROM item AS it JOIN anexo AS a ON it.anexo_id = a.anexo_id JOIN finalidad AS f ON it.finalidad_id = f.finalidad_id JOIN funcion AS fun ON it.funcion_id = fun.funcion_id WHERE item_id = ?`;
    const [info] = await connection.execute(sql,[itemId]);

    if (info.length > 0) {
      res.status(200).json({ info });
    } else {
      res.status(204).json({ message: "No hay datos disponibles" });
    }
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}


module.exports = {
  listarAnexos,
  agregarAnexo,
  editarAnexo,
  borrarAnexo,
  listarFinalidades,
  agregarFinalidad,
  editarFinalidad,
  borrarFinalidad,
  listarFunciones,
  agregarFuncion,
  editarFuncion,
  borrarFuncion,
  listarItems,
  agregarItem,
  editarItem,
  borrarItem,
  listarPartidas,
  listarPartidasConCodigo,
  agregarPartida,
  editarPartida,
  borrarPartida,
  agregarEjercicio,
  editarEjercicio,
  borrarEjercicio,
  listarTiposDeMovimientos,
  listarOrganismos,
  agregarExpediente,
  buscarExpediente,
  obtenerDetPresupuestoPorItemYpartida,
  agregarMovimiento,
  listarPartidasCONCAT,
  partidaExistente,
  listarEjercicio,
  listarAnteproyecto,
  actualizarPresupuestoAnteproyecto,
  actualizarCredito,
  actualizarPresupuestoAprobado,
  modificarMovimiento,
  obtenerPartidasPorItemYMovimiento,
  editarDetalleMovimiento,
  acumular,
  buscarExpedienteParaModificarDefinitiva,
  agregarMovimientoDefinitivaPreventiva,
  obtenerPresupuestosParaMovimientoPresupuestario,
  obtenerPerfilPorCuil,
  actualizarCreditoCompleto,
  actualizarPresupuestoAprobadoCompleto,
  listarItemsFiltrado,
  obtenerTiposDeInstrumentos,
  obtenerSaldoPorDetPresupuestoID,
  obtenerProveedores,
  editarProveedor,
  agregarProveedor,
  eliminarProveedor,
  obtenerRubros,
  agregarRubro,
  crearEstructuraItem,
  listarItemsSinPartidas,
  obtenerProveedor,
  agregarMovimientoPorTransferenciaDePartidas,
  modificarMovimientoParaTransferenciaEntrePartidas,
  buscarExpedienteParaModificarPorTransferenciaEntrePartidas,
  obtenerNomencladores,
  agregarNomenclador,editarNomenclador,eliminarNomenclador,listarPartidasConCodigoGasto,buscarExpedienteParaModificarNomenclador, obtenerEncuadres,
 obtenerEncuadresLegales,agregarEncuadreLegal,editarEncuadreLegal,eliminarEncuadreLegal, modificarMovimientoAltaDeCompromiso, obtenerTiposDeCompras,obtenerDatosItem,

 obtenerMovimientoReserva, obtenerMovimientoCompromiso, registroCompromisoAlta, obtenerArchivo,modificarAltaDeCompromiso, modificarDefinitiva, obtenerLibramiento,buscarProveedorPorCuit, registroCompromisoAltaSinArchivo, agregarMovimientoCompromiso, agregarMovimientoDefinitivaPreventivaSinArchivo, chequearSiElExpedienteExisteAntesDeIniciarUnaReservaNueva, obtenerNomencladoresPorPartida, transferirEstructuraItem, buscarExpedienteAnulacion, anularMovimiento

};






