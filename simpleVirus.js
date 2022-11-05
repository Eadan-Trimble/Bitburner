export async function main(ns,Targetname,Targetfunc) {
    var pid = ns.getRunningScript()['pid'];
    var hostName = ns.getHostname();
    var maxCash = ns.getServerMaxMoney(hostName);
    var minProtection = ns.getServerMinSecurityLevel(hostName);
    var sRamUsage = ns.getScriptRam('slave.js')
    var hostMaxRam = ns.getServerMaxRam(ns.getHostname());
    var Threads = Math.floor(ns.getServerMaxRam(hostName))/sRamUsage;
    ns.disableLog('scp');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('hack');
    ns.disableLog('exec');
    ns.disableLog('scan');
    ns.disableLog('weaken');
    ns.disableLog('grow');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMoneyAvailable')
    ns.clearLog();
    //ns.printf('Server [%s] \nMax Threads %s \n[Max Ram: %d/Ram Usage: %d]',ns.getHostname(),Threads,hostMaxRam,sRamUsage);
    ns.tail();
    await ns.resizeTail(450,260,pid);
    ns.scan().forEach(function(Name) {
        var Threads = Math.floor(ns.getServerMaxRam(Name)-ns.getServerUsedRam(Name))/sRamUsage;
        if (Threads > 1 && ns.hasRootAccess(Name) || Name == 'home') {
            ns.scp('slave.js',Name,'home');
            ns.exec('slave.js',Name,Threads,Targetname || hostName);
            ns.printf('Slave [%s] | Threads: %d',Name, Math.floor(Threads));
        };
        if (!ns.hasRootAccess(Name) && ns.getServerRequiredHackingLevel(Name) <= ns.getHackingLevel()) {
            switch(ns.getServerNumPortsRequired(Name)){
                case 0:
                    ns.nuke(Name);
                    ns.scp('slave.js',Name,'home');
                    ns.exec('slave.js',Name,Threads,Targetname || hostName);
                case 1:
                    ns.ftpcrack(Name);
                    ns.nuke(Name);
                    ns.scp('slave.js',Name,'home');
                    ns.exec('slave.js',Name,Threads,Targetname || hostName);
                    ns.printf('Slave [%s] | Threads: %d',Name, Math.floor(Threads));
                case 2:
                    ns.ftpcrack(Name);
                    ns.brutessh(Name);
                    ns.nuke(Name);
                    ns.scp('slave.js',Name,'home');
                    ns.exec('slave.js',Name,Threads,Targetname || hostName);
                    ns.tprint('Computer Hacked! : ' + Name);
                /*case 3:
                    ns.ftpcrack(Name);
                    //ns.brutessh(Name);
                    ns.tprint('Check executable: '+ hostName);
                    ns.printf(' Need 3 open ports. Currently have 2 openers %s %s',hostName,Name);*/
            };
        };
    });
    var runTime = 0
    await ns.sleep(7000);
    ns.resizeTail(420,280,pid);
    while (true || !hostName == 'home') {
        /*
            Get correct screen pos;

        */

        var curProtection = await ns.getServerSecurityLevel(hostName);
        var curCash = await ns.getServerMoneyAvailable(hostName);
        var curGrowth = await ns.getServerGrowth(hostName);
        runTime += 1;
        ns.clearLog();
        ns.printf('Server [%s] | Run [%d]',ns.getHostname(),runTime);
        ns.printf('Protection Level [%s/%s]\nCash Level [$%s/$%s]',curProtection,minProtection, curCash, maxCash);
        ns.printf('Total Results:\nExp Result: %s\nIncome Result: $%s',ns.getTotalScriptExpGain(),Math.floor( await ns.getTotalScriptIncome()/100)*100 || 0);
        ns.printf('=============================\n====H=A=C=K==-==L=O=G=S======\n=============================')
        while (minProtection/curProtection < .6) {// this first
            ns.printf('[%s] Protection level too high.',Targetname || hostName);
            ns.printf('Weakening [%s\'s] Protection\ncur [%s] ideal [%s]',Targetname || hostName,minProtection/curProtection, .6);
            var res = await ns.weaken(Targetname || hostName);
            ns.printf('Weaken Result: %s',(res == 0 && 'Failed' || 'Weakened by %' + res));
            curProtection = await ns.getServerSecurityLevel(await ns.getHostname());
        }
        ns.printf('[%s] Protection level adequately low.',Targetname || hostName);
        while (maxCash/curCash < .6) {
            ns.printf('[%s] Max cash too low.',Targetname || hostName);
            ns.printf('Growing [%s] Bank-Accounts',Targetname || hostName);
            var res = await ns.grow(Targetname || hostName);
            ns.printf('Grow Result: %s',(res == 0 && 'Failed' || 'Weakened by %' + res));
            curCash = await ns.getServerMoneyAvailable(hostName);
        };
        ns.printf('[%s] Cash level adequate.',Targetname || hostName);
        ns.printf('Hacking %s',Targetname || hostName);
        var res = await ns.hack(Targetname || hostName);
        ns.printf('Hacking Result: %s',(res == 0 && 'Failed' || 'Gained - $' + res));
    }
};