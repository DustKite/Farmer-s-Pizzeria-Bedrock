var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { world, system, PlayerBreakBlockBeforeEvent, ItemComponentTypes, StartupEvent, ItemStack, GameMode } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { ItemAPI } from "../lib/ItemAPI";
export class Pizza {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
    }
    playerBreak(args) {
        const { block, itemStack, player } = args;
        if (!(block.typeId.startsWith("farmerspizzeria:") && block.typeId.endsWith("_pizza") && !block.typeId.includes("raw_"))) return;
        const stage = block.permutation.getState('farmerspizzeria:pizza_stage');
        if (stage === undefined || stage === 0) return;
        args.cancel = true;
        const dimension = block.dimension;
        const location = block.location;
        const sliceId = `${block.typeId}_slice`;
        const sliceCount = 4 - stage;
        const hasSilkTouch = itemStack?.getComponent(ItemComponentTypes.Enchantable)?.getEnchantment('silk_touch');
        system.runTimeout(() => {
            const isCreative = player?.getGameMode() === GameMode.Creative;
            if (!isCreative && itemStack) {
                ItemAPI.damageItem(player, player.selectedSlotIndex);
            }
            dimension.setBlockType(location, "minecraft:air");
            if (!isCreative && !hasSilkTouch) {
                const dropItem = new ItemStack(sliceId, sliceCount);
                dimension.spawnItem(dropItem, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
            }
        });
    }
    onPlayerInteract(args) {
        const { block, player, dimension } = args;
        if (!player) return;
        const container = player.getComponent("inventory")?.container;
        if (!container) return;
        const permutation = block.permutation;
        const state = permutation.getState('farmerspizzeria:pizza_stage');
        if (state === undefined) return;
        const { x, y, z } = block.location;
        const sliceId = `${block.typeId}_slice`;
        dimension.playSound("mob.slime.big", { x: x + 0.5, y: y + 0.5, z: z + 0.5 });
        dimension.spawnItem(new ItemStack(sliceId), { x: x + 0.5, y: y + 0.5, z: z + 0.5 });
        if (state >= 3) {
            dimension.setBlockType(block.location, "minecraft:air");
        } else {
            block.setPermutation(permutation.withState('farmerspizzeria:pizza_stage', state + 1));
        }
    }
    register(args) {
        args.blockComponentRegistry.registerCustomComponent('farmerspizzeria:pizza', new Pizza());
    }
}
__decorate([
    EventAPI.register(world.beforeEvents.playerBreakBlock),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlayerBreakBlockBeforeEvent]),
    __metadata("design:returntype", void 0)
], Pizza.prototype, "playerBreak", null);
__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartupEvent]),
    __metadata("design:returntype", void 0)
], Pizza.prototype, "register", null);