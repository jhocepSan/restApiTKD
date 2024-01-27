import {poolPostgress} from '../utils/connection.js'

export const getProgresoArbol=async ()=>{
    try {
        const resp = await poolPostgress.query("select * from mininco.avance_usuario")
        return {"ok":resp.rows}
    } catch (error) {
        return {"error":error.message}
    }finally{
        //poolPostgress.end()
    }
}

export const addProcesoArbol=async(info)=>{
    console.log("datos entrada",info);
    var sql= "INSERT INTO mininco.avance_usuario "+
        "(cod_fundo,cod_rodal,usuario,id_utb,estado_utb,fecha,cant_arb_modificados,cant_arb_agregados,cant_arb_eliminados,cant_arb_inicio,cant_arb_fin) "+
        "VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *"
    try {
        const resp = await poolPostgress.query(sql,[info.cod_fundo,info.cod_rodal,info.usuario,info.id_utb,info.estado_utb,
            info.fecha,info.cant_arb_modificados,info.cant_arb_agregados,info.cant_arb_eliminados,info.cant_arb_inicio,info.cant_arb_fin]);
        console.log(resp)
        return {"ok":resp.rows}
    } catch (error) {
        console.log(error)
        return {"error":error}
    }
}