import {configuraciones} from './config/config.js'
import app from './utils/app.js';
import {pool,poolPostgress} from './utils/connection.js';
import http from 'http';
import {Server} from 'socket.io'


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
        const server = http.createServer(app)
        const io = new Server(server,{
            cors:{
                methods:["GET","POST"]
            }
        })
        io.on("connection",(socket)=>{
            console.log(socket.id)
            socket.on("join_room",(data)=>{
                console.log(data);
                socket.join(data)
            })
            socket.on("send_message",(data)=>{
                console.log(data);
                socket.to(data.room).emit("receive_message",data);
            })
        })
        server.listen(app.get('port'), function () {
            console.log('funcionando servidos en puerto ' + app.get('port'));
        });
    } catch (error) {
        console.log("Error iniciar Servidor : " + error)
    }
}

InitServer()