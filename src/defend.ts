export function defend(creep: Creep) {
    const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (target !== null) {
        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
}