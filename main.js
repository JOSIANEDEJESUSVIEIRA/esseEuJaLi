import inquirer from "inquirer"
import fs from 'fs'
import readline from 'readline-sync'
import store from 'store'
import {EventEmitter} from 'node:events'
const emiter=new EventEmitter()
emiter.setMaxListeners(15)
const question=inquirer.createPromptModule()


const livros=[{title:'one',id:1},{title:'two',id:2},{title:'three',id:3}]

var users=JSON.parse(await fs.readFileSync('./dbuser.json'))

const bestScore=(usuario)=>{
    let newTable=[]
    usuario.forEach(usuari => {
        newTable.push({nome:usuari.nome,livros:usuari.livros,score:usuari.score})
    });
    const outputThree = newTable.sort((a , b) => b.score - a.score )
    console.table(outputThree)
}


function auth(dbuser,usuario){
    const valid=dbuser.filter((user)=>{
        if(user.nome==usuario.nome && user.senha==parseInt(usuario.senha)){
            store.set('id',user.id)
            return user
        }else{
            main()
        }
    })
    return valid
}

async function ler(idLivro,paginas){

    fs.readFile(`./livros/${idLivro}/${paginas}`,async(err,page)=>{
        if(page){
            console.clear()
            console.log(page.toString())
            readline.question('press enter')
            const addScore = users.map(obj => {
                if (obj.id === parseInt(store.get('id'))) {
                    return { ...obj, score: (obj.score+=10) };
                }
                return obj;
            });
            await fs.writeFileSync('./dbuser.json',JSON.stringify(addScore))
            ler(idLivro,paginas+1)
        }else{
            const addScore = users.map(obj => {
                if (obj.id === parseInt(store.get('id'))) {

                    if(!obj.livros.includes(idLivro)){obj.livros.push(idLivro)}
                    return { ...obj, score: (obj.score+=5)};
                }
                return obj;
            });
            await fs.writeFileSync('./dbuser.json',JSON.stringify(addScore))
            
            livraria()
        }
    })
}
async function livraria(){
    console.clear()
    var arr=['Menu']
    livros.forEach((livro)=>{
        arr.push(livro.title)
    })

    let livro=await question({
        name:"livros",
        type:"list",
        choices:arr
    })
        
        ler(livro.livros,1)
    
}


async function main(){
    console.clear()
    bestScore(users)
    
    const login=await question([{
        name:"nome",
        message:"Login:"
    },{
        name:"senha",
        type:"password",
        message:"Senha:"
    }])
    
    if(auth(users,login).length>0){
        livraria()
    }
    
}
main()