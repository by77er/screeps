enum HarvestState { Harvesting, Delivering };
type HarvestMemory = CreepMemory & {
    harvestState: HarvestState | undefined;
    harvestTarget: Id<Source> | undefined;
};

export interface HarvestCreep extends Creep {
    memory: HarvestMemory;
}

export function harvest(creep: HarvestCreep) {
    const mem = creep.memory;
    if (mem.harvestState === undefined) {
        mem.harvestState = HarvestState.Harvesting;
    }
    // State transitions
    if (mem.harvestState === HarvestState.Harvesting && creep.store.getFreeCapacity() === 0) {
        mem.harvestState = HarvestState.Delivering;
    } else if (mem.harvestState === HarvestState.Delivering && creep.store.getUsedCapacity() === 0) {
        mem.harvestState = HarvestState.Harvesting;
    }
    // State actions
    switch (mem.harvestState) {
        case HarvestState.Harvesting:
            harvestEnergy(creep);
            break;
        case HarvestState.Delivering:
            deliverEnergy(creep);
            break;
    }
}

function harvestEnergy(creep: HarvestCreep) {
    const mem = creep.memory;
    let source = Game.getObjectById(mem.harvestTarget as Id<Source>);
    if (source === null) {
        const sources = creep.room.find(FIND_SOURCES);
        const closestSafeSource = creep.pos.findClosestByPath(sources, { filter: s => s.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length === 0 })!;
        mem.harvestTarget = closestSafeSource.id;
        source = closestSafeSource;
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

function deliverEnergy(creep: HarvestCreep) {
    creep.memory.harvestTarget = undefined;
    const spawns = creep.room.find(FIND_MY_SPAWNS);
    if (spawns[0].store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        const controller = creep.room.controller;
        if (controller === undefined) {
            return;
        }
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    } else {
        if (creep.transfer(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawns[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }
    
}