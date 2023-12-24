import { harvest, HarvestCreep } from './harvest';
import { defend } from './defend';

module.exports.loop = function () {
    const rooms = Object.values(Game.rooms);

    for (const room of rooms) {
        const wanted = wanted_creeps(room);
        const spawns = room.find(FIND_MY_SPAWNS).filter(s => s.spawning === null);
        const harvesters = room.find(FIND_MY_CREEPS).filter(c => c.memory['role'] === 'harvester');
        const defenders = room.find(FIND_MY_CREEPS).filter(c => c.memory['role'] === 'defender');

        if (spawns.length > 0) {
            // if (need_defender(room) && defenders.length < 0) {
            //     spawns[0].spawnCreep([TOUGH, ATTACK, MOVE], 'Defender' + Game.time, { memory: { role: 'defender' } });
            // } else 
            if (harvesters.length < wanted) {
                spawns[0].spawnCreep([WORK, CARRY, MOVE], 'Worker' + Game.time, { memory: { role: 'harvester' } });
            }
        }

        for (const creep of harvesters) {
            harvest(creep as HarvestCreep);
        }

        for (const creep of defenders) {
            defend(creep);
        }
    }
}

function wanted_creeps(room: Room) {
    let wanted_creeps = 0;
    let sources = room.find(FIND_SOURCES);
    for (const source of sources) {
        wanted_creeps += Math.ceil(source.energyCapacity / 3000);
    }
    return wanted_creeps * 2;
}

function need_defender(room: Room) {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    return hostiles.length > 0;
}