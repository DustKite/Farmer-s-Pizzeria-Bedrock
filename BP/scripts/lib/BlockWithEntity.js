import { system } from "@minecraft/server";
import ObjectUtil from "./ObjectUtil";
export class BlockWithEntity {
    //名为setblock实际上是放置对应方块实体的实体，若成功则返回放置的实体
    setBlock(dimension, location, entityId) {
        const entity = dimension.spawnEntity(entityId, location);
        entity.setDynamicProperty("brewinandchewin:blockEntityDataLocation", location);
        entity.setDynamicProperty("brewinandchewin:entityId", entity.id);
        return entity;
    }
    //获取方块实体数据
    entityBlockData(block, opt) {
        const dimension = block.dimension;
        const entities = dimension.getEntitiesAtBlockLocation(opt.location);
        let entityBlock = undefined;
        for (const entity of entities) {
            if (ObjectUtil.isEqual(entity.getDynamicProperty('brewinandchewin:blockEntityDataLocation'), entity.location) &&
                entity.id == entity.getDynamicProperty("brewinandchewin:entityId") &&
                entity.typeId == opt.type) {
                entityBlock = entity;
                break;
            }
            ;
        }
        ;
        if (!entityBlock)
            return undefined;
        const blockEntityDataLocation = entityBlock.getDynamicProperty('brewinandchewin:blockEntityDataLocation');
        return { block: block, dimension: dimension, entity: entityBlock, blockEntityDataLocation: blockEntityDataLocation };
    }
}
export class BlockEntity {
    //获取方块实体数据
    blockEntityData(entity) {
        try {
            const dimension = entity?.dimension ?? undefined;
            const blockEntityDataLocation = entity.getDynamicProperty('brewinandchewin:blockEntityDataLocation');
            const block = dimension.getBlock(blockEntityDataLocation);
            const blockEntityData = { entity: entity, dimension: dimension, blockEntityDataLocation: blockEntityDataLocation, block: block };
            return blockEntityData;
        }
        catch (error) {
            return undefined;
        }
    }
    ;
    //对使用容器组件存储物品的方块实体检测掉落
    entityContainerLoot(args, id) {
        if (!ObjectUtil.isEqual(args.entity.location, args.blockEntityDataLocation))
            args.entity.teleport(args.blockEntityDataLocation);
        if (args.block?.typeId == id)
            return;
        const entity = args.entity;
        const dimension = args.dimension;
        const inventory = entity.getComponent("inventory");
        const container = inventory.container;
        for (let i = 0, length = container.size; i < length; i++) {
            if (i == 5 || i == 7 || i == 8)
                continue;
            const itemStack = container.getItem(i);
            if (itemStack) {
                dimension.spawnItem(itemStack, entity.location);
            }
        }
        ;
        BlockEntity.clearEntity(args);
    }
    ;
    //清除方块实体
    static clearEntity(args) {
        system.runTimeout(() => {
            args.entity.remove();
        });
    }
}
