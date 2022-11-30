const debug= true;


async function FindComputers( ns){
    
    let serverList = {
        servers: [],
        Details: [],
        slaves: [],
        targets: [],
        sorted: {
            moneyAndSecurity: {
                servers: [],
                stats: [],
            },
        },
    }
    try{
        async function Scan( directory){
            //ns.tprint( directory);
            serverList.servers.push( directory);
            let scan = await ns. scan( directory);
        for( let i= 0; i< scan.length; i++){
            if(! serverList. servers. includes( scan. at( i))){
                let server = scan. at( i);
                try{await ns. sqlinject( server)} catch{};
                try{await ns. httpworm( server)} catch{};
                try{await ns. ftpcrack( server)} catch{};
                try{await ns. relaysmtp( server)} catch{};
                try{await ns. brutessh( server)} catch{};
                try{await ns. nuke( server)} catch{};
                await Scan( scan. at( i));
                if(ns.hasRootAccess( scan. at(i))){
                    serverList.slaves.push( scan.at(i));
                }
            }
        }
        return serverList;
    }
    await Scan( "home");
    } catch( err){
        ns.printf( "Error while scanning servers: %s", err);
    }
    
    return serverList;
}
let mainFiles = {
    folder: "DumbShit",
    slave: "",
    attackWatcher: "",
    serverWatcher: "",
    version: 1.02
}
async function CheckFiles( ns, servers){
    // Ensure home has the files
    if (!ns. fileExists( mainFiles. folder+ "slave"+ mainFiles. version+ ".js", "home")){
        ns. write( mainFiles. folder+ "slave"+ mainFiles. version+ ".js", mainFiles. slave, 'w');
    }
    if (!ns. fileExists( mainFiles. folder+ "attackWatcher"+ mainFiles. version+ ".js", "home")){
        ns. write( mainFiles. folder+ "attackWatcher"+ mainFiles. version+ ".js", mainFiles. attackWatcher, 'w');
    }
    if (!ns. fileExists( mainFiles. folder+ "serverWatcher"+ mainFiles. version+ ".js", "home")){
        ns. write( mainFiles. folder+ "serverWatcher"+ mainFiles. version+ ".js", mainFiles. serverWatcher, 'w');
    }
    let transfers = 0;
    try{
        for(let i=0; i< servers.length; i++){
            if(!await ns.fileExists(mainFiles. folder+ "slave"+ mainFiles. version+ ".js", servers.at(i))){
                ns.scp( mainFiles. folder+ "slave"+ mainFiles. version+ ".js", servers.at(i), "home");
                transfers++;
            }
        }
    } catch( err){ ns.printf("Error while transfering files: %s", err)} finally{
        ns. printf( "Finished distributing %s files.", transfers);
    };
    debug == true? ns. printf( "Files are up to date"): false;
}

export async function main( ns){
    ns.tail();
    ns.clearLog();
    ns.disableLog("ALL");
    let computerList = await FindComputers( ns);
    await CheckFiles( ns, computerList. slaves);

    ns.tprint( computerList. targets);
}