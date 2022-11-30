
let ns;
let maxSlaveRam = 0;
const AUTO_ROOT= true;
const programsNeeded= [];
const MAX_SECURITY_DIF = 2.5; // 2.5 int
const MAX_MONEY_DIF = .1; // 10% percent
const DEFAULT_PCT = .25; // 25% money / hack
const MIN_HOME_RAM = 10; // Min home ram after running program


const READY_ALL = false;
const MAX_READY_TIME = 120; // Max seconds to finish Weaken/Grow

const MAX_LEVEL_PCT= .5; // Only servers under ( x*100)% of Level
const MIN_CHANCE = .8; // Only servers over x% chance to hack

async function getServers( ns){
    let player = await ns.getPlayer();
    let listTypes = {
        servers: [],
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
            let children = ns.scan( host);
            let s = await ns.getServer( host);
            let a= await s.baseDifficulty;
            let b= await s.moneyMax;
            let c= await s.moneyAvailable;
            let d= await s.hackDifficulty;
            let e= await s.maxRam;
            maxSlaveRam += e;
            let f= e- s.ramUsed;
            let g= await s.requiredHackingLevel;
            let h= ((await getWeakenTime( ns, host)*2)+ await getHackTime( ns, host)+ await getGrowTime( ns, host));
            let i= await s.hasAdminRights;
            let j= ((s.hackDifficulty*MAX_LEVEL_PCT<= player.skills.hacking)&& ( await ns.hackAnalyzeChance( host)>= MIN_CHANCE)&& b!= 0&& (h)/1000<= MAX_READY_TIME);
            let Server = {
                name: host,
                ip: s.ip,
                cores: s.cpuCores,
                index: listTypes.all.indexOf( host),
                root: s.hasAdminRights,
                parent: Parent,
                scriptsRunning: [],
                children: children,
                target: j,
                baseSecurity: a,
                curSecurity: d,
                minSecurity: Math.max(1, Math.round( a/ 3)),
                maxMoney: b,
                curMoney: c,
                moneyPCT: c/b,
                maxRam: e,
                freeRam: f,
                HackingLevel: g,
                hackTime: h,

            }
            listTypes.serverDetails.push(Server);
            Server.maxRam!= 0? listTypes.slaves.push( host): null;
            j!= false? listTypes.targets.push( host): null;
            for( let int= 0; int< children.length; int++){ // Scan Children
                if(! listTypes.all.includes( children.at(int))){
                    //ns.tprint("Scanning: %s", children.at(int));
                    await scan( host, Server.children.at(int));
                }
            };
        };
    };
    await scan( "home");
    return listTypes;
};
async function getGrowThreads( ns, server, amount){ // Done?
    if( ns.fileExists( 'formulas.exe')){
        let i = await ns.growthAnalyze( server, amount)- 15;
        let s = await ns.getServer( server);
        s.moneyAvailable = s.moneyMax/2.01;
        let p = await ns.getPlayer();
        while( await ns.formulas.hacking.growPercent( s, i, ns.getPlayer(), 1)<= amount ){
            i++;
        };
        return Math.ceil(i);
    } else{
        return Math.ceil(await ns.growthAnalyze( server, amount, 1));
    }
};
async function getHackThreads( ns, server, amount){
    let pct= 0;
    if( ns.fileExists( 'formulas.exe')){
        let s = await ns.getServer( server);
        pct = ns.formulas.hacking.hackPercent( s, await ns.getPlayer());
    } else {
        pct = ns.hackAnalyze( server);
    }
    return Math.ceil(amount/pct);
};
async function getWeakenThreads( ns, server, amount){
    let pct= ns.weakenAnalyze( 1, 1);
    return amount/ pct;
};
async function getHackChance( ns, server){
    if( ns.fileExists( 'formulas.exe')){
        return await ns.formulas.hacking.hackChance( ns.getServer( server), ns.getPlayer());
    } else {
        return ns.hackAnalyzeChance( server);
    }
};
async function getHackTime( ns, server){
    if( ns.fileExists( 'formulas.exe')){
        let s = await ns.getServer( server);
        s.hackDifficulty = s.minDifficulty;
        return ns.formulas.hacking.hackTime( s, await ns.getPlayer());
    } else {
        return ns.getHackTime( server);
    }
};
async function getGrowTime( ns, server){ // Done?
    if( ns.fileExists( 'formulas.exe')){
        let s = await ns.getServer( server);
        s.hackDifficulty = s.minDifficulty;
        return await ns.formulas.hacking.growTime( await ns.getServer( server), await ns.getPlayer());
    } else{
        return await ns.getGrowTime( server);
    }
};
async function getWeakenTime( ns, server){
    if( ns.fileExists( 'formulas.exe')){
        let s = await ns.getServer( server);
        //s.hackDifficulty = s.minDifficulty;
        return ns.formulas.hacking.weakenTime( s, await ns.getPlayer());
    } else {
        return ns.getWeakenTime( server);
    }
}
async function getHackExp( ns, server){
    if( ns.fileExists( 'formulas.exe')){

    } else {
        
    }
}
async function deliverAndRun( ns, method, toServer, target, threads, time){
    let fileName= Math.ceil(Math.random()*1000000)+method+".script";
    await ns.write( fileName, "while( Date.now()< args[1]){ sleep( 5); };"+method+ '( args[0])');
    await ns.scp( fileName, toServer, 'home');

    let pid= await ns.exec( fileName, toServer, threads, target, time, Math.random());
    if( !pid){
        ns.printf('Failed to execute...?');
        //await deliverAndRun( ns, method, toServer, target, threads, time);
        return false;
    } else {
        ns.printf('[%s]-%s@ %s', method, target, new Date(time).toLocaleTimeString("en-US"));
        /*
            run attackWatcher.js here

        */
        //await ns.tail( pid);
    }
    return true;
};
async function allocateAttack( ns, server, method, threads, dedicatedServers, time){
    if(time== undefined){
        time= 0;
    };
    threads= Math.ceil( threads);
    //ns.printf( "%s %s", method, threads);
    if (threads< 1){
        return false, ns.tprint("Attempt Allocated Non-Needed Attack");
    } else {
        threads = Math.ceil(threads);
    };
    let target = server
    let serversUsed = 0;
    let threadsUsed = 0;
    for( let i=0; i< dedicatedServers.length; ++i) {
        if( threadsUsed>= threads){
            return {ret: true};
        };
        //ns.printf("%s/%s",threadsUsed,threads);
        let thisServer = dedicatedServers[i];
        let availableRam = await ns.getServerMaxRam(thisServer) - await ns.getServerUsedRam(thisServer);
        if( !availableRam< 1.75) { // if server has more Ram than Maximum payload size
            let threadsForThis = Math.floor(Math.min(threads-threadsUsed, availableRam/ ns.getScriptRam( method+'.script')));
            if( threadsForThis>= 1){//&& threadsUsed+ threadsForThis <= threads){
                await deliverAndRun( ns, method, thisServer, target, threadsForThis, time);
                threadsUsed= threadsUsed+ threadsForThis;
                if( threadsUsed== threads){
                    return {ret: true};
                };
            };
        }
    }
    return {ret: false, threadsLeft: (threads- threadsUsed)}; // Couldnt allocate all threads
};
async function prepareServer( ns, server, dedicatedServers, startedHacking){
    let serverInfo = await ns.getServer( server);
    let player = await ns.getPlayer();

    //ns.printf("Preparing %s", server);
    while( (await ns.getServerMoneyAvailable( server)!= serverInfo.moneyMax|| await ns.getServerSecurityLevel( server)!= serverInfo.minDifficulty)){ // While where not at Full health & full cash
        /*
            Calculate both Grow and Weaken threads here
                and run as a Timed Batch
        */
        while( await ns.getServerSecurityLevel( server)!= serverInfo.minDifficulty&& !startedHacking){ // Force full grow before progressing;
            ns.printf("Net Security: %s", await ns.getServerSecurityLevel( server)- serverInfo.minDifficulty);
            let weakenThreadsNeeded = Math.ceil(( await ns.getServerSecurityLevel( server)- serverInfo.minDifficulty)/ await ns.weakenAnalyze(1, 1))* 1.25;
            let weakenTimeNeeded = await getWeakenTime( ns, server, player);
            let weakenFinishTime = new Date( weakenTimeNeeded+ Date.now());
            let ran = await allocateAttack( ns, server, 'weaken', weakenThreadsNeeded, dedicatedServers);
            ran.ret? ns.printf("Allocated all %s Threads Needed", weakenThreadsNeeded): ns.printf("ERROR Could'nt Allocate All Threads Needed. R[%s/%s]", ran.threadsLeft, weakenThreadsNeeded);
            let weakenTimeMinutes = Math.ceil((weakenThreadsNeeded/ 1000)/ 60);
            let weakenTimeSeconds = Math.ceil((weakenTimeNeeded/ 1000)% 60);
            ns.printf("Time till weaken: %s m %s s", weakenTimeMinutes, weakenTimeSeconds);
            ns.printf("INFO Completion At: %s", weakenFinishTime.toLocaleTimeString('en-US'));
            await ns.sleep(weakenTimeNeeded+350);
        };
        let growThreadsNeeded= Math.ceil( await ns.growthAnalyze( server, await ns.getServerMaxMoney( server)/ await ns.getServerMoneyAvailable( server)))* 1.125;
        if( growThreadsNeeded>= 1){
            ns.tprint("Grow Threads Needed: "+growThreadsNeeded);
            let growTimeNeeded= await getGrowTime( ns, server, player);
            let growFinishTime= new Date( growTimeNeeded+ Date.now());
            let ran = await allocateAttack( ns, server, 'grow', growThreadsNeeded, dedicatedServers);
            ran.ret? ns.printf("Allocated all %s Threads Needed", growThreadsNeeded): ns.printf("ERROR Could'nt Allocate All Threads Needed. R[%s/%s]", ran.threadsLeft, growThreadsNeeded);
            let growTimeMinutes= Math.ceil(( growThreadsNeeded/ 1000)/ 60);
            let growTimeSeconds= Math.ceil(( growTimeNeeded/ 1000)% 60);
            ns.printf("Time till grow: %s m %s s", growTimeMinutes, growTimeSeconds);
            ns.printf("INFO Completion At: %s", growFinishTime.toLocaleTimeString('en-US'));
            await ns.sleep( growTimeNeeded+350); // Make sure threads finished;
        }
    };
    ns.printf("Prepared %s", server);
};
async function getQuickestTarget( ns, list, serverDetails){

}
export async function main( ns){
    maxSlaveRam = 0;
    ns.disableLog("ALL");
    ns.clearLog();
    let args = ns.args;
    let servers = await getServers( ns);
    
    function getServerDetails( name){
        return servers.serverDetails.at(servers.servers.indexOf(name));
    };
    
    ns.tail();
    //ns.printf( "Servers: %s\nSlaves[%s/%sgb]: %s\nTargets[%s]: %s", servers.servers.length, servers.slaves.length, maxSlaveRam, servers.slaves, servers.targets.length, servers.targets );
    ns.printf( "Servers: %s\nSlaves: %s-%s\nTargets: %s\n\n", servers.servers.length, servers.slaves.length, maxSlaveRam, servers.targets.length);
    //for(let i= 0; i< servers.targets.length; i++){
        //    ns.printf( JSON.stringify( getServerDetails(servers.targets[i]))+"\n\n");
    //}

    
    let target = 'nectar-net';

    await prepareServer( ns, target, servers.slaves, false);
    ns.printf("Target: %s", target);
    //do {
        // Batching
        // Accurate
        let getS = Date.now();
        let hackThreadsNeeded = await getHackThreads( ns, target, .5);
        let hackSecurityIncrease = await ns.hackAnalyzeSecurity( hackThreadsNeeded, target, 1);
        let hackWeakenThreads = Math.ceil( await getWeakenThreads( ns, target, hackSecurityIncrease));
        let hackTime = await getHackTime( ns, target);
        let weakenTime = await getWeakenTime( ns, target);
        ns.printf("Hack threads needed: %s", await getHackThreads( ns, target, .5));
        ns.printf("Hack Weak threads needed: %s/%s", hackWeakenThreads, hackSecurityIncrease);
        ns.printf('Hack Time: %s', hackTime);
    
        // Accurate
        let growThreadsNeeded = await getGrowThreads( ns, target, 2);
        let growSecurityIncrease = await ns.growthAnalyzeSecurity( growThreadsNeeded, target, 1 );
        let growWeakenThreads = growThreadsNeeded/12.5;//Math.ceil(await getWeakenThreads( ns, target, growSecurityIncrease));
        let growTime = await getGrowTime( ns, target);
        ns.printf("Grow threads needed: %s", growThreadsNeeded);
        ns.printf("Grow Weak threads needed: %s/%s", growWeakenThreads,await ns.growthAnalyzeSecurity( 1000, 'nectar-net', 1 ));
    
        while( await ns.sleep(1500)) {
            let start = Date.now();
            let end =  start+ (weakenTime+ 200);
            ns.printf("GrowTime: %s\nHackTime: %s\nWeakenTime: %s", Math.ceil(growTime/1000), Math.ceil(hackTime/1000), Math.ceil(weakenTime/1000));
            ns.printf("GrowThreads: %s\nHackThreads: %s\nWeakenThreadsHack: %s\nWeakenThreadsGrow: %s", growThreadsNeeded, hackThreadsNeeded, growWeakenThreads, hackWeakenThreads)
            ns.printf("Start Date: %s\nEnd Date: %s", new Date(start).toLocaleTimeString('EN-us'), new Date(end).toLocaleTimeString('EN-us'));
        
            let hackFinish = (end-hackTime)-500;
            let weakenFinishA = (end-weakenTime)-400;
            let growFinish = (end-growTime)-300;
            let weakenFinishB = (end-weakenTime)-200;
        
            await allocateAttack( ns, target, "hack", hackThreadsNeeded, servers.slaves, hackFinish);
            await allocateAttack( ns, target, "weaken", hackWeakenThreads, servers.slaves, weakenFinishA);
            await allocateAttack( ns, target, "grow", growThreadsNeeded, servers.slaves, growFinish);//
            await allocateAttack( ns, target, "weaken", growWeakenThreads, servers.slaves, weakenFinishB);

            ns.printf("%s", Date.now()- getS);
        }
    //} while (true);


    // Might need to add Security Difference Identifer for Grow/Weaken Threads


}
