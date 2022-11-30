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
    ns.disableLog( "ALL");
    ns.clearLog();
    ns.printf( "Bot Test 1"); // [OLYMPUS] Server Started.
    
    // Get Server List;
    let servers = await getTargets(ns);
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
    async function AllocateSlaves(command, threadsNeeded){ // PSUEDO-CODE
        let threadsAllocated = 0;
        for ( let i=0; i<slaves.length-1; i++){
            let threadsPossible = 0;
            //Server, Filename, Filecontents
            ns.Write(slaves[i].name, command+'.script',command+"(Args[0])");
            threadsAllocated+= threadsPossible;
        }
    };

    for ( let i=0; i<servers.length-1; i++){
        if (await ns.hasRootAccess( servers[i])){
            // Get Slave Servers
            if (await ns.getServerMaxRam( servers[i])> 0){
                totalSlaveRam+= await ns.getServerMaxRam(servers[i]);
                slaves.push(servers[i]);
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
            return -1;
        } else { // if a wins
            return 1;
        }
        return 0;
    });
    for ( let i=targets.length-1; i>=0; i--) {
        ns.printf('Best Target: #%s %s',targets.length-i, targets[i].name);
    }

    let target = targets.pop();

    /*do {
        do {
            // Weaken
            do {
                // Send Weaken Command
                let threadsNeeded;

                AllocateSlaves('weaken', threadsNeeded);
            } while (ns.getServerSecurityLevel(target.name)!= ns.getServerMinSecurityLevel(target.name));

            // Grow
            // Send ONE Grow Command for Threads
            let threadsNeeded;

            AllocateSlaves('grow', threadsNeeded);

        } while ( ns.getServerMoneyMax(target.name)!= ns.getServerMoneyAvailable(target.name)&& ns.getServerSecurityLevel(target.name)!= ns.getServerMinSecurityLevel(target.name));
    } while (targets.filter(a=> ns.getServerMoneyMax(a.name)== ns.getServerMoneyAvailable(a.name)&& ns.getServerSecurityLevel(a.name)== ns.getServerMinSecurityLevel(a.name)));*/
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