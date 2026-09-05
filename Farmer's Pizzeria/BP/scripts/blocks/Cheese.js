var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { world, system, StartupEvent, PlayerBreakBlockBeforeEvent, ItemComponentTypes, ItemStack, PlayerInteractWithBlockAfterEvent, GameMode } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { ItemAPI } from "../lib/ItemAPI";
export class DorbluCheese {
    unripe(args) {
        args.blockComponentRegistry.registerCustomComponent('farmerspizzeria:unripe_cheese', {
            onRandomTick: ({ block }) => {
                if (block.typeId !== "farmerspizzeria:unripe_dorblu_cheese_wheel") return;
                const face = block.permutation.getState("minecraft:cardinal_direction");
                block.dimension.setBlockType(block.location, "farmerspizzeria:dorblu_cheese_wheel");
                block.dimension.setBlockPermutation(block.location, block.permutation.withState("minecraft:cardinal_direction", face));
            }
        });
    }
    playerBreak(args) {
        const { block, itemStack, player } = args;
        if (block.typeId !== "farmerspizzeria:dorblu_cheese_wheel") return;
        const stage = block.permutation.getState("farmerspizzeria:cheese_stage");
        if (stage === undefined || stage === 0) return;
        args.cancel = true;
        const dimension = block.dimension;
        const location = block.location;
        const wedgeId = "farmerspizzeria:dorblu_cheese_wedge";
        const wedgeCount = 4 - stage;
        const hasSilkTouch = itemStack?.getComponent(ItemComponentTypes.Enchantable)?.getEnchantment('silk_touch');
        system.runTimeout(() => {
            const isCreative = player?.getGameMode() === GameMode.Creative;
            if (!isCreative && itemStack) {
                ItemAPI.damageItem(player, player.selectedSlotIndex);
            }
            dimension.setBlockType(location, "minecraft:air");
            if (!isCreative && !hasSilkTouch) {
                const dropItem = new ItemStack(wedgeId, wedgeCount);
                dimension.spawnItem(dropItem, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
            }
        });
    }
    use(args) {
        const { block, player } = args;
        if (!player || block.typeId !== "farmerspizzeria:dorblu_cheese_wheel") return;
        const inventory = player.getComponent("inventory")?.container;
        const itemStack = inventory?.getItem(player.selectedSlotIndex);
        if (!inventory) return;
        if (itemStack?.hasTag("farmersdelight:is_knife")) {
            const { x, y, z } = block.location;
            const stage = block.permutation.getState("farmerspizzeria:cheese_stage");
            block.dimension.spawnItem(new ItemStack("farmerspizzeria:dorblu_cheese_wedge"), block.location);
            player.playSound("use.cloth");
            if (stage !== 3) {
                block.setPermutation(block.permutation.withState("farmerspizzeria:cheese_stage", stage + 1));
                if (player?.getGameMode() != GameMode.Creative) {
                    ItemAPI.damageItem(player, player.selectedSlotIndex);
                }
            } else {
                block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
                if (player?.getGameMode() != GameMode.Creative) {
                    ItemAPI.damageItem(player, player.selectedSlotIndex);
                }
            }
        } else {
            player.onScreenDisplay.setActionBar({ translate: 'farmerspizzeria.blockfood.is_knife' });
        }
    }
}
__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartupEvent]),
    __metadata("design:returntype", void 0)
], DorbluCheese.prototype, "unripe", null);
__decorate([
    EventAPI.register(world.beforeEvents.playerBreakBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], DorbluCheese.prototype, "playerBreak", null);
__decorate([
    EventAPI.register(world.afterEvents.playerInteractWithBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerInteractWithBlockAfterEvent]),
    __metadata("design:returntype", void 0)
], DorbluCheese.prototype, "use", null);