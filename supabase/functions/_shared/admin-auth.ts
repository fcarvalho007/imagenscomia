// Verify JWT with Auth before inspecting aal; never treat an arbitrary Bearer string as authentication.
export async function authorizedAdmin(req:Request,db:any,serviceKey:string|undefined){
 const header=req.headers.get('authorization')||'';
 if(serviceKey&&header===`Bearer ${serviceKey}`)return true;
 if(!header.startsWith('Bearer '))return false;
 const token=header.slice(7);
 try{
  const {data,error}=await db.auth.getUser(token);if(error||!data.user)return false;
  const encoded=token.split('.')[1];const claims=JSON.parse(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')));
  if(claims.aal!=='aal2')return false;
  const {data:admin,error:roleError}=await db.rpc('has_role',{_user_id:data.user.id,_role:'admin'});
  return !roleError&&admin===true;
 }catch{return false;}
}
