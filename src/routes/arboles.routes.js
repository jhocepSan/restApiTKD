import {Router} from 'express';
import {getProgresoArbol,addProcesoArbol} from '../controllers/arboles.controllers.js'
const router = Router();


router.get('/',async(req,res)=>{
    const result = await getProgresoArbol();
    if(result.ok){
        res.status(200).json(result);
    }else{
        res.status(404).json(result);
    }
});
router.post('/sendInfo',async(req,res)=>{
    console.log("info",req.body)
    const result = await addProcesoArbol(req.body);
    if(result.ok){
        res.status(200).json(result);
    }else{
        res.status(404).json(result);
    }
})

export default router;