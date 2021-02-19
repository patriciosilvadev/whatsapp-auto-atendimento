import request from "request"
import IClientLogin from "../@types/IClienteLogin";


// @types
import IClienteResponse from "../@types/IClienteResponse";

class IXC {
    private baseurl;
    private ixc_token;

    constructor(baseurl:string, ixc_token:string){
        this.baseurl = baseurl;
        this.ixc_token = ixc_token;
    }

    private ValidateCPF(cpf:string) {
        cpf = cpf.replace(/[^\d]/g, "");
        if ( cpf.length != 11 )return
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    public async getClient(cpf:any, filial:number = 2):Promise<IClienteResponse> {
        return new Promise((resolve, reject) => {
            cpf = this.ValidateCPF(cpf);
            request(`${this.baseurl}/cliente`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + Buffer.from(this.ixc_token).toString('base64'),
                    ixcsoft: 'listar'
                },
                body:
                {
                    qtype: 'cliente.cnpj_cpf',
                    query: cpf,
                    oper: '=',
                    page: '1',
                    rp: '1',
                    sortname: 'cliente.id',
                    sortorder: 'desc',
                    grid_param: `[{
                        "TB": "cliente.filial_id",
                        "OP": "=",
                        "P": ${filial.toString()}
                    }]`
                },
                json: true                
            }, function ( error, response, body ) {
                if (error) return reject(error);
                if ( response.statusCode === 200 ) {
                    const data:IClienteResponse = body.registros[0];
                    resolve(data);
                }
            })
        })
    }

    public async getClientLogin(client_id:string):Promise<IClientLogin> {
        return new Promise((resolve, reject) => {
            
            request(`${this.baseurl}/radusuarios`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + Buffer.from(this.ixc_token).toString('base64'),
                    ixcsoft: 'listar'
                },
                body:
                {
                    qtype: 'radusuarios.id_cliente',
                    query: client_id,
                    oper: '=',
                    page: '1',
                    rp: '1',
                    sortname: 'radusuarios.id_cliente',
                    sortorder: 'desc'
                },
                json: true                
            }, function ( error, response, body ) {
                if (error) return reject(error);
                if ( response.statusCode === 200 ) {
                    const data:IClientLogin = body.registros[0];
                    resolve(data);
                }
            })
        })
    }
}

const url:any = process.env.IXC_API_URL;
const token:any = process.env.IXC_TOKEN;

export default new IXC(url, token);