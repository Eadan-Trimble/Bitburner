const fileVersion = 1.00;
let filesNeeded = {
    files: ['attackWatcher','serverWatcher','hack','weaken','grow'],
    data: [],
}
async function CreateAndTransfer( ns, server){
    filesNeeded.files.forEach((file,index)=>{
        if(! ns. fileExists( file, 'home')){
            CreateFile( file, 'home');
        }
    });
    ns.scp( filesNeeded.files, server, 'home');
}
async function CreateFile( ns, server, file){

};
export async function main( ns){
    let slaves = window. slaves = [];
    let batches = slaves. batches = [];
    ns.tprint(slaves);
}

async function UpdateFiles( serverList){
    for( let i = 0; i < serverList. length; i++){
        for( let l = 0; l < filesNeeded. files. length; l++){
            if(! ns.fileExists( filesNeeded. files. at( l), serverList. at( i))){
                if(! ns.fileExists( filesNeeded. files. at( l), 'home')){
                    // Write file to home
                }
                await ns.scp( filesNeeded)
            }
        }
    }
}

async function PrepareAndExecute( serverList, method, targetServer, batchID)
{
    let start = Date.now();

    switch( method){
        case "batch":
            break;
        case "grow&weaken":
            break;
        
    }
}