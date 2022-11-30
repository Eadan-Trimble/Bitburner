/* Batch Analyzer Ports:

1: Target Name
2: IP Address
3: Base Security
4: Min Security
5: Security




aveum PCMatrix:      + 7.77% most stats; 77.7% work money, 13b

*/

function calculateServerGrowth(server, threads, p, cores = 1) {
    const numServerGrowthCycles = Math.max(Math.floor(threads), 0);
  
    //Get adjusted growth rate, which accounts for server security
    const growthRate = 1.03;
    let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
    if (adjGrowthRate > 1.0035) {
      adjGrowthRate = 1.0035;
    }
  
    //Calculate adjusted server growth rate based on parameters
    const serverGrowthPercentage = server.serverGrowth / 100;
    const numServerGrowthCyclesAdjusted =
      numServerGrowthCycles * serverGrowthPercentage * server.serverGrowth;
  
    //Apply serverGrowth for the calculated number of growth cycles
    const coreBonus = 1 + (cores - 1) / 16;
    return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * p.mults.hacking_grow * coreBonus);
};


function Weight(ns, server) {
            if (!server) return 0;

            // Don't ask, endgame stuff
            if (server.startsWith('hacknet-node')) return 0;

            // Get the player information
            let player = ns.getPlayer();

            // Get the server information
            let so = ns.getServer(server);

            // Set security to minimum on the server object (for Formula.exe functions)
            so.hackDifficulty = so.minDifficulty;

            // We cannot hack a server that has more than our hacking skill so these have no value
            if (so.requiredHackingSkill > player.skills.hacking) return 0;

            // Default pre-Formulas.exe weight. minDifficulty directly affects times, so it substitutes for min security times
            let weight = so.moneyMax / so.minDifficulty;

            // If we have formulas, we can refine the weight calculation
            if (ns.fileExists('Formulas.exe')) {
                // We use weakenTime instead of minDifficulty since we got access to it, 
                // and we add hackChance to the mix (pre-formulas.exe hack chance formula is based on current security, which is useless)
                weight = so.moneyMax / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
            }
            else
                // If we do not have formulas, we can't properly factor in hackchance, so we lower the hacking level tolerance by half
                if (so.requiredHackingSkill > player.skills.hacking / 2)
                    return 0;

            return weight;
        }
        const debug = true;

        async function getServerInfo( ns, server){
            if (debug == true) {
                ns.printf("Getting server Information for %s",server.name);
            };

        }
        async function clearSlaveScripts( ns, server) {
            ns.ps( server.name).forEach(script=>{
                ns.kill( script.pid, server.name);
            })
        }
        async function getTargets( ns, minimumHackLevel) {
            let servers = [];

            async function scan( server) {
                if (debug == true) {
                }
                let Scan = ns.scan( server);
                for (let i=0; i <= Scan.length-1; i++ ) {
                    let server = Scan[i];
                    if (!servers.includes( server)) {
                        servers.push( server);
                        let root = false;
                        if (!await ns.hasRootAccess( server)) {
                            try {
                                ns.sqlinject( server)
                            } catch {};
                            try {
                                ns.httpworm( server);
                            } catch {};
                            try {
                                ns.relaysmtp( server);
                            } catch {};
                            try {
                                ns.ftpcrack( server);
                            } catch {};
                            try {
                                ns.brutessh( server);
                            } catch {};
                            try {
                                ns.nuke( server);
                            } catch {};
                            if(await ns.hasRootAccess( server)) {
                                ns.printf( "ROOT ACCESS GAINED FOR {%s}", server);
                                root = true;
                            };
                        } else { root = true };
                        await scan( server);
                    }
                };
            };

            await scan('home');

            return servers;
        }

        // omega-net, sigma-cosmetics, harakiri-sushi
        export async function main( ns) {
            await ns.rm('hack-run-once.script','home');
            await ns.rm('grow-run-once.script','home');
            await ns.rm('weaken-run-once.script','home');
            await ns.write('hack-run-once.script',"hack(args[0])",'W');
            await ns.write('weaken-run-once.script',"weaken(args[0])",'W');
            await ns.write('grow-run-once.script',"grow(args[0])",'W');
            ns.disableLog( "ALL");
            ns.clearLog();
            ns.printf( "Bot Test 1"); // [OLYMPUS] Server Started.
            
            // Get Server List;
            let servers = await getTargets(ns);
            /*servers.push('_'); // Manually adding personal servers cuz broke?
            servers.push('_-0');
            servers.push('_-1'); // it fixed itself?
            servers.push('_-2');
            servers.push('_-3');*/
            
            let slaves = [];
            let totalSlaveRam = 0;
            let allocatedSlaves = [];
            let targets = [];
            let primedTargets = [];
            let hacks = [
                {
                    target: 'foodnstuff',
                    action: 'weaken',
                    time: Date.now(),
                    finish: Date.now()+10000,
                },
            ];
            async function AllocateSlaves(command, target, threadsNeeded){ // PSUEDO-CODE
                if (threadsNeeded< 1|| threadsNeeded== undefined){
                    return 0;
                }
                ns.printf('ERROR Allocating slaves. target [%s] | command [%s] | threads [%s]',target, command, threadsNeeded);
                let threadsAllocated = 0;
                let slavesPassed = 0;
                let commandRam = ns.getScriptRam(command+'-run-once.script');
                ns.tprint('Command Ram:'+ commandRam);
                do {
                    slavesPassed++;
                    if (slavesPassed >= slaves.length || slaves[slavesPassed] == undefined){
                        return false;
                    };
                    let threadsPossible = Math.floor((ns.getServerMaxRam(slaves[slavesPassed])- ns.getServerUsedRam(slaves[slavesPassed]))/commandRam);
                    threadsPossible = Math.min(threadsPossible,threadsNeeded- threadsAllocated);
                    if (threadsPossible >= 1) {
                        
                        await ns.exec(command+'-run-once.script',slaves[slavesPassed], threadsPossible,target);
                        threadsAllocated+= threadsPossible; 
                        //ns.printf("WARN %s hosted [%s/%%%s/%s] threads", slaves[slavesPassed], threadsPossible, Math.floor((threadsPossible/threadsNeeded)*10000)/100, threadsNeeded);
                        //ns.printf("WARN %s hosted [%s/%%%s/%s] threads", slaves[slavesPassed], threadsPossible, Math.floor((threadsAllocated/threadsNeeded)*10000)/100, threadsNeeded);
                    }
                } while (threadsAllocated < threadsNeeded)
                ns.printf("INFO 100%% of threads allocated for %s.", command);
                return true;
            };

            for ( let i=0; i<servers.length; i++){
                if (await ns.hasRootAccess( servers[i])|| await ns.getServer( servers[i]).purchasedByPlayer){
                    // Get Slave Servers
                    if (await ns.getServerMaxRam( servers[i])> 0){
                        totalSlaveRam+= await ns.getServerMaxRam(servers[i]);
                        slaves.push(servers[i]);
                        ns.scp(['hack-run-once.script','weaken-run-once.script','grow-run-once.script'],servers[i],'home');
                        ns.tprint('Slave: %s',servers[i]);
                    };
                    // Get Hackable Servers
                    if (await ns.getServerRequiredHackingLevel( servers[i])<= await ns.getPlayer().skills.hacking&& !await ns.getServer(servers[i]).purchasedByPlayer ) {
                        let Server = {
                            weight: await Weight( ns, servers[i]),
                            name: servers[i],
                        };
                        targets.push(Server);
                    }
                }
            }
            targets.sort((a,b)=>{

                if (ns.getServerMinSecurityLevel(a.name)- ns.getServerSecurityLevel(a.name)< ns.getServerMinSecurityLevel(b.name)- ns.getServerSecurityLevel(b.name)) { // if a looses
                    return 1; // Most security on top
                } else { // if a wins
                    return -1; // Most security on botton
                }
                return 0;
            });
            for ( let i=targets.length-1; i>=0; i--) {
                ns.printf('Best Target: #%s %s',targets.length-i, targets[i].name);
            }
            ns.printf('INFO Total Slave Ram Available %s', totalSlaveRam);
            ns.printf('INFO Total Slaves Online %s', slaves.length);
            let target = targets.pop();
            let weakenAnalyze = ns.weakenAnalyze(1,1);
            do {
                //target = {name: 'harakiri-sushi'};
                ns.tprint(target.name);
                do {
                    // Weaken&&Grow Fully first... Optimize? w batching?
                    do {
                        do {
                            let threadsNeeded= Math.ceil(( ns.getServerSecurityLevel( target.name)- ns.getServerMinSecurityLevel( target.name))/ weakenAnalyze);
                            if (threadsNeeded> 0) {
                                ns.tprint(ns.getServerSecurityLevel( target.name),ns.getServerMinSecurityLevel( target.name)/.86);
                                let weakenSleepTime = ns.getWeakenTime(target.name); // ms
                                let finishDate = new Date( Date.now()+ weakenSleepTime);
                                let weakenSleepTimeMinutes = Math.floor(( weakenSleepTime/ 1000)/ 60);
                                let weakenSleepTimeSeconds = Math.floor(( weakenSleepTime/ 1000)% 60);
                                // Send Weaken Command
                                await AllocateSlaves( 'weaken', target.name, threadsNeeded);
                                ns.printf( 'INFO Time for weaken: '+ weakenSleepTimeMinutes+'m'+' '+ weakenSleepTimeSeconds+'s');
                                ns.printf( 'INFO Finish Time: '+finishDate.toLocaleTimeString('en-US'));
                                await ns.sleep( weakenSleepTime+ 250);
                                ns.printf( "Weaken time security check: %s",( ns.getServerSecurityLevel(target.name)- ns.getServerMinSecurityLevel( target.name)));
                            } else {
                                ns.printf( 'Target: %s already Weakened', target.name);
                            }
                        } while ( await ns.getServerSecurityLevel( target.name)> await ns.getServerMinSecurityLevel( target.name));//(ns.getServerSecurityLevel( target.name)!= ns.getServerMinSecurityLevel( target.name));
                        if ( await ns.getServerMaxMoney( target.name)- await ns.getServerMoneyAvailable(target.name) !=0){
                            let threadsNeeded= Math.ceil( await ns.growthAnalyze(target.name, (await ns.getServerMaxMoney(target.name)- await ns.getServerMoneyAvailable(target.name)),1));
                            if (threadsNeeded) {
                                ns.printf("ERROR What the error. threads %s, ServerMoneyAvailable %s, ServerMaxMoney %s", threadsNeeded, await ns.getServerMoneyAvailable(target.name), await ns.getServerMaxMoney(target.name));
                                let growSleepTime = ns.getGrowTime( target.name); // mili-seconds
                                let finishDate = new Date( Date.now()+ growSleepTime);
                                let growSleepTimeMinutes = Math.floor(( growSleepTime/ 1000)/ 60);
                                let growSleepTimeSeconds = Math.floor(( growSleepTime/ 1000)% 60);
                                await AllocateSlaves( 'grow', target.name, threadsNeeded);
                                ns.printf( "Calc server Growth %s newthreads %s", calculateServerGrowth(ns.getServer( target.name), threadsNeeded, await ns.getPlayer(), 1), Math.ceil( threadsNeeded/ calculateServerGrowth(ns.getServer( target.name), threadsNeeded, await ns.getPlayer(), 1)));
                                ns.print( 'INFO Time for grow: '+ growSleepTimeMinutes+ 'm'+ ' '+ growSleepTimeSeconds+ 's');
                                ns.print('INFO Finish Time: '+finishDate.toLocaleTimeString('en-US'));
                                await ns.sleep( growSleepTime+ 250);
                                ns.printf( "Grow time security check: %s", await ns.getServerMaxMoney( target.name)- await ns.getServerMoneyAvailable( target.name))
                                ns.printf( "Calc server Growth2 %s", calculateServerGrowth(ns.getServer( target.name), 100, ns.getPlayer(), 1));
                            };
                        } else {
                            ns.printf('Target: %s already Grown bal(%s)', target.name, await ns.getServerMoneyAvailable( target.name));
                        }
                        await ns.sleep(1500);
                    } while ( await ns.getServerMaxMoney( target.name)- await ns.getServerMoneyAvailable( target.name)!= 0&& await ns.getServerSecurityLevel( target.name)- await ns.getServerMinSecurityLevel( target.name)!= 0);
                    ns.printf('wtf is going on here... Money diff (%s), Security Diff (%s)', await ns.getServerMaxMoney( target.name)- await ns.getServerMoneyAvailable( target.name), await ns.getServerSecurityLevel( target.name)- await ns.getServerMinSecurityLevel( target.name));
                    
                    const desiredCompletionCycle = 300;
                    const maxRam= totalSlaveRam;//Already defined
                    
                    let hackThreadsNeeded = await ns.hackAnalyzeThreads( target.name, ( await ns.getServerMaxMoney( target.name)*.25));//( await ns.getServerMaxMoney( target.name)*.25)/ await ns.hackAnalyze( target.name);
                    //let hackChance = await ns.hackAnalyzeChance( target.name);
                    //let hackSleepTime = await ns.getHackTime( target.name);
                    //let finishDate = new Date( Date.now()+ hackSleepTime);
                    await AllocateSlaves( 'hack', target.name, hackThreadsNeeded);
                    /*
                    // Grow
                    // Send ONE Grow Command for    
                    let batchAttackRamCost = 1500;


                    let growThreadsNeeded= Math.ceil();
                    let weakenThreadsNeeded= Math.ceil();
                    let growSleepTime = ns.getGrowTime(target.name);
                    let weakenSleepTime = ns.getWeakenTime(target.name);
                    let differenceInTime = Math.abs(growSleepTime- weakenSleepTime);
                    if (growSleepTime > weakenSleepTime) { // if it takes longer for grow to finish

                    } else { // if it takes longer for weaken to finish

                    }
                    //
                    //


                    AllocateSlaves('grow', target.name, threadsNeeded);


                    */


                } while(false);//while ( ns.getServerMoneyMax(target.name)!= ns.getServerMoneyAvailable(target.name)&& ns.getServerSecurityLevel(target.name)!= ns.getServerMinSecurityLevel(target.name));
                targets.unshift(target);
                target = targets.pop();
            } while(targets.length != 0)//while (targets.filter(a=> ns.getServerMoneyMax(a.name)== ns.getServerMoneyAvailable(a.name)&& ns.getServerSecurityLevel(a.name)== ns.getServerMinSecurityLevel(a.name)));
            //*/
            /*
            repeat {
                // Lower Security and Grow to max

            } until (targets.filter(a=>await ns.getServerMoneyMax(a.name) == ns.getServerMoneyAvailable(a.name) && ns.getServerSecurityLevel(a.name) == ns.getServerMinSecurityLevel(a.name)))

            for ( let i=targets.length-1; i>=0; i--) {
                // Get Threads needed to Hack Target
                // Get Threads needed to Grow Target
                // Get Threads needed to Weaken Target Again

                // Get Time needed to Hack Target
                // Get Time needed to Grow Target
                // Get Time needed to Weaken Target

                Position Attack:

                Time Scaling:
                    Run:
                        SecurityDecrease
                        Grow
                        SecurityDecrease
                        Hack

                    Outcome
                        Hack
                        SecurityDecrease
                        Grow
                        SecurityDecrease
            }


            */

            ns.printf('Current Slaves Available: %s | %s gb\nTarget List: %s\nTotal Servers: %s', slaves.length, totalSlaveRam, targets.length+1, servers.length);
            ns.printf('Current Target: %s', target.name);



        }