let ns;
let maxSlaveRam = 0;
const AUTO_ROOT= true;
const programsNeeded= [];
const DEFAULT_PCT = .25; // 25% money / hack
const DEFAULT_GRW = 1.5; // 150% money / grow

const callbackPort = 43;

const moneyCut = .25; // take 25% of the money. 
const fileVersions = 1.03;

const MAX_READY_TIME = 120; // Max seconds to finish Weaken/Grow

export async function main( ns){
    ns. disableLog("ALL");
    ns. clearLog();
    ns. tail();
    let servers = (await getServers( ns));
    //ns.tprint(servers);
    let slaves = servers.slaves;
    let targets = servers.targets;
    servers = servers.all
    
    await attack( ns, "grow", "home", slaves, 1, Date.now(),1);
    await attack( ns, "hack", "home", slaves, 1, Date.now(),1);
    await attack( ns, "weaken", "home", slaves, 1, Date.now(),1);
    let target = ns. args[ 0]|| await getTarget( ns, targets, "fast");
    await prepareServer( ns, target, slaves);
    //ns. tprint(JSON. stringify (target));
    do { // Batch Attempt:
        ns. printf("Yep. we got here... %s", servers. targets  || 1);
        // Get Batching Info
        
        // Launch batch Attack
        
        
        
    } while ( false); 
    
};
async function analyzeServer( ns){
    // display:
    /*
    Money: % full | current cut ( curMoney* cut) | Money needed to full
    Security: +num ( Color code)
    Time: Finish Batch | (in order of ) Longest Time [ methodName | time], second [ methodName | time] , last [ Hack | time], 
    
    
    */
};
async function prepareServer( ns, serverName, sl){
    let serverDetails = await getServerDetails( ns, serverName);
    try{
        ns.exec( "watcher.js", "home", 1, callbackPort, serverName);
    }catch{};
    ns. printf("[INFO] Preparing [%s]\n[%s%%|$%s] net cash needed\n+%s net security", serverName, serverDetails.netMoneyPCT, serverDetails.netMoney, serverDetails.netSecurity);
    await updateServerDetails( ns, serverDetails);
    
    while( serverDetails. netSecurity!= 0|| serverDetails. netMoney!= 0){
        while(serverDetails. netSecurity!= 0){ // Security
            let threadsNeeded = Math.ceil( serverDetails.netSecurity/ await ns.weakenAnalyze(1, 1));
            await attack( ns, "weaken", serverDetails. name, sl, threadsNeeded, Date.now());
            await ns.sleep(serverDetails.weakTime+150);
            
        };
        while( serverDetails. netMoney!= 0 ){ // Money.
            let threadsNeeded = Math.ceil( await calcGrowThreads( ns, serverDetails. name, serverDetails. maxMoney- serverDetails. curMoney));
            await attack( ns, "grow", serverDetails. name, sl, threadsNeeded, Date.now());
            await ns.sleep(serverDetails.growTime+150);
        }
        ns.printf(" here too");
        await updateServerDetails( ns, serverDetails);
        await ns.sleep(2000);
    }
    
    ns. printf("[INFO] Prepared [%s]", serverName);
    return true;
};
async function FUCKING_EXECUTE( ns, server, file){
    // File Name: Method + version
    if( ns.ls().find("")) {

    }
}
async function doSCP( ns, files, dest, src){
    let bool = await ns.scp( files, dest, src)
    if (!bool){
        ns.printf("Files: %s failed to transfer from [%s->%s].", files, src, dest)
        await ns.sleep(50);
        await doSCP( ns, files, dest, src);
    }
}
async function attack( ns, method, server, dedList, threads, thisTime, testing){
    //ns.tprint(dedList);
    //ns.printf("%s", dedList);
    let completed = 0;
    for( let i=0; i <= dedList.length; i++){
        let sDetails = await ns.getServer( dedList.at(i));
        let maxRam = 150;
        if( completed >= threads){
            return true;
        }
        if( maxRam> 1&& completed< threads){
            if( completed >= threads){
                return true;
            }
            if(! ns.fileExists(method+fileVersions+'.script', dedList.at(i))){
                await ns.rm(method+fileVersions+'.script','home');
                await ns.write(method+fileVersions+'.script', "while( Date.now()< args[0]){sleep(50);};%s( args[1]);tryWritePort(args[2], '['+getHostname()+']:['+new Date(Date.now()).toLocaleTimeString('en-US')+']: '+ %s+' -> '+ args[1]);".replace( /%s/, method).replace( /%s/, method));
                await ns.sleep(5);
                await doSCP(ns, method+fileVersions+'.script', dedList.at(i), 'home');
            }

            let maxThreads = Math.min( maxRam, threads- completed) + 1;
            //ns.printf( "%s, %s, %s", maxThreads, maxRam, threads- completed);
            
            await ns.exec(method+fileVersions+'.script',dedList.at(i), maxThreads, thisTime, server, callbackPort);
            completed = completed+  maxThreads;
           // ns.printf("[%s]: %s, [%%%s], %s", dedList.at(i), maxThreads, Math.ceil((completed/ threads)*10000)/100, completed);
            ns.printf("[%s]->%s->[%s] | %sT | ", dedList.at(i), method, server, maxThreads)


        }
        if( completed >= threads){
            return true;
        }
    }
    return true;
    
    await ns.sleep(10000);
    
}
async function getServerDetails( ns, serverName){ // Costly Function ( tick ms)
    let curSecurity = await ns. getServerSecurityLevel( serverName);
    let minSecurity = await ns. getServerMinSecurityLevel( serverName);

    let curMoney = await ns. getServerMoneyAvailable( serverName);
    let maxMoney = await ns. getServerMaxMoney( serverName);

    let maxRam = await ns. getServerMaxRam( serverName);
    let useRam = await ns. getServerUsedRam( serverName);
    let curRam = maxRam- useRam;

    let moneyPCT = Math. ceil((( maxMoney- curMoney)/ maxMoney)* 10000)/ 100;
    let securityPCT = curSecurity/ minSecurity;

    let growTime = 0;
    let hackTime = 0;
    let weakTime = 0;
    let TotalCompletionTime = 0;
    if( await ns. fileExists( 'formulas.exe')){
        let server = await ns. getServer( details. name);
        let player = await ns. getPlayer();
        growTime = await ns. formulas. hacking. growTime( server, player);
        hackTime = await ns. formulas. hacking. hackTime( server, player)
        weakTime = await ns. forumlas. hacking. weakenTime( server, player);
        TotalCompletionTime = growTime+ hackTime+ weakTime;
    } else{
        growTime = await ns. getGrowTime( serverName);
        hackTime = await ns. getHackTime( serverName);
        weakTime = await ns. getWeakenTime( serverName);
        TotalCompletionTime = growTime+ hackTime+ weakTime;
    };
    let details = {
        name: serverName,
        curMoney: curMoney,
        maxMoney: maxMoney,
        netSecurity: Math.ceil(( curSecurity- minSecurity)* 100)/ 100,
        netSecurityPCT: securityPCT,
        netMoney: maxMoney- curMoney,
        netMoneyPCT: moneyPCT,

        ram: curRam,
        maxRam: maxRam,
        usedRam: useRam,

        hackTime: 0,
        growTime: 0,
        weakTime: 0,
        TotalCompletionTime: 0,

        growTime: growTime,
        hackTime: hackTime,
        weakTime: weakTime,
        totalBatchTime: TotalCompletionTime,

    };
    return details;
}
async function updateServerDetails( ns, details){

            // Timing Stuff:
            // Formulas BS type stuff
            let growTime = 0;
            let hackTime = 0;
            let weakTime = 0;
            let TotalCompletionTime = 0;
            if( await ns. fileExists( 'formulas.exe')){
                let server = await ns. getServer( details. name);
                let player = await ns. getPlayer();
                growTime = await ns. formulas. hacking. growTime( server, player);
                hackTime = await ns. formulas. hacking. hackTime( server, player)
                weakTime = await ns. forumlas. hacking. weakenTime( server, player);
                TotalCompletionTime = growTime+ hackTime+ weakTime;
            } else{
                growTime = await ns. getGrowTime( details. name);
                hackTime = await ns. getHackTime( details. name);
                weakTime = await ns. getWeakenTime( details. name);
                TotalCompletionTime = growTime+ hackTime+ weakTime;
            };


            let curMoney = await ns. getServerMoneyAvailable( details. name);
            let maxMoney = await ns. getServerMaxMoney( details. name)
            let moneyPCT = (curMoney/maxMoney)*100;//maxMoney/curMoney;//Math. ceil((( maxMoney- curMoney)/ maxMoney)* 10000)/ 100;
            details. netMoney = maxMoney - curMoney;
            details. netMoneyPCT = moneyPCT;
            details. curMoney = curMoney;
            let curSecurity = await ns. getServerSecurityLevel( details. name);
            let minSecurity = await ns. getServerMinSecurityLevel( details. name);
            let securityPCT = (Math.ceil(((curSecurity/ minSecurity) - 1)* 10000)/ 100); // stupid
            details. netSecurity = Math.ceil((curSecurity- minSecurity)*100)/100;//Math. ceil(( curSecurity- minSecurity)* 100)/ 100;
            details. netSecurityPCT = securityPCT;
            details. TotalCompletionTime = TotalCompletionTime;
            let maxRam = await ns. getServerMaxRam( details. name);
            let useRam = await ns. getServerUsedRam( details. name);
            let curRam = maxRam- useRam;
            details. usedRam = useRam;
            details. maxRam = maxRam;
            details. ram = curRam;
            //ns. printf( "Money updated for [%s] [%%%s | $%s | -%s]", details. name, details. netMoneyPCT, curMoney* moneyCut, details. netMoney);
            //ns. printf( "Security updated for [%s] [+%%%s | +%s]", details. name, details. netSecurityPCT, details. netSecurity);
            //ns. printf( "Timing Statistics:\nMoney Per Second: $%s\nTotal Completion Time: %s seconds\n[G|W|H] [%s|%s|%s]", Math.ceil( maxMoney/  (TotalCompletionTime/1000)), Math.ceil( TotalCompletionTime/1000), Math.ceil( growTime/10000)*10, Math.ceil( weakTime/10000)*10, Math.ceil( hackTime/10000)*10);
                /* MPS:

                        TotalCompletionTime/ (% Cut)



                */

}
async function getServers( ns){
    let player = await ns.getPlayer();
    let listTypes = {
        all: [],
        serverDetails: [],
        slaves: [],
        targets: [],
    }
    async function scan(Parent, host){
        host = host? host: Parent;

        if( AUTO_ROOT&& !ns.hasRootAccess( host)){
            try{ 
                await ns.brutessh( host);
            } catch{};
            try{
            await    ns.ftpcrack( host);
            } catch{};
            try{ 
            await    ns.relaysmtp( host);
            } catch{};
            try{ 
            await    ns.httpworm( host);
            } catch{};
            try{
            await    ns.sqlinject( host);
            } catch{};
            try{
            await    ns.nuke( host);
            } catch{};
            if ( await ns.hasRootAccess( host)) {
            await    ns.printf('INFO Root gained for {%s}', host);
            };
        };

        if( !listTypes.all.includes( host)){ // If we havent scanned this host before
            listTypes.all.push( host); // Now we have.
            let children = await ns.scan( host);
            let Server = await getServerDetails( ns, host);
            listTypes.serverDetails.push(Server);
            Server.maxRam!= 0? listTypes.slaves.push( host): null;

            let j = false;// Is a target or not
            /*

                Target: = Max Time is under 80s, CPS ( Cash per second) > 60,000

            */

            j!= false? listTypes.targets.push( host): null;
            for( let int= 0; int< children.length; int++){ // Scan Children
                if(! listTypes.all.includes( children.at(int))){
                    //ns.tprint("Scanning: %s", children.at(int));
                    await scan( host, children.at(int));
                }
            };
           // if( listTypes.all.includes( ))
        };
        
    };
    await scan( "home");
    return listTypes;
};

async function getTarget( ns, targetName, sortType){
    switch(sortType){
        case 'fast':

            return 'foodnstuff'


        break
        case 'mps':
        break;
    }
    return "n00dles";
}

async function calcWeakenTime( ns, targetName){

}

async function calcGrowTime( ns, targetName){

}

async function calcHackTime( ns, targetName){

}

async function calcHackThreads( ns, targetName, amt){

}

async function calcWeakenThreads( ns, amt){

}

async function calcGrowThreads( ns, targetName, amt){// amt: 100000$ type values
    let amtPCT = 1+ amt/ await ns.getServerMaxMoney( targetName);
    if( await ns. fileExists( 'formulas.exe')){
        let neededPCT = await ns.getServerMaxMoney( targetName)/ amt;
        let server = ns. getServer( targetName);
        let player = ns. getPlayer( );
        let indicator = 1;
        while( await ns. formulas. hacking. growPercent(server, indicator, player, 1) <= amtPCT ){
            indicator = indicator + 1;
            await ns.sleep(5);
        }
        return await ns. formulas. hacking. growPercent(server, indicator+ 1, player, 1) <= amtPCT
    } else {
        return await ns.growthAnalyze( targetName, amtPCT, 1)
    }
    return 10;
}

async function calcHackSecurityIncrease( ns, targetName, threads, cores){

}

async function calcGrowSecurityIncrease( ns, targetName, threads, cores){

}