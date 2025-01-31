import { configuraciones } from './config/config.js'
import app from './utils/app.js';
import { pool, poolPostgress } from './utils/connection.js';
import { PORT } from './config/configDeploy.js'
import http from 'http';
import {WebSocketServer} from 'ws';


async function InitServer() {
    console.log(configuraciones.NOMBREAPP, '....');
    try {
        console.log("Iniciando la Conección de la base de datos ONLINE ...");
        await pool.getConnection()
    } catch (error) {
        console.log("Error en la conneccion : " + error);
        //await db.closeConnection();
    }

    try {
        console.log("Iniciando Coneccion de pruebas argis");
        console.log(poolPostgress.getMaxListeners())
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
        const wss = new WebSocketServer({ port: app.get('port') });

        // WebSocket event handling
        wss.on('connection', (ws) => {
            console.log('A new client connected.');

            // Event listener for incoming messages
            ws.on('message', (message) => {
                console.log('Received message:', message.toString());

                // Broadcast the message to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) {
                        client.send(message.toString());
                    }
                });
            });

            // Event listener for client disconnection
            ws.on('close', () => {
                console.log('A client disconnected.');
            });
        }); 
        /*server.listen(app.get('port'), function () {
            console.log('funcionando servidos en puerto ' + app.get('port'));
        });*/
    } catch (error) {
        console.log("Error iniciar Servidor : " + error)
    }
}

InitServer()