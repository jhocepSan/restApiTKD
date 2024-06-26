import {pool} from '../utils/connection.js'
import bycript from 'bcrypt';

export const agregarUsuario = async ({info})=>{
    console.log(info);
    var conn;
    try {
        var newPassword = bycript.hashSync(info.password,10);
        conn =await pool.getConnection();
        const [result] = await conn.query('SELECT idusuario from usuario where correo=?',[info.correo])
        if(result.length===0){
            const [rows]=await conn.query('INSERT INTO usuario (correo,password,nombres,apellidos,idclub,ci) values (?,?,?,?,?,?)',[
                info.correo,newPassword,info.nombres,info.apellidos,info.idClub,info.ciUser
            ]);
            return {"ok":{
                id:rows.insertId,
                correo:info.correo,
                nombres:info.nombres,
                apellido:info.apellidos,
                idclub:info.idClub
            }}
        }else{
            return {"error":"Correo Existente"}
        }
    } catch (error) {
        console.log(error);
        return {"error":error.message}
    }finally{
        if(conn){await conn.release();}
    }
}
export const iniciarSession = async ({correo,password})=>{
    var conn;
    try {
        conn =await pool.getConnection();
        var sql = "select *, "+
            "(select nombre from campeonato where estado='A' and idcampeonato=res.idcampeonato) as nombrecampeonato "+
            "from (select *,(select max(idcampeonato) from campeonato where estado='A') as idcampeonato from usuario where correo=? ) as res ;";
        const [result] = await conn.query(sql,[correo])
        if(result.length!==0){
            if(bycript.compareSync(password, result[0].password)){
                var info =await getInfoCampeonato(conn,result[0].idcampeonato);
                if(result[0].albitro=='A'){
                    await habilitarAlbitro(result[0],conn)
                }
                
                return {"ok":{
                    id:result[0].idusuario,
                    correo:result[0].correo,
                    nombres:result[0].nombres,
                    apellido:result[0].apellidos,
                    idclub:result[0].idclub,
                    idcampeonato:result[0].idcampeonato,
                    nombrecampeonato:result[0].nombrecampeonato,
                    albitro:result[0].albitro,
                    estado:result[0].estado,
                    ...info
                }}
            }
        }
        return {"error":"Usuario o Contraseña No Validos"}
    } catch (error) {
        console.log(error);
        return {"error":error.message}
    }finally{
        if(conn){await conn.release();}
    }
}

async function habilitarAlbitro(datos,conn){
    const [info] = await conn.query('SELECT * FROM mandopunto WHERE idusuario=?;',[datos.idusuario])
    if(info.length!=0){
        await conn.query('UPDATE mandopunto SET estado="A",tipoalbitro=? WHERE idusuario=?',[datos.tipoalbitro,datos.idusuario])
    }else{
        await conn.query('INSERT INTO mandopunto (idusuario,estado,tipoalbitro) values (?,?,?);',[datos.idusuario,datos.albitro,datos.tipoalbitro])
    }
    await conn.commit()
}

async function getInfoCampeonato(conn,idcampeonato){
    try {
        const [info] = await conn.query('SELECT * FROM club where estado="A";')
        const [result] = await conn.query('SELECT idgrado,nombre,tipo FROM grado where estado="A" and idcampeonato=?',[idcampeonato]);
        if(result.length!==0){
            var resultado=[];
            for await(var dato of result){
                let [result] = await conn.query('SELECT idcinturon,nombre FROM cinturon where idgrado=? ;',[dato.idgrado])
                resultado.push({...dato,"cinturon":result});
            }
            return {"Grados":resultado,"club":info}
        }
    } catch (error) {
        console.log(error);
        return {"error":error.message}
    } 
}

export const crearCampeonato = async ({nombre,descripcion})=>{
    var conn;
    try {
        var buf = Buffer.from(descripcion);
        conn =await pool.getConnection();
        const [result] = await conn.query('select * from campeonato where nombre=?',[nombre])
        if(result.length===0){
            const [rows] = await conn.query('insert into campeonato(nombre,descripcion) values(?,?)',[nombre,buf])
            return {"ok":{
                id:rows.insertId
            }}
        }
        return {"error":"El nombre del campeonato ya existe ."}
    } catch (error) {
        console.log(error);
        return {"error":error.message}
    }finally{
        if(conn){await conn.release();}
    }
}

export const recuperarCuenta= async(info)=>{
    var conn;
    try {
        var newPassword = bycript.hashSync(info.newPassword,10);
        conn =await pool.getConnection();
        const [result] = await conn.query('SELECT idusuario from usuario where correo=? and ci=?',[info.email,info.ci])
        console.log(result)
        if(result.length!==0){
            const [rows]=await conn.query('UPDATE usuario SET password=?',[
                newPassword
            ]);
            return {"ok":"Ingresa al sistemas con su nuevos datos, por favor ..."}
        }else{
            return {"error":"El correo o el ci, no existe en la cuenta, verifique por favor !!"}
        }
    } catch (error) {
        console.log(error);
        return {"error":error.message}
    }finally{
        if(conn){await conn.release();}
    }
}