import { defend } from './defend';
import { HarvestCreep, harvest } from './harvest';

export function runRoomStrategy(room: Room) {
    const controller = room.controller;
    if (!controller?.my) {
        return;
    }

    const spawns = room.find(FIND_MY_SPAWNS);
    
    if (spawns.length === 0) {
        // TODO: Request a spawn
        return;
    }

    if (controller.level === 1) {
        rc1(room);
    } else {
        rc1(room);
        // TODO: Implement other room controller levels
    }
}

function rc1(room: Room) {
    const starterCreeps = room.find(FIND_MY_CREEPS, {filter: c => c.memory['role'] === 'starter'});
    const defenderCreeps = room.find(FIND_MY_CREEPS, {filter: c => c.memory['role'] === 'defender'});
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const spawn = room.find(FIND_MY_SPAWNS)[0];

    if (hostiles.length > 0 && defenderCreeps.length < 2) {
        spawn.spawnCreep([ATTACK, MOVE], `defender${Game.time}`, {memory: {role: 'defender'}});
    } else if (starterCreeps.length < 4) {
        spawn.spawnCreep([WORK, CARRY, MOVE], `starter${Game.time}`, {memory: {role: 'starter'}});
    }

    for (const creep of starterCreeps) {
        harvest(creep as HarvestCreep);
    }

    for (const creep of defenderCreeps) {
        defend(creep);
    }
}