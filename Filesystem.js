let fileSystem = {
    version: 1.02,
    replace: "%s",
    files:{
        worker: "window[args0]= ns;while(true){sleep(5)}",
        attackWatcher: "",
        serverWatcher: "",
    }

};


async function AllocateAttack( ns, targetServer, slaveList, AMT, method, time, details){

    for( let i = 0; i < slaveList. length; i++){
        let threadsPossible = 0;
        let threadsNeeded = 0;

        switch( method){
            case "hack":
                let hackAnalyze = await ns.fileExists('formulas') ?await ns.formulas.hacking.hackPercent( server, player): await ns.hackAnalyze( target);
                break;
            case "weaken":
                let weakenAnalyze = ns.weakenAnalyze(1, slaveList[ i]. cores);
                break;
            case "grow":
                let AMTPossible = 0;
                let growAnalyze = ns.growthAnalyze( targetServer, AMTPossible, cores);
                let growAnalyzeSecurity = ns.growthAnalyzeSecurity( growAnalyze, targetServer, slaveList[ i]. cores);
                break;
        }
    }
}

export async function main( ns){
    let servers = FindComputers( ns, 200);
    await distributeFiles( ns, (await servers).slaves, fileSystem.files);

}

async function distributeFiles( ns, serverList, fileObjList){
    fileObjList. forEach(( name= value)=>{
        ns. tprint( name, value);
    })
}

async function FindComputers( ns, minTime = 180){ // This first
    // minTime = Const in official
    let slaves = [];
    let targets = [];
    let servers = [];
    let serverDetails = [];
    let slaveDetails = [];
    let targetDetails = [];
    // axniety
    async function Scan( dir = "home"){
        let scan = ns. scan( dir);
        for( let i= 0; i< scan. length; i++){
            if( !servers. includes( scan. at( i))){
                let player = ns. getPlayer( );
                let _serverDetails = await GetDetails( ns, scan. at( i));
                serverDetails. push( _serverDetails);
                servers. push( scan. at( i));
                if( !await ns. hasRootAccess( scan. at( i))){
                    await gainRoot( ns, scan. at( i)) == true? ns. tprint( "Root gained for: ", scan. at( i)): false;
                }
                if( ns. hasRootAccess( scan. at( i)&& _serverDetails.maxRam > 50)){
                    slaves. push( scan. at( i));
                    slaveDetails. push( _serverDetails);
                    ns.tprint("Slave: ", scan.at(i));
                }
                if( _serverDetails. times. totalTime/1000 <= minTime&& _serverDetails. stats. maxMoney!= 0){
                    targets. push( scan. at( i));
                    targetDetails. push( _serverDetails);
                }
                ns.tprint(scan. at( i)+ _serverDetails. times. totalTime/ 1000);
                await Scan( scan. at( i));
            }
        }
        
        
    };
    await Scan( );
    ns. tprint( targets. length);
    return { servers: servers, slaves: slaves, slaveDetails: slaveDetails, targets: targets, targetDetails: targetDetails};
}

async function GetDetails( ns, serverName){
    let Times = {
        hackTime:0,
        weakTime:0,
        growTime:0,
        totalTime:0,
    };
    let Stats = {

        ip: 0,
        corporation: "",
        contracts: [],
        lvl: 0,
        money: 0,
        ram: 0,

        maxMoney: await ns. getServerMaxMoney( serverName),
        maxSecurity: await ns. getServerMinSecurityLevel( serverName),
        maxRam: await ns. getServerMaxRam( serverName),   
        
        netMoney: 0,
        netSecurity: 0,
        netMoneyPCT: 0,
        netSecurityPCT: 0,

    }
    try{
        let times = await GetBatchTimes( ns, serverName);
        Times. hackTime = times. hackTime;
        Times. weakTime = times. weakTime;
        Times. growTime = times. growTime;
        Times. totalTime = times. totalTime;
    } catch(err) {

        Times. hackTime = await ns. getHackTime( serverName);
        Times. weakTime = await ns. getWeakenTime( serverName);
        Times. growTime = await ns. getGrowTime( serverName);
        Times. totalTime = Times. hackTime+ Times. weakTime+ Times. growTime;
    }

    return{
        name: serverName,
        stats: Stats,
        times: Times,

    };
}

async function gainRoot( ns, server){
    try{await ns. sqlinject( server)} catch{};
    try{await ns. httpworm( server)} catch{};
    try{await ns. ftpcrack( server)} catch{};
    try{await ns. relaysmtp( server)} catch{};
    try{await ns. brutessh( server)} catch{};
    if( await ns. hasRootAccess( server)){
        return true;
    } else{
        return false;
    }
}