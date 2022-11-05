/** @param {NS} ns */

/*
    Ram Funcs:
    scan RAM cost: 0.2 GB
    tprint RAM cost: 0 GB
    scp RAM cost: 0.6 GB
    RAM cost: 0.2 GB
    getServer RAM cost: 2 GB
*/
//const programsActive = ['brutessh'];//, 'ftpcrack', 'relaysmtp', 'httpworm', 'sqlinject']
const programsActive = ['brutessh', 'ftpcrack', 'relaysmtp', 'httpworm', 'sqlinject']

const playerServers = [];
const tooLittleRam = []; // Servers with too little ram, but fat stacks of cash here.
const target = undefined;
const serverList = [];
var serverCount = 0;

function getServerList(ns, curdir) {
    ns.scan(curdir).forEach(function (server) {
        if (!serverList.includes(server) && !ns.getServer(server)['purchasedByPlayer']) {
            var serverInfo = ns.getServer(server);
            var sstorage = ns.ls(server);
            if (!serverInfo['hasAdminRights']) {
                if (programsActive.includes('brutessh')) {
                    ns.brutessh(server);
                }
                if (programsActive.includes('ftpcrack')) {
                    ns.ftpcrack(server);
                }
                if (programsActive.includes('relaysmtp')) {
                    ns.relaysmtp(server);
                }
                if (programsActive.includes('httpworm')) {
                    ns.httpworm(server);
                }
                if (programsActive.includes('sqlinject')) {
                    ns.sqlinject(server);
                }
                serverInfo = ns.getServer(server);
                if (serverInfo['numOpenPortsRequired'] <= serverInfo['openPortCount']) {
                    ns.nuke(server);
                }
                if (ns.hasRootAccess(server)) {
                    ns.tprint('Root gained for: ' + server);
                }
            }
            serverCount = serverList.push(server);
            getServerList(ns, server);
        } else if (!playerServers.includes(server) && ns.getServer(server)['purchasedByPlayer']) {

        };
    });
    return serverList;
}

export async function main(ns) {
    var target = ns.args[0] || 'home';
    var list = getServerList(ns, 'home');
    list.forEach(function(server){
        if (ns.hasRootAccess(server)) {
            /*var sRamUsage = ns.getScriptRam('slave.js')
    var hostMaxRam = ns.getServerMaxRam(ns.getHostname());
    var Threads = Math.floor(ns.getServerMaxRam(hostName)) / sRamUsage;
    */
            var serverInfo = ns.getServer(server);
            var availableRam = serverInfo['maxRam']-serverInfo['ramUsed'] 
            var maxThreads = Math.floor(availableRam/ns.getScriptRam('payload.js'));
            if (maxThreads > 0) {
                if (ns.getServerMaxMoney(server) <= 0) {
                    ns.tprint(server + "Alt Payload Needed");
                    ns.scp('payload.js',server,'home');
                    ns.exec('payload.js',server,maxThreads,target)
                } else {
                    ns.scp('payload.js',server,'home');
                    ns.exec('payload.js',server,maxThreads,server)
                }
            }
        };
    })
    //ns.tprint(serverList);
    //ns.tprint(serverCount);
}
