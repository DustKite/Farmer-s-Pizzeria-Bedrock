var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

import { system, BlockPermutation, ItemStack } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { ItemUtil } from "../lib/ItemUtil_old";
import { FORWARD_RECIPES, REVERSE_RECIPES } from "../datas/DoughRecipes";

export class Dough {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
    }

    onPlayerInteract(args) {
        const { block, player, dimension } = args;
        const blockId = block.typeId;
        const inventory = player?.getComponent("inventory");
        if (!inventory) return;

        const container = inventory.container;
        const slot = player.selectedSlotIndex;
        const itemStack = container.getItem(slot);

        if (player.isSneaking && !itemStack) {
            const undo = REVERSE_RECIPES.get(blockId);
            if (undo) {
                const facing = block.permutation.getState("minecraft:cardinal_direction");
                let prevPerm = BlockPermutation.resolve(undo.prev);
                if (undo.prev === "farmerspizzeria:dough") {
                    prevPerm = prevPerm.withState("farmerspizzeria:dough_stage", 2);
                }
                if (facing !== undefined) {
                    try { prevPerm = prevPerm.withState("minecraft:cardinal_direction", facing); } catch (e) { }
                }

                block.setPermutation(prevPerm);
                dimension.spawnItem(new ItemStack(undo.give, 1), {
                    x: block.location.x + 0.5,
                    y: block.location.y + 0.5,
                    z: block.location.z + 0.5
                });
                dimension.playSound("mob.slime.big", block.center());
                return;
            }
        }

        if (!itemStack) return;
        const heldItemId = itemStack.typeId;

        if (blockId === "farmerspizzeria:dough") {
            const stage = block.permutation.getState("farmerspizzeria:dough_stage");
            if (stage < 2) {
                if (heldItemId === "farmerspizzeria:rolling_pin") {
                    block.setPermutation(block.permutation.withState("farmerspizzeria:dough_stage", stage + 1));
                    dimension.playSound("mob.slime.big", block.center());
                }
                return;
            }
        }

        const availableRecipes = FORWARD_RECIPES.get(blockId);
        if (availableRecipes) {
            const matchRecipe = availableRecipes.get(heldItemId);
            if (matchRecipe) {
                this.apply(block, matchRecipe.to, player, container, slot, matchRecipe.returns);
            }
        }
    }

    apply(block, nextId, player, container, slot, returnItemId) {
        const facing = block.permutation.getState("minecraft:cardinal_direction");
        let nextPerm = BlockPermutation.resolve(nextId);
        if (facing !== undefined) {
            try { nextPerm = nextPerm.withState("minecraft:cardinal_direction", facing); } catch (e) { }
        }

        block.setPermutation(nextPerm);
        block.dimension.playSound("mob.slime.big", block.center());

        if (nextId.includes("raw_")) {
            const count = Math.floor(Math.random() * 2) + 3;
            for (let i = 0; i < count; i++) {
                block.dimension.spawnParticle("minecraft:villager_happy", {
                    x: block.location.x + 0.2 + Math.random() * 0.6,
                    y: block.location.y + 0.4,
                    z: block.location.z + 0.2 + Math.random() * 0.6
                });
            }
        }

        if (player && player.getGameMode().toLowerCase() !== "creative") {
            if (returnItemId) {
                block.dimension.spawnItem(new ItemStack(returnItemId, 1), player.location);
            }
            ItemUtil.clearItem(container, slot, 1);
        }
    }

    register(args) {
        args.blockComponentRegistry.registerCustomComponent("farmerspizzeria:dough", new Dough());
    }
}

__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Dough.prototype, "register", null);