import { harvest, HarvestCreep } from './harvest';
import { defend } from './defend';

type RoomMemory = {
    sourcemap: { [id: string]: SourceData };
}

type SourceData = {
    workers: number;
    max_workers: number;
}

module.exports.loop = function () {
    for (const room of Object.values(Game.rooms)) {
        const sources = room.find(FIND_SOURCES);
        const source_ids = sources.map(s => s.id);
        const mem = room.memory as RoomMemory;
        if (mem.sourcemap === undefined) {
            mem.sourcemap = {};
        }
        for (const source_id of source_ids) {
            if (mem.sourcemap[source_id] === undefined) {
                let max_workers = Math.ceil(Game.getObjectById(source_id)!.energyCapacity / 3000);
                mem.sourcemap[source_id] = { 
                    workers: 0,
                    max_workers
                };
            }
        }
        for (const [id, data] of Object.entries(mem.sourcemap)) {
            const pos = Game.getObjectById(id as Id<Source>)!.pos;
            pos.y += 1;
            room.visual.text(`workers: ${data.workers}/${data.max_workers}`, pos);
        }

        const ROOM_WIDTH = 50;
        const ROOM_HEIGHT = 50;

        const terrain = Game.map.getRoomTerrain(room.name);
        let minPos = { x: 0, y: 0 };
        let min = Infinity;
        for (let x = 0; x < ROOM_WIDTH; x++) {
            for (let y = 0; y < ROOM_HEIGHT; y++) {
                if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    continue;
                }
                let sum = 0;
                [...sources, room.controller!].map(s => s.pos).forEach(pos => {
                    const distance = Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2);
                    sum += distance;
                });
                if (sum < min) {
                    min = sum;
                    minPos = { x, y };
                }
                room.visual.text(Math.floor(sum/100).toString(), x, y, { opacity: 0.1 });
            }
        }

        room.visual.text('Min', minPos.x, minPos.y);

        const roadPaths = [...sources, room.controller!]
            .map(s => room.findPath(new RoomPosition(minPos.x, minPos.y, room.name), s.pos, { ignoreCreeps: true }))
            .forEach(path => {
                const stepPositions = path.map(step => new RoomPosition(step.x, step.y, room.name));
                room.visual.poly(stepPositions, { stroke: '#00ff00', lineStyle: 'dashed', opacity: 0.3 });
            });
    }
}

function main() {
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