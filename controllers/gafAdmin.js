const { conectar_BD_GAF_MySql, conectarBDEstadisticasMySql } = require("../config/dbEstadisticasMYSQL");

const listarTipoUsuario = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = "SELECT * FROM tipo_usuario";
    const [tusuarios] = await connection.execute(sqlQuery);

    res.status(200).json({ tusuarios });
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

const listarPermisosTU = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    const { id_tusuario } = req.params;

    if (!id_tusuario) {
      throw new Error("El parámetro id_tusuario es requerido");
    }

    let sqlQuery = "SELECT pt.*, p.descripcion, o.nombre_opcion FROM permiso_tusuario pt LEFT JOIN proceso p ON pt.id_proceso = p.id_proceso LEFT JOIN opcion o ON p.id_opcion = o.id_opcion WHERE pt.id_tusuario = ? ORDER BY o.id_opcion, p.descripcion";
    const [procesos] = await connection.execute(sqlQuery, [id_tusuario]);

    res.status(200).json({ procesos });
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

const agregarTipoUsuario = async (req, res) => {
  let connection;
  try {
    const { nombre_tusuario, observacion, habilita } = req.body;

    // Verificar que los valores requeridos estén definidos
    if (
      nombre_tusuario === undefined ||
      observacion === undefined ||
      habilita === undefined
    ) {
      throw new Error("Los parámetros de la solicitud son inválidos");
    }

    connection = await conectar_BD_GAF_MySql();

    // Query para insertar un nuevo tipo de usuario
    const sqlQuery =
      "INSERT INTO tipo_usuario (nombre_tusuario, observacion, habilita) VALUES (?, ?, ?)";
    const values = [nombre_tusuario, observacion, habilita];
    const [result] = await connection.execute(sqlQuery, values);

    res
      .status(201)
      .json({
        message: "Tipo de usuario creado con éxito",
        id: result.insertId,
      });
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

const editarTipoUsuario = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nombre_tusuario, observacion, habilita } = req.body;

    // Verificar que los valores requeridos estén definidos
    if (
      nombre_tusuario === undefined ||
      observacion === undefined ||
      habilita === undefined
    ) {
      throw new Error("Los parámetros de la solicitud son inválidos");
    }

    connection = await conectar_BD_GAF_MySql();

    // Query para actualizar un tipo de usuario
    const sqlQuery =
      "UPDATE tipo_usuario SET nombre_tusuario = ?, observacion = ?, habilita = ? WHERE id_tusuario = ?";
    const values = [nombre_tusuario, observacion, habilita, id];
    await connection.execute(sqlQuery, values);

    res.status(200).json({ message: "Tipo de usuario actualizado con éxito" });
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

const eliminarTipoUsuario = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await conectar_BD_GAF_MySql();

    // Query para eliminar un tipo de usuario
    const sqlQuery = "DELETE FROM tipo_usuario WHERE id_tusuario = ?";
    await connection.execute(sqlQuery, [id]);

    res.status(200).json({ message: "Tipo de usuario eliminado con éxito" });
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

const actualizarPermisosTU = async (req, res) => {
    let connection;
    try {
      const { usuarioId } = req.params;
      const { permisos } = req.body;    

      console.log(permisos) 
  
      if (!Array.isArray(permisos) || permisos.length === 0) {
        throw new Error("El cuerpo de la solicitud debe ser un array de permisos");
      }
  
      connection = await conectar_BD_GAF_MySql();
  
      // Iniciar una transacción
      await connection.beginTransaction();
  
      for (const permiso of permisos) {
        const { id_permiso_tusuario, ver } = permiso;
  
        // Verificar que los valores requeridos estén definidos
        if (id_permiso_tusuario === undefined || ver === undefined) {
          throw new Error("Los parámetros de la solicitud son inválidos");
        }
  
        // Query para actualizar el campo 'ver' de un permiso de usuario
        const sqlQuery = "UPDATE permiso_tusuario SET ver = ? WHERE id_permiso_tusuario = ? AND id_tusuario = ?";
        const values = [ver, id_permiso_tusuario, usuarioId];
        await connection.execute(sqlQuery, values);
      }
  
      // Confirmar la transacción
      await connection.commit();
  
      res.status(200).json({ message: "Permisos actualizados con éxito" });
    } catch (error) {
      console.log(error);
      if (connection) {
        // Revertir la transacción en caso de error
        await connection.rollback();
      }
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    } finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
};

const listarUsuarios = async (req, res) => {
    let connectionGAF, connectionEstadisticas;
    try {
        // Conectar a la base de datos GAF
        connectionGAF = await conectar_BD_GAF_MySql();
        const sqlQueryGAF = "SELECT * FROM usuarios";
        const [usuarios] = await connectionGAF.execute(sqlQueryGAF);

        // Conectar a la base de datos Estadisticas
        connectionEstadisticas = await conectarBDEstadisticasMySql();
        const sqlQueryEstadisticas = `
            SELECT e.*, p.nombre_persona, p.apellido_persona, p.documento_persona, p.id_persona
            FROM empleado e 
            LEFT JOIN persona p ON e.id_persona = p.id_persona
        `;
        const [empleados] = await connectionEstadisticas.execute(sqlQueryEstadisticas);

        // Normalizar y mapear datos
        const usuariosCompletos = usuarios.map(usuario => {
            const documento = usuario.cuil ? usuario.cuil.toString().trim() : '';

            // Buscar el empleado correspondiente
            const empleadoCorrespondiente = empleados.find(empleado => {
                const cuil = empleado.documento_persona ? empleado.documento_persona.toString().trim() : '';
                return cuil === documento;
            });

            // Si se encontró un empleado, combinar los datos
            if (empleadoCorrespondiente) {
                return {
                    ...usuario,
                    nombre_persona: empleadoCorrespondiente.nombre_persona,
                    apellido_persona: empleadoCorrespondiente.apellido_persona,
                    documento_persona: empleadoCorrespondiente.documento_persona,
                    id_persona: empleadoCorrespondiente.id_persona
                };
            }

            // Si no hay coincidencia, devolver solo el usuario sin modificarlo
            return usuario;
        });

        res.status(200).json(usuariosCompletos);
    } catch (error) {
        console.error("❌ Error al listar usuarios:", error);
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
    } finally {
        // Cerrar las conexiones a las bases de datos
        if (connectionGAF) await connectionGAF.end();
        if (connectionEstadisticas) await connectionEstadisticas.end();
    }
};

const verificarEmpleado = async (req, res) => {
    const { afiliado } = req.params;
    let connection;
    try {
      connection = await conectarBDEstadisticasMySql();

      const sqlQuery = "SELECT * FROM empleado WHERE afiliado = ?";
      const [resultado] = await connection.execute(sqlQuery, [afiliado]);

      if (resultado.length > 0) {
        res.status(200).json({ resultado });
      } else {
        res.status(404).json({ message: "Empleado no existe o no está registrado en CIDITUC" });
      }
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

const agregarUsuario = async (req, res) => {
    let connection;
    try {
        const { cuil, perfil_id } = req.body;

        if (!cuil || !perfil_id) {
            return res.status(400).json({ message: "Los parámetros de la solicitud son inválidos" });
        }

        connection = await conectar_BD_GAF_MySql();

        // Verificar si el usuario ya existe
        const sqlCheck = "SELECT COUNT(*) AS count FROM usuarios WHERE cuil = ?";
        const [rows] = await connection.execute(sqlCheck, [cuil]);

        if (rows[0].count > 0) {
            return res.status(400).json({ message: "Este usuario ya existe" });
        }

        // Si no existe, proceder con el INSERT
        const sqlInsert = "INSERT INTO usuarios (cuil, perfil_id) VALUES (?, ?)";
        const [result] = await connection.execute(sqlInsert, [cuil, perfil_id]);

        res.status(201).json({
            message: "Usuario creado con éxito",
            id: result.insertId,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Algo salió mal :(" });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

const listarPermisosU = async (req, res) => {
    let connection;
    try {
      connection = await conectar_BD_GAF_MySql();

      const { id_persona, perfil_id } = req.body;

      if (!id_persona) {
        throw new Error("El parámetro id_persona es requerido");
      }
      if (!perfil_id) {
        throw new Error("El parámetro perfil_id es requerido");
      }

      const sqlQuery1 = "SELECT pp.*, p.descripcion, o.nombre_opcion FROM permiso_persona pp LEFT JOIN proceso p ON pp.id_proceso = p.id_proceso LEFT JOIN opcion o ON p.id_opcion = o.id_opcion WHERE id_persona = ?";
      const [procesos] = await connection.execute(sqlQuery1, [id_persona]);
      const sqlQuery2 = "SELECT pt.*, p.descripcion, o.nombre_opcion FROM permiso_tusuario pt LEFT JOIN proceso p ON pt.id_proceso = p.id_proceso LEFT JOIN opcion o ON p.id_opcion = o.id_opcion WHERE pt.id_tusuario = ? ORDER BY o.id_opcion, p.descripcion";
      const [procesosTU] = await connection.execute(sqlQuery2, [perfil_id]);

      if (procesos.length > 0) {
        res.status(200).json({ procesos });
      } else {
        res.status(201).json({ procesosTU });
      }

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

const actualizarPermisosU = async (req, res) => {
    let connection;
    try {
      const { usuarioId } = req.params;
      const { permisos } = req.body;    

      if (!Array.isArray(permisos) || permisos.length === 0) {
        throw new Error("El cuerpo de la solicitud debe ser un array de permisos");
      }
      connection = await conectar_BD_GAF_MySql();
      // Iniciar una transacción
      await connection.beginTransaction();

      const sqlQuery = "SELECT * FROM permiso_persona WHERE id_persona = ?";
      const [procesos] = await connection.execute(sqlQuery, [usuarioId]);

      if (procesos.length > 0) {
        console.log('entro a actualizar')
        for (const permiso of permisos) {
            const { id_permiso_persona, ver } = permiso;
            // Verificar que los valores requeridos estén definidos
            if (id_permiso_persona === undefined || ver === undefined) {
                throw new Error("Los parámetros de la solicitud son inválidos");
            }
            // Query para actualizar el campo 'ver' de un permiso de usuario
            const sqlQuery1 = "UPDATE permiso_persona SET ver = ? WHERE id_permiso_persona = ? AND id_persona = ?";
            const values = [ver, id_permiso_persona, usuarioId];
            await connection.execute(sqlQuery1, values);
        }
    } else {
        console.log('entro a crear')
        console.log(permisos)
        for (const permiso of permisos) {
            const { id_proceso, ver, agregar, modificar, habilita } = permiso;

            // Insertar un nuevo permiso si no existe
            const sqlQuery2 = `
                INSERT INTO permiso_persona (id_proceso, id_persona, ver, agregar, modificar, habilita) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(sqlQuery2, [id_proceso, usuarioId, ver, agregar, modificar, habilita]);
        }
    }

    // Confirmar la transacción
    await connection.commit();

    res.status(200).json({ message: "Permisos actualizados con éxito" });
    } catch (error) {
      console.log(error);
      if (connection) {
        // Revertir la transacción en caso de error
        await connection.rollback();
      }
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    } finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
};

const listarProcesos = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = "SELECT * FROM proceso";
    const [procesos] = await connection.execute(sqlQuery);

    res.status(200).json({ procesos });
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

const agregarProceso = async (req, res) => {
    let connection;
    try {
        const { id_opcion, nombre_proceso, descripcion } = req.body;

        if (!id_opcion || !nombre_proceso || !descripcion) {
            throw new Error("Todos los campos (id_opcion, nombre_proceso, descripcion) son obligatorios");
        }

        connection = await conectar_BD_GAF_MySql();
        await connection.beginTransaction();

        // 1️⃣ Insertar en la tabla `proceso`
        const sqlInsertProceso = `
            INSERT INTO proceso (id_opcion, nombre_proceso, descripcion, habilita) 
            VALUES (?, ?, ?, 1)
        `;
        const [resultProceso] = await connection.execute(sqlInsertProceso, [id_opcion, nombre_proceso, descripcion]);

        const id_proceso = resultProceso.insertId; // ID del proceso recién creado

        // 2️⃣ Obtener todos los tipos de usuario (id_tusuario)
        const sqlGetTiposUsuario = `SELECT id_tusuario FROM tipo_usuario`;
        const [tiposUsuario] = await connection.execute(sqlGetTiposUsuario);

        if (tiposUsuario.length === 0) {
            throw new Error("No hay tipos de usuario registrados en la base de datos.");
        }

        // 3️⃣ Insertar en `permiso_tusuario` para cada tipo de usuario
        for (const { id_tusuario } of tiposUsuario) {
            const sqlInsertPermisoTUsuario = `
                INSERT INTO permiso_tusuario (id_tusuario, id_proceso, ver, agregar, modificar, habilita) 
                VALUES (?, ?, 0, 0, 0, 1)
            `;
            await connection.execute(sqlInsertPermisoTUsuario, [id_tusuario, id_proceso]);
        }

        // 4️⃣ Obtener todos los usuarios registrados en `permiso_persona`
        const sqlGetUsuarios = `SELECT DISTINCT id_persona FROM permiso_persona`;
        const [usuarios] = await connection.execute(sqlGetUsuarios);

        if (usuarios.length > 0) {
            // 5️⃣ Insertar en `permiso_persona` para cada usuario registrado
            for (const { id_persona } of usuarios) {
                const sqlInsertPermisoPersona = `
                    INSERT INTO permiso_persona (id_persona, id_proceso, ver, agregar, modificar, habilita) 
                    VALUES (?, ?, 0, 0, 0, 1)
                `;
                await connection.execute(sqlInsertPermisoPersona, [id_persona, id_proceso]);
            }
        }

        // ✅ Confirmar la transacción
        await connection.commit();
        res.status(201).json({ message: "Proceso y permisos creados con éxito" });

    } catch (error) {
        console.log("❌ Error:", error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ message: error.message || "Algo salió mal :(" });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

const deshabilitarProceso = async (req, res) => {
    let connection;
    try {
        const { id_proceso } = req.params;

        if (!id_proceso) {
            throw new Error("El id_proceso es obligatorio");
        }

        connection = await conectar_BD_GAF_MySql();
        await connection.beginTransaction();

        // ✅ Actualizar el campo 'ver' a 0 en la tabla 'proceso'
        const sqlUpdateProceso = `
            UPDATE proceso 
            SET habilita = 0 
            WHERE id_proceso = ?
        `;
        const [result] = await connection.execute(sqlUpdateProceso, [id_proceso]);

        if (result.affectedRows === 0) {
            throw new Error("El proceso no existe o ya está deshabilitado");
        }

        // ✅ Confirmar la transacción
        await connection.commit();
        res.status(200).json({ message: "Proceso deshabilitado con éxito" });

    } catch (error) {
        console.log("❌ Error:", error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ message: error.message || "Algo salió mal :(" });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

const  editarProceso = async (req, res) => {
  let connection;
  try {
      const { id_proceso } = req.params;
      const { nombre_proceso, descripcion, id_opcion } = req.body;

      if (!id_proceso || !nombre_proceso || !descripcion || !id_opcion) {
          return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      connection = await conectar_BD_GAF_MySql();

      const sqlQuery = `
          UPDATE proceso 
          SET nombre_proceso = ?, descripcion = ?, id_opcion = ? 
          WHERE id_proceso = ?`;
      const values = [nombre_proceso, descripcion, id_opcion, id_proceso];

      const [result] = await connection.execute(sqlQuery, values);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "No se encontró el proceso con ese ID" });
      }

      res.status(200).json({ message: "Proceso editado con éxito" });

  } catch (error) {
      console.error("❌ Error al editar proceso:", error);
      res.status(500).json({ message: "Error interno del servidor" });

  } finally {
      if (connection) {
          await connection.end();
      }
  }
};


const listarOpciones = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    let sqlQuery = "SELECT * FROM opcion";
    const [opciones] = await connection.execute(sqlQuery);

    res.status(200).json({ opciones });
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

module.exports = {
    listarUsuarios,
    listarProcesos,
    listarOpciones,
    listarTipoUsuario,
    agregarTipoUsuario,
    editarTipoUsuario,
    eliminarTipoUsuario,
    listarPermisosTU,
    actualizarPermisosTU,
    verificarEmpleado,
    agregarUsuario,
    listarPermisosU,
    actualizarPermisosU,
    agregarProceso,
    deshabilitarProceso,
    editarProceso
};
