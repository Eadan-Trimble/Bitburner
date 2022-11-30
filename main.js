const fileVersion = 2.06;
const callbackPort = 43;

export async function main( ns){
    ns.tail();
    ns.clearLog();
    ns.disableLog('ALL');
    let list = await FindComputers( ns, 9999);
    
    let target = ns.args[0] || "max-hardware";// max-hardware: 239, The-Cave:192, harakiri-sushi:136, .:128, neo-net: 102 johnson-ortho

    await PrepareServer( ns, target, list.slaves);

    do{
        // batch
        await Batch( ns, target, list.slaves, Date.now());
    } while( await ns.sleep( 3000));
}

async function Batch( ns, target, serverList, startTime){
    ns.printf(" Batch begin %s", target);
    let server = await ns.getServer( target);
    let player = await ns.getPlayer();
    let times = await GetBatchTimes( ns, target, startTime);
    let details = await GetDetails( ns, target);

    //let hackMoneyPCT = (details.stats.maxMoney* .25)/ details.stats.maxMoney;
    

    let hackThreadsNeeded = Math.ceil(await ns.fileExists('formulas') ? (details.stats.maxMoney* .25)/ await ns.formulas.hacking.hackPercent( server, player): (details.stats.maxMoney* .25)/ (details.stats.maxMoney* await ns.hackAnalyze( target)));
    //ns.tprint(hackThreadsNeeded, details.stats.maxMoney* .25, (details.stats.maxMoney* await ns.hackAnalyze( target)));
    let weakenThreadsNeeded = Math.ceil(await ns.hackAnalyzeSecurity(hackThreadsNeeded, target)/ await ns.weakenAnalyze( 1, 1));
    let growThreadsNeeded = Math.ceil(await ns.fileExists('formulas') ? false : await ns.growthAnalyze( target, 1+ (details.stats.maxMoney* .25)/ (details.stats.maxMoney* .75), 1))*1.15;
    let _weakenThreadsNeeded = Math.ceil(await ns.growthAnalyzeSecurity( growThreadsNeeded)/ await ns.weakenAnalyze( 1,1)); // thats retarded.

    await deliverAndExecute( ns, target, "hack", serverList, hackThreadsNeeded, 43, times.times.hackStart);
    await deliverAndExecute( ns, target, "weaken", serverList, weakenThreadsNeeded, 43, times.times.weakenStart);
    await deliverAndExecute( ns, target, "grow", serverList, growThreadsNeeded, 43, times.times.growStart);
    await deliverAndExecute( ns, target, "weaken", serverList, _weakenThreadsNeeded, 43, times.times._weakenStart);
    //deliverAndExecute( ns, target, serverList, "hack"+fileVersion+'.script', hackThreadsNeeded, 43, times.hackTime);
    
}

async function PrepareServer( ns, target, slaves){ // Working Properly
    ns.printf('wtf');
    let maxMoney = await ns.getServerMaxMoney( target);
    let curMoney = 0;
    let maxSecurity = await ns.getServerMinSecurityLevel( target);
    let curSecurity = 0;

    while( maxMoney!= await ns.getServerMoneyAvailable( target)|| maxSecurity!= await ns.getServerSecurityLevel( target)){
        let defaultSecurityInterest = await ns.getServerSecurityLevel( target)- maxSecurity;

        let player = await ns.getPlayer();
        let server = await ns.getServer( target);
        let money = await ns.getServerMoneyAvailable( target);
        let moneyNeeded = maxMoney- money;
        let moneyPCT = (maxMoney/ moneyNeeded) == 1? 1: 1+ (moneyNeeded/ maxMoney);/// moneyNeeded);
        let moneyThreadsNeeded = Math.ceil(await ns.fileExists( 'formulas')? false : await ns.growthAnalyze( target, 1+ moneyNeeded/ money, 1))*1.15;
        let SecurityCounterInterest = await ns.growthAnalyzeSecurity( moneyThreadsNeeded);
        let securityThreadsNeeded = Math.ceil(Math.abs((SecurityCounterInterest+ defaultSecurityInterest)/ await ns.weakenAnalyze( 1, 1))) + 3;

        let time = await GetBatchTimes( ns, target, Date.now());

        await deliverAndExecute( ns, target, "grow", slaves, moneyThreadsNeeded, 43, time.times.growStart);
        await deliverAndExecute( ns, target, "weaken", slaves, securityThreadsNeeded, 43, time.times._weakenStart);
       
        await ns.sleep( time.weakTime+ 2500);
    }
}
async function deliverAndExecute( ns, targetServer, targetScript, slaves, threads, callbackPort, time, args= []){
        if( threads == 0){ return true}; // meme
        ns.printf( "Prepared Servers: [%s/%s]", slaves.length- await PrepareScript( ns, targetScript, slaves), slaves.length);
        let threadsCalled = 0;
        for( let i=0; i < slaves. length; i++){
        if( await ns. fileExists( targetScript+ fileVersion+ '.script', slaves. at(i))) {
            let threadsPossible= Math.floor(Math.min( threads- threadsCalled+ 1, Math. ceil( ns.getServerMaxRam( slaves. at( i))- ns.getServerUsedRam( slaves. at( i)))/ ns.getScriptRam( targetScript+ fileVersion+ '.script')));
            if( threadsPossible!= 0 && await ns.exec( targetScript+ fileVersion+ '.script', slaves.at( i), threadsPossible, time, targetServer, callbackPort, Math.ceil(Math.random()*100000))!= 0){
                //ns.printf(" %s[%s/%s]-> %s",  targetScript+ fileVersion+ '.script', threadsPossible, threads, slaves.at( i))
                threadsCalled = threadsCalled+ threadsPossible;
            }
        }
        if( threadsCalled>= threads){
            ns.printf("Sucessfully executed all Files [%s|%s]", targetScript, threads);
             return true
        }
    }
    ns.printf("Failed to deliver all files [%s | %%%s | %s total]", targetScript, threadsCalled/ threads), threads;
    await ns.sleep(1000);
    return await deliverAndExecute( ns, targetServer, targetScript, slaves, threads- threadsCalled, callbackPort, time);
}
async function FindComputers( ns, minTime = 180){ // This first
    // minTime = Const in official
    let slaves = [];
    let targets = [];
    let servers = [];
    let slaveDetails = [];
    let targetDetails = [];
    // axniety
    async function Scan( dir = "home"){
        let scan = ns. scan( dir);
        for( let i= 0; i< scan. length; i++){
            if( !servers. includes( scan. at( i))){
                servers. push( scan. at( i));
                let player = ns. getPlayer( );
                let _serverDetails = await GetDetails( ns, scan. at( i)); // smh
                if( !await ns. hasRootAccess( scan. at( i))){
                    await gainRoot( ns, scan. at( i)) == true? ns. tprint( "Root gained for: ", scan. at( i)): false;
                }
                if( ns. hasRootAccess( scan. at( i))){
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
    if( GetBatchTimes != undefined){
        let times = await GetBatchTimes( ns, serverName);
        Times. hackTime = times. hackTime;
        Times. weakTime = times. weakTime;
        Times. growTime = times. growTime;
        Times. totalTime = times. totalTime;
    }

    return{
        name: serverName,
        stats: Stats,
        times: Times,

    };
}
async function GetBatchTimes( ns, server, start){
    let ret = {
        hackTime: 0,
        growTime: 0,
        weakTime: 0,
        end: 0,
        totalTime: 0,
        totalTimeToFinish: 0,
        times: { //
            hackStart: 0,
            weakenStart: 0,
            growStart: 0,
            _weakenStart: 0 ,
        }
    }
    if( ns. fileExists( 'formulas. exe')){
        let _server = await ns. getServer( server);
        let player = await ns. getPlayer( );
        _server. hackDifficulty = _server. minDiffuculty;

        ret. hackTime = await ns. formulas. hacking. hackTime( _server, player);
        ret. growTime = await ns. formulas. hacking. growTime( _server, player);
        ret. weakTime = await ns. formulas. hacking. weakenTime( _server, player);
        
    } else {
        ret. hackTime = await ns. getHackTime( server);
        ret. growTime = await ns. getGrowTime( server);
        ret. weakTime = await ns. getWeakenTime( server);
    }
    ret. end = start+ ret. weakTime+ 10000;
    ret. totalTime = ret. growTime+ ret. hackTime+ ret. weakTime;
    
    ret. times. hackStart = ret. end- 2000- ret. hackTime;
    ret. times. weakenStart = ret. end- 1500- ret. weakTime;
    ret. times. growStart = ret. end- 1000- ret. growTime;
    ret. times. _weakenStart = ret. end- 500- ret. weakTime;
    return ret;
}

async function PrepareScript( ns, method, targetServer = 'home'){
    let fileName = method + fileVersion + '.script'
    if( typeof(targetServer) != 'string'){
        let failed = 0;
        for( let i = 0; i< targetServer.length; i++){
            failed = failed + await PrepareScript( ns, method, targetServer. at( i)) == true ? 1 : 0;
        }
        return failed;
    } else {
        if( !await ns. fileExists( fileName, targetServer)){
            if(await ns. fileExists( fileName,'home')){ // If we've already created this file before
                if(await ns. scp( fileName, targetServer, 'home')){
                    return true
                } else {
                    ns.printf("Failed to SCP file [%s -> %s]", fileName, targetServer);
                    return false;
                }
            } else {
                await ns. write( fileName, "while( Date. now( )< args[0]){sleep( 5);};res=%s( args[1]);tryWritePort( args[2], '['+getHostname( )+']:['+new Date( Date. now( )). toLocaleTimeString( 'en-US')+']: '+ '%s['+res+'] -> '+ args[1]);". replace( /%s/, method). replace( /%s/, method))
                if(await ns. fileExists( fileName)){
                    if(await ns. scp( fileName, targetServer, 'home')){
                        return true
                    } else {
                        ns.printf("Failed to SCP file [%s -> %s]", fileName, targetServer);
                        return false;
                    }
                } else {
                    ns.printf("Failed to write file [%s]", fileName);
                    return false;
                }
            }
        } else {
            return true;
        }
        return false;
    }
}