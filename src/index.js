import { configuraciones } from "./config/config.js";
import app from "./utils/app.js";
import { pool, poolPostgress } from "./utils/connection.js";
import { PORT } from "./config/configDeploy.js";
import http from "http";
import { WebSocketServer } from "ws";

async function InitServer() {
  console.log(configuraciones.NOMBREAPP, "....");
  try {
    console.log("Iniciando la Conección de la base de datos ONLINE ...");
    await pool.getConnection();
  } catch (error) {
    console.log("Error en la conneccion : " + error);
    //await db.closeConnection();
  }

  try {
    console.log("Iniciando Coneccion de pruebas argis");
    console.log(poolPostgress.getMaxListeners());
  } catch (error) {
    console.log("Error en la conneccion POSTGRESS: " + error);
    //await db.closeConnectionSC();
  }

  try {
    /*console.log("Iniciando servidor ....")
        app.listen(app.get('port'),()=>{
            console.log('funcionando servidos en puerto '+ app.get('port'));
        });*/
    //const server = http.createServer(app)
    const wss = new WebSocketServer({ port: app.get("port") });
    const activeScreens = new Map();
    // WebSocket event handling
    wss.on("connection", (ws) => {
      console.log("A new client connected.");

      // Event listener for incoming messages
      ws.on("message", (message) => {
        console.log("Received message:", message.toString());

        const datos = JSON.parse(message);
        if (datos.type === "IDENTIFY" && datos.role === "SCREEN") {
          const areaKey = datos.area; // Ejemplo: "1P"

          // Si el área no existe en el mapa, creamos un nuevo Set
          if (!activeScreens.has(areaKey)) {
            activeScreens.set(areaKey, new Set());
          }

          // Añadimos esta conexión al grupo de esa área
          activeScreens.get(areaKey).add(ws);
          ws.registeredArea = areaKey; // Guardamos referencia para el cierre

          console.log(
            `Pantalla registrada en área: ${areaKey}. Total en esta área: ${activeScreens.get(areaKey).size}`,
          );
          return;
        }

        // ENVÍO DE DATOS (Desde celulares a TODAS las pantallas de esa área)
        if (datos.id && activeScreens.has(`${datos.sector}${datos.tipo}`)) {
          const screensInArea = activeScreens.get(
            `${datos.sector}${datos.tipo}`,
          );

          screensInArea.forEach((client) => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(datos));
            }
          });
        }
      });

      // Event listener for client disconnection
      ws.on("close", () => {
        if (ws.registeredArea && activeScreens.has(ws.registeredArea)) {
          const areaGroup = activeScreens.get(ws.registeredArea);
          areaGroup.delete(ws);

          // Si ya no quedan pantallas en esa área, borramos la entrada del Map
          if (areaGroup.size === 0) {
            activeScreens.delete(ws.registeredArea);
          }
          console.log(`Una pantalla de ${ws.registeredArea} se desconectó.`);
        }
      });
    });
    /*server.listen(app.get('port'), function () {
            console.log('funcionando servidos en puerto ' + app.get('port'));
        });*/
  } catch (error) {
    console.log("Error iniciar Servidor : " + error);
  }
}

InitServer();
