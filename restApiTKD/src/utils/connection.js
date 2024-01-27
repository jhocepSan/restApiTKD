import {createPool} from 'mysql2/promise';
import {configuraciones} from '../config/config.js';
import pgadmin from 'pg'

export const pool=createPool(configuraciones.CONFIGDBLOCAL);
export const poolPostgress = new pgadmin.Pool(configuraciones.CONFIGDBPG);