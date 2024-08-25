"use server";


export interface users_response {
    resp:string;
    val:number;
}


export async function GET(req:Request, res:Response){

    console.log(res)

    return res
}