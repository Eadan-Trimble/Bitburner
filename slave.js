// slave Installer;

var DisName = 'silver-helix';

var Installs = ['slave.js','init.js','server.txt'];
var PortO = ['BruteSSH.exe','FTPCrack.exe'];
async function Slave(ns,name) {
    if (name == undefined) {
        return 'broken link'
    };
    ns.tprint('Executing slave program:' + name);
    while (true) {
        while (true) {
              await ns.weaken(DisName);
              await ns.grow(DisName);
        };
        while(ns.getServerSecurityLevel(name) * .75 >= ns.getServerMinSecurityLevel(name)) {
            await ns.weaken(name);
        };
        while (ns.getServerMaxMoney(name) * .75 >= ns.getServerMoneyAvailable(name)) {
            await ns.grow(name);
        };
        while(ns.getServerSecurityLevel(name) * .75 >= ns.getServerMinSecurityLevel(name)) {
            await ns.weaken(name);
        };
    };
};

async function checkRoot(ns) {

    return 'no root';
};
export async function main(ns,name) {
    name = ns.args[0];
    if (name == undefined) {
        name = 'home';
    };
    ns.scan().forEach(function(Name) {
        ns.scp('slave.js',Name,'home');
        if (Math.floor((ns.getServerMaxRam(Name)-ns.getServerUsedRam(Name))/ns.getScriptRam('slave.js')) > 1 && ns.hasRootAccess(Name)) {
            ns.exec('slave.js',Name,(ns.getServerMaxRam(Name)-ns.getServerUsedRam(Name))/ns.getScriptRam('slave.js'),Name);
            ns.tprint('Created slave: ' + Name);
        };
    });
    if (ns.hasRootAccess(name)) {
        await ns.share();
        ns.tprint(ns.getSharePower());
     await Slave(ns,name);
    };
};
